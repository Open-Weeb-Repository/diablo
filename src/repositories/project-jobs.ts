import db from "../commons/db";
import {DBProjectJob, DBProjectJobLog} from "project-jobs";
import {Commons} from "diablo";

export const projectJobs = db.get<DBProjectJob.IProjectJob & Commons.IHasUpdatedAt>("projectScrapeJobs");
const projectJobLogs = db.get<DBProjectJobLog.IProjectJobLog>("projectScrapeJobLogs");
projectJobLogs.createIndex("jobId -date");

function writeProjectJobLog(status: "success" | "fail", jobId: string, message: string, context?: any) {
    return projectJobLogs.insert({
        jobId,
        date: new Date(),
        status,
        message,
        context
    })
}

export default {
    getById(_id: string) {
        return projectJobs.findOne({
            _id
        });
    },
    jobFail(_id: string, message: string, context?: any) {
        writeProjectJobLog("fail", _id, message, context)
            .catch((err) => {
                console.error('error writing log to db', err.message);
            });
        return projectJobs.update({_id}, {
            $inc: {
                n_fail: 1
            },
            $set: {
                updatedAt: new Date()
            }
        });
    },

    jobSuccess(_id: string, message: string, context?: any) {
        writeProjectJobLog("success", _id, message, context)
            .catch((err) => {
                console.error('error writing log to db', err.message);
            });
        return projectJobs.update({_id}, {
            $inc: {
                n_done: 1
            },
            $set: {
                updatedAt: new Date(),
                n_fail: 0
            }
        });
    },
}
