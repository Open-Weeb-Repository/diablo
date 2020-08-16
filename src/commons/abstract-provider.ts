import {Diablo} from "diablo";
import {IDBProjectProvider} from "project-providers";
import debug from "debug";
import {IProjectResult} from "project";
import projectProviderRepo from "../repositories/project-providers";

const log = debug("diablo:provider:abstract");

export abstract class AbstractProvider<OPT = any> implements Diablo.IProjectProvider {
    abstract name: string;
    dbProjectProvider: IDBProjectProvider;

    async process(malId: string, searchParam: string[], options: OPT): Promise<Diablo.IProjectProviderResult> {
        this.debugLog("Start Process for malId: %s", [malId]);
        let projectFound: IProjectResult;
        let newOptions: OPT;
        if (options) {
            this.debugLog("saved option found: %o", options);
            projectFound = await this.parseWithOption(options);
            newOptions = options;
        }
        if (!projectFound) {
            [projectFound, newOptions] = await this.parseAndGetOptions(searchParam);
        }
        if (!projectFound) {
            return {
                message: `Project for malId: ${malId} not found`,
                status: false
            }
        }
        return {
            message: "Success",
            status: true,
            options: newOptions,
            project: {
                malId: malId,
                ...this.dbProjectProvider,
                ...projectFound
            }
        }
    }

    async publish(): Promise<boolean> {
        this.debugLog("Getting provider info");
        this.dbProjectProvider = await this.getProviderInfo();
        const result = await projectProviderRepo.updateProviders(this.dbProjectProvider);
        return Boolean((result as any).ok);
    }

    protected debugLog(msg: string, ...args:any[]) {
        log(`${msg} [${this.name}]`, ...args)
    }

    abstract async parseWithOption(options: OPT): Promise<IProjectResult>;

    abstract async parseAndGetOptions(searchParams: string[]): Promise<[IProjectResult, OPT]>;

    abstract async getProviderInfo(): Promise<IDBProjectProvider>;
}
