import {Diablo} from "diablo";

export default class implements Diablo.IProjectProvider{
    name = 'anime_dummy';

    async process(malId: string, searchParam: string[], options: any): Promise<Diablo.IProjectProviderResult> {
        return {
            message: "Just A Fail Dummy",
            status: false
        }
    }

    async publish(): Promise<boolean> {
        return true;
    }

}
