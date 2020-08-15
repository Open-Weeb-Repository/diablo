import debug from "debug";
import {Diablo} from "diablo";
import {IDBProjectProvider} from "project-providers";
import getProviderInfo from "./helpers/get-provider-info";
import projectProviderRepo from "../../repositories/project-providers";
import searchProjectByTitle, {parseDetailUrl} from "./helpers/search-project-by-title";
import {IProjectResult} from "project";
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

        return {
            message: "Success",
            status: true,
            options: newOptions,
            project: {
                malId: malId,
                ...this.dbProjectProvider,
                ...searchResult
            }
        }
    }

    async publish(): Promise<boolean> {
        log("Getting provider info");
        this.dbProjectProvider = await getProviderInfo();
        const result = await projectProviderRepo.updateProviders(this.dbProjectProvider);
        return Boolean((result as any).ok);
    }

}
