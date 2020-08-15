import {Diablo} from "diablo";
import {IDBProjectProvider} from "project-providers";
import projectProviderRepo from "../../repositories/project-providers";

export default class implements Diablo.IProjectProvider{
    name = 'anime_dummy';

    async process(malId: string, searchParam: string[], options: any): Promise<Diablo.IProjectProviderResult> {
        return {
            message: "Just A Fail Dummy",
            status: false
        }
    }

    async publish(): Promise<boolean> {
        let providerInfo: IDBProjectProvider = {
            extraData: undefined,
            language: "Dummy",
            logo: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
            site: "Dummy",
            title: "Dummy Provider",
            type: "anime",
            workerJobName: this.name
        };
        const result = await projectProviderRepo.updateProviders(providerInfo);
        return Boolean((result as any).ok);
    }

}
