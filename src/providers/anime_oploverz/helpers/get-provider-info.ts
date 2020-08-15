import getpage from "../../../helpers/getpage";
import {IDBProjectProvider} from "project-providers";

export default async function (): Promise<IDBProjectProvider> {
    const siteUrl = "https://www.oploverz.in/";
    const $ = await getpage(siteUrl);
    return {
        language: "Indonesia",
        logo: $("#header .logo a > img").attr("src"),
        site: siteUrl,
        title: "Oploverz",
        type: "anime",
        workerJobName: "anime_oploverz"
    }
}
