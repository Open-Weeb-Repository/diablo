import {AbstractProvider} from "../../commons/abstract-provider";
import {IDBProjectProvider} from "project-providers";
import {IProjectResult} from "project";
import getpage from "../../helpers/getpage";
import moment from "moment";

interface IOptions {
    listEpsUrl: string;
}

export default class AnimeOtakudesuProvider extends AbstractProvider<IOptions>{
    name = "anime_otakudesu";
    async getProviderInfo(): Promise<IDBProjectProvider> {
        const $ = await getpage("https://otakudesu.org/");
        return {
            extraData: undefined,
            language: "Indonesia",
            logo: $(".logo>a>img").attr("src"),
            site: "https://otakudesu.org/",
            title: "Otaku Desu",
            type: "anime",
            workerJobName: this.name
        };
    }

    async parseAndGetOptions(searchParams: string[]): Promise<[IProjectResult, IOptions]> {
        let result: IProjectResult;
        let options: IOptions;
        for (let searchParam of searchParams) {
            const $ = await getpage("https://otakudesu.org/", {
                params: {
                    s: searchParam,
                    post_type: 'anime'
                }
            });
            const searchResult = $(".chivsrc li");
            if (searchResult.length < 1) {
                continue;
            }
            const detailUrl = searchResult.first().find("h2 a").attr("href");
            // getting listEpsUrl
            options = await this.getOptions(detailUrl);
            break;
        }
        if (options) {
            result = await this.parseWithOption(options);
        }
        return [
            result,
            options
        ];
    }

    async getOptions(detailUrl: string): Promise<IOptions> {
        const $ = await getpage(detailUrl);
        const listEpsUrl = $("link[rel='shortlink']").attr("href");
        if (!listEpsUrl) {
            return null;
        }
        return {
            listEpsUrl: `https://otakudesu.org/wp-admin/admin-ajax.php?action=epslist&id=${listEpsUrl.replace(/\D+/g, "")}`
        }
    }

    async parseWithOption(options: IOptions): Promise<IProjectResult> {
        const $ = await getpage(options.listEpsUrl);
        const $lastEps = $("li").first();
        const $anchor = $lastEps.find("a");
        const url = $anchor.attr("href");
        const lastWork = $anchor.text().trim().match(/(Episode [0-9]+)/g);
        return {
            lastUpdated: moment($lastEps.find("span.zeebr").text(), "D MMMM,YYYY", "id", false).toDate(),
            lastWork: lastWork ? lastWork[0] : "Unknown",
            url
        };
    }

}
