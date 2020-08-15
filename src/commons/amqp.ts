import * as Amqp from "amqp-ts";
import config from 'config';
import debug from "debug";

const log = debug('rimuru:amqp');
const connection = new Amqp.Connection(config.get("queue.connection"));

export const scrapJobQueue = connection.declareQueue(config.get("queue.projectScrapperQueueName"));

export function closeConnection() {
    if (connection.isConnected) {
        log("clossing amqp connection");
        connectionCloser()
            .then(() => {
                log("Connection closed");
            })
            .catch((err: any) => {
                log("error closing connection %O", err);
            })
    }
}

async function connectionCloser() {
    const queues: Amqp.Queue[] = [
        scrapJobQueue
    ];
    await Promise.all(queues.map(queue => queue.close()));
    await connection.close();
}
