import getpage from "../../../helpers/getpage";
import {IProjectResult} from "project";
import opLoverParseDate from "./parse-date";

export async function seriesDetail(url: string): Promise<IProjectResult> {
    const $ = await getpage(url);
    const date = opLoverParseDate($(".episodelist ul li span.rightoff").first().text());
    return {
        lastUpdated: date,
        lastWork: $(".latestepisode").text().trim(),
        url: $(".latestnow a").attr("href")
    }
}
