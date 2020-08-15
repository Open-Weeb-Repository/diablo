export namespace DBProjectJob {
    export interface IProjectJob {
        searchParam: SearchParam;
        options: any;
        n_fail: number;
        n_done: number;
        malId: string;
        provider: string;
    }

    export type SearchParam = string[];
}

export namespace DBProjectJobLog{
    export interface IProjectJobLog {
        jobId: string;
        date: Date;
        status: "success" | "fail";
        message: string;
        context?: any;
    }
}
