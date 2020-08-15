import debug from "debug";
import {Diablo} from "diablo";
import {IDBProjectProvider} from "project-providers";
import getProviderInfo from "./helpers/get-provider-info";
import projectProviderRepo from "../../repositories/project-providers";
import projectRepo from "../../repositories/projects";
import searchProjectByTitle, {parseDetailUrl} from "./helpers/search-project-by-title";
import {IDBProject, IProjectResult} from "project";
import {IOptions} from "./types/options";

const log = debug("diablo:provider:anime_samehadaku");

export default class AnimeSamehadakuProvider implements Diablo.IProjectProvider {
    name = "anime_samehadaku";
    dbProjectProvider: IDBProjectProvider;

    async process(malId: string, searchParam: string[], options?: IOptions): Promise<Diablo.IProjectProviderResult> {
        log("Start Process for malId: %s", malId);
        let searchResult: IProjectResult;
        let newOptions: IOptions;
        if (options) {
            log("saved detail url found: %s", options.detailUrl);
            searchResult = await parseDetailUrl(options.detailUrl);
            newOptions = options;
        } else {
            for (let searchQ of searchParam) {
                let detailUrl: string;
                [searchResult, detailUrl] = await searchProjectByTitle(searchQ);
                if (!searchResult) {
                    log("Not found with search %s", searchQ);
                    continue;
                }
                log("Project found with search %s updating option!", searchQ);
                newOptions = {
                    detailUrl: detailUrl
                }
                break;
            }
        }
        if (!searchResult) {
            return {
                message: "All search param not found",
                status: false
            }
        }
        const projectResult: IDBProject = {
            malId: malId,
            ...this.dbProjectProvider,
            ...searchResult
        };
        const existingProject = await projectRepo.findOne(projectResult);
        if (!existingProject) {
            // create new
            log("Project not found in database, create new!");
            await projectRepo.create(projectResult);
        } else {
            // compare last works
            if (existingProject.lastWork === projectResult.lastWork) {
                log("Project %s last work is equal to existing", projectResult.malId);
                return {
                    message: "No new work received",
                    status: false
                }
            }
            log("Update project %s", projectResult.malId);
            await projectRepo.update(projectResult);
        }

        return {
            message: "Success",
            status: true,
            options: newOptions
        }
    }

    async publish(): Promise<boolean> {
        log("Getting provider info");
        this.dbProjectProvider = await getProviderInfo();
        const result = await projectProviderRepo.updateProviders(this.dbProjectProvider);
        return Boolean((result as any).ok);
    }

}
