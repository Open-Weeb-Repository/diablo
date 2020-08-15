import {Message} from "amqp-ts";
import { scrapJobQueue, closeConnection } from "../src/commons/amqp";
import { DiabloMessage } from "../src/types/diablo.messages";

const messageContent: DiabloMessage.IScrapeMessage = {
    _id: "5f3788b3802a55397385909e",
    malId: "66654bfd9f791006fbe94f2833f9144f",
    provider: "anime_dummy",
    searchParam: [
        "The God of High School",
        "GOHS",
        "THE GOD OF HIGH SCHOOL ゴッド・オブ・ハイスクール"
    ]
};

const msg = new Message(messageContent);
msg.sendTo(scrapJobQueue);
console.dir(messageContent);
console.log('Send!');

closeConnection();
