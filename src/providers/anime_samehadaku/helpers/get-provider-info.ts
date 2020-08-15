import getpage from "../../../helpers/getpage";
import {IDBProjectProvider} from "project-providers";

export default async function (): Promise<IDBProjectProvider> {
    const siteUrl = "https://samehadaku.vip/";
    const $ = await getpage(siteUrl);
    return {
        language: "Indonesia",
        logo: $(".desktop-area .logo > a > img").attr("src"),
        site: siteUrl,
        title: "Samehadaku",
        type: "anime",
        workerJobName: "anime_samehadaku"
    }
}
