import yargs from "yargs";
import debug from "debug";
import {App} from "./app";
import AnimeSamehadakuProvider from "./providers/anime_samehadaku";

const log = debug('diablo:main');

yargs.argv

const app = new App();

// add supported provider
log("Register all providers");
app.registerProvider(new AnimeSamehadakuProvider());

app.start()
    .then(() => {
        console.info('app is started');
    })
    .catch(err => {
        console.error(err);
    });
