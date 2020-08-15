import moment from "moment";
import getpage from "../../../helpers/getpage";
import {IProjectResult} from "project";

export default async function searchProjectByTitle(title: string): Promise<[IProjectResult, string] | [null, null]> {
    const $ = await getpage("https://samehadaku.vip/", {
        params: {
            s: title
        }
    });
    const $resultList = $(".animepost");
    if ($resultList.length < 1) {
        return [null, null];
    }
    // todo better way than blindly accept first link
    const detailUrl = $resultList.first().find("a").attr("href");
    const result = await parseDetailUrl(detailUrl);
    return [result, detailUrl];
}



export async function parseDetailUrl(detailUrl: string):Promise<IProjectResult> {
    const $ = await getpage(detailUrl);
    const episode = $(".lstepsiode li").first();
    const $anchor = episode.find(".epsright span.eps a");
    const date = episode.find(".date").text();
    return {
        lastUpdated: moment(`${date} +07:00`, "DD MMMM YYYY Z", "id", true).toDate(),
        lastWork: $anchor.text(),
        url: $anchor.attr("href")
    }
}
