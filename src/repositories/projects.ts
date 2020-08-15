import db from "../commons/db";
import {IDBProject} from "project";
import {Commons} from "diablo";

export const projects = db.get<IDBProject & Commons.IHasCreatedAt>("projects");
projects.createIndex("malId");
projects.createIndex("malId workerJobName");

export default {
    findOne(project: IDBProject) {
        return projects.findOne({
            malId: project.malId,
            workerJobName: project.workerJobName
        })
    },

    create(project: IDBProject) {
        return projects.insert({
            ...project,
            createdAt: new Date()
        });
    },

    update(project: IDBProject) {
        return projects.update({
            malId: project.malId,
            workerJobName: project.workerJobName
        }, {
            $set: project
        })
    }
}
