import getpage from "../../../helpers/getpage";
import {IProviderOploverz} from "../types";

export default async function searchSeries(title: string): Promise<IProviderOploverz.ISearchResult | false> {
    const $ = await getpage("https://www.oploverz.in/", {
        params: {
            s: title,
            post_type: 'series'
        }
    });
    const $series = $(".lts ul li .thumb a");
    if ($series.length > 0) {
        return {
            detailUrl: $series.first().attr("href")
        }
    }
    return false;
}
