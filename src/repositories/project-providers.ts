import db from "../commons/db";
import {IDBProjectProvider} from "project-providers";
import {Commons} from "diablo";

const projectProviders = db.get<IDBProjectProvider & Commons.IHasUpdatedAt & Commons.IHasCreatedAt>('projectProviders');
projectProviders.createIndex('workerJobName', {
    unique: true,
});

export default {
    updateProviders(dbProjectProvider :IDBProjectProvider){
        return projectProviders.update({
            workerJobName: dbProjectProvider.workerJobName
        }, {
            $set: {
                ...dbProjectProvider
            },
            $currentDate: {
                updatedAt: true
            },
            $setOnInsert: {
                createdAt: new Date()
            }
        }, {
            upsert: true
        })
    }
}
