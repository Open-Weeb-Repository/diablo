import {IDBProjectProvider} from "project-providers";

export interface IProjectResult {
    lastWork: string;
    lastUpdated: Date;
    url: string;
}

export interface IDBProject extends IProjectResult, IDBProjectProvider {
    malId: string;
}
