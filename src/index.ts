import yargs from "yargs";
import debug from "debug";
import {App} from "./app";
import AnimeDummyProvider from "./providers/anime_dummy_success"

const log = debug('diablo:main');

yargs.argv

const app = new App();

// add supported provider
log("Register all providers");
app.registerProvider(new AnimeDummyProvider());

app.start()
    .then(() => {
        console.info('app is started');
    })
    .catch(err => {
        console.error(err);
    });
