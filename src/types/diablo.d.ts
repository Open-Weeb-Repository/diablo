export namespace Diablo{
    export interface IProjectProvider{
        name: string;
        publish: ()=>Promise<boolean>;
        process: (malId: string, searchParam: string[], options?: any)=>Promise<IProjectProviderResult>;
    }

    export interface IProjectProviderResult{
        status: boolean;
        message: string;
    }
}

export namespace Commons {
    export interface IHasUpdatedAt{
        updatedAt?: Date;
    }
}
