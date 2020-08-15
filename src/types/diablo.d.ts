export namespace Diablo{
    export interface IProjectProvider{
        name: string;
        publish: ()=>Promise<boolean>;
        process: ()=>Promise<IProjectProviderResult>;
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
