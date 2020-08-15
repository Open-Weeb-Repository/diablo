import yargs from "yargs";
import projectJobRepo from "../src/repositories/project-jobs";
import {Message} from "amqp-ts";
import { scrapJobQueue, closeConnection } from "../src/commons/amqp";
import { DiabloMessage } from "../src/types/diablo.messages";
import db from "../src/commons/db";

yargs
    .command("start [jobId]", "Start jobid", yargs=>{
        yargs.positional("jobId", {
            describe: "Job ID",
        })
    }, args => main(args).catch(err=>console.error(err)))
    .argv;

async function main(args: any){
    if (!args.jobId) {
        return;
    }
    console.log(`getting job id: ${args.jobId}`);
    const job = await projectJobRepo.getById(args.jobId);
    if (!job) {
        throw new Error("Project Not Found!");
    }

    const messageContent: DiabloMessage.IScrapeMessage = {
        _id: job._id.toString(),
        malId: job.malId,
        provider: job.provider,
        searchParam: job.searchParam
    };

    const msg = new Message(messageContent);
    msg.sendTo(scrapJobQueue);
    console.log('Job sent');
    closeConnection();
    db.close().catch(err=>console.error(err));
}
