import {Diablo} from "diablo";
import projectProviderRepo from "../../repositories/project-providers";
import {IDBProjectProvider} from "project-providers";
import getProviderInfo from "./helpers/get-provider-info";
import debug from "debug";
import {IProviderOploverz} from "./types";
import searchSeries from "./helpers/search-series";
import {seriesDetail} from "./helpers/series-detail";
import {IDBProject} from "project";
import projectRepo from "../../repositories/projects";

const log = debug("diablo:provider:anime_oploverz");

export default class implements Diablo.IProjectProvider{
    name = 'anime_oploverz';
    dbProjectProvider: IDBProjectProvider;

    async process(malId: string, searchParam: string[], options?: IProviderOploverz.IOptions): Promise<Diablo.IProjectProviderResult> {
        log("Start Process for malId: %s", malId);
        let newOptions = options;
        if (!newOptions) {
            for (let searchQ of searchParam) {
                const searchResult = await searchSeries(searchQ);
                if (!searchResult) {
                    continue;
                }
                newOptions = {
                    detailUrl: searchResult.detailUrl
                }
                log("Search \"%s\" found with url %s", searchQ, searchResult.detailUrl);
                break;
            }
            if (!newOptions) {
                log("All search param not found");
                return {
                    message: "All search param not found",
                    status: false
                }
            }
        }
        const seriesDetailResult = await seriesDetail(newOptions.detailUrl);
        const projectResult: IDBProject = {
            malId: malId,
            ...this.dbProjectProvider,
            ...seriesDetailResult
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
        let providerInfo: IDBProjectProvider = await getProviderInfo();
        providerInfo.workerJobName = this.name;
        this.dbProjectProvider = providerInfo;
        const result = await projectProviderRepo.updateProviders(providerInfo);
        return Boolean((result as any).ok);
    }

}
