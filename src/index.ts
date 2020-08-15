import yargs from "yargs";
import debug from "debug";
import {App} from "./app";

const log = debug('diablo:main');

yargs.argv

const app = new App();

// add supported provider

app.start()
    .then(() => {
        console.info('app is started');
    })
    .catch(err => {
        console.error(err);
    });
