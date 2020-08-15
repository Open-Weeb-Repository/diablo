import debug from "debug";
import {Diablo} from "diablo";
import {scrapJobQueue} from "./commons/amqp";
import {DiabloMessage} from "diablo.messages";
import projectJobRepository from "./repositories/project-jobs";

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
                console.warn(`Publish will remove ${projectProvidersKey} from provider list`);
            }
        }
    }

    async listen() {
        log("Start listening to %s queue", scrapJobQueue.name);
        await scrapJobQueue.activateConsumer(async message => {
            const content = message.getContent() as DiabloMessage.IScrapeMessage;
            try{
                log("Job %s Received", content._id);
                const provider = this.getProvider(content.provider);
                if (!provider) {
                    // provider not found
                    log("Job %s Having unknown provider \"%s\"", content._id, content.provider);
                    const context = {
                        message: content,
                    };
                    await projectJobRepository.jobFail(content._id, "Unknown provider", context);
                } else {
                    const jobInfo = await projectJobRepository.getById(content._id);
                    const result = await provider.process();
                    const context = {
                        message: content,
                        jobOptions: jobInfo.options,
                        searchParam: jobInfo.searchParam,
                    };
                    if (result.status) {
                        await projectJobRepository.jobSuccess(content._id, result.message, context);
                        log("Job %s Success", content._id);
                    } else {
                        await projectJobRepository.jobFail(content._id, result.message, context);
                        log("Job %s Return Fail with message: ", content._id, result.message);
                    }
                }
                return message.ack();
            }catch (err) {
                /* todo: requeue but limit how much it can be requeued */
                log("Job %s failed", content._id);
                message.reject(true);
            }
        });
    }

    registerProvider(provider: Diablo.IProjectProvider) {
        log("register project provider: %s", provider.name);
        if (this.projectProviders[provider.name]) {
            console.warn(`Provider with name "${provider.name}" already exist, and will be replaced with new.`)
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
