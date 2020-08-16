import debug from "debug";
import {Diablo} from "diablo";
import config from 'config';
import {scrapJobQueue} from "./commons/amqp";
import {DiabloMessage} from "diablo.messages";
import projectJobRepository from "./repositories/project-jobs";
import {Message} from "amqp-ts";
import projectRepo from "./repositories/projects";
import logger from "./commons/logger";

const log = debug('diablo:main');

export class App {
    private projectProviders: { [key: string]: Diablo.IProjectProvider } = {};

    constructor() {
        log('App instance created.');
    }

    async start() {
        await this.publishProviders();
        await this.listen();
    }

    async publishProviders() {
        log("Publish available provider to db");
        for (let projectProvidersKey in this.projectProviders) {
            log("Publish provider: %s", projectProvidersKey);
            const success = await this.projectProviders[projectProvidersKey].publish();
            if (!success) {
                // todo remove fail to publish provider from db
                logger.error(`Publish will remove ${projectProvidersKey} from provider list`);
            }
        }
    }

    async listen() {
        log("Start listening to %s queue", scrapJobQueue.name);
        await scrapJobQueue.activateConsumer(async message => {
            const content = message.getContent() as DiabloMessage.IScrapeMessage;
            try {
                log("Job %s Received", content._id);
                const provider = this.getProvider(content.provider);
                if (!provider) {
                    // provider not found
                    log("Job %s Having unknown provider \"%s\"", content._id, content.provider);
                    const context = {
                        message: content,
                    };
                    await projectJobRepository.jobFail(content._id, "Unknown provider", context);
                    logger.error(`Unknown provider: ${content.provider}`);
                    return;
                }
                const jobInfo = await projectJobRepository.getById(content._id);
                const context = {
                    message: content,
                    jobOptions: jobInfo ? jobInfo.options : undefined,
                    searchParam: jobInfo ? jobInfo.searchParam : content.searchParam,
                };
                const result = await (provider as Diablo.IProjectProvider).process(
                    content.malId,
                    context.searchParam,
                    context.jobOptions
                );
                if (!result.status) {
                    await projectJobRepository.jobFail(content._id, result.message, context);
                    logger.error(`Job "${content._id}" failed: ${result.message}`);
                    return;
                }
                if (!result.project) {
                    const msg = "Scrapping success but no project data returned";
                    await projectJobRepository.jobFail(content._id, msg, context);
                    logger.error(`Job "${content._id}" failed: ${msg}`);
                    return;
                }
                const tasks: Promise<any>[] = [];
                const existingProject = await projectRepo.findOne(result.project);
                if (!existingProject) {
                    // create new
                    log("Project not found in database, create new!");
                    tasks.push(projectRepo.create(result.project));
                } else if (existingProject.lastWork === result.project.lastWork) {
                    log("Project %s last work is equal to existing", result.project.malId);
                    await projectJobRepository.jobFail(content._id, "No new work received", context);
                    logger.error(`Job ${content._id} failed: no new work received`);
                    return;
                } else {
                    log("Update project %s", result.project.malId);
                    tasks.push(projectRepo.update(result.project));
                }
                tasks.push(projectJobRepository.jobSuccess(content._id, result.message, context));
                if (result.options) {
                    tasks.push(projectJobRepository.updateJobOption(content._id, result.options));
                }
                await Promise.all(tasks);
                logger.info(`Job ${content._id} success`);
            } catch (err) {
                const retry = content.retry || 0;
                log("Job %s failed nRetry: %d", content._id, retry);
                if (retry < config.get('queue.maxRetry')) {
                    content.retry = retry + 1;
                    const retryMessage = new Message(content);
                    logger.info(`Job ${content._id} failed: retrying (${retry})`);
                    retryMessage.sendTo(scrapJobQueue);
                } else {
                    const context = {
                        message: content,
                        error: err
                    };
                    logger.info(`Job ${content._id} failed with unknown reason: ${err}`);
                    await projectJobRepository.jobFail(content._id, `Unexpected error with ${retry} retries`, context);
                }
            } finally {
                message.ack();
                log("Job %s Done and ack has been sent", content._id);
            }
        });
    }

    registerProvider(provider: Diablo.IProjectProvider) {
        log("register project provider: %s", provider.name);
        if (this.projectProviders[provider.name]) {
            logger.warn(`Provider with name "${provider.name}" already exist, and will be replaced with new.`)
        }
        this.projectProviders[provider.name] = provider;
    }

    private getProvider(name: string) {
        if (!this.projectProviders[name]) {
            return false;
        }
        return this.projectProviders[name];
    }
}
