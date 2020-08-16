import yargs from "yargs";
import debug from "debug";
import {App} from "./app";
import AnimeSamehadakuProvider from "./providers/anime_samehadaku";
import AnimeOploverzProvider from "./providers/anime_oploverz";
import logger from "./commons/logger";

const log = debug('diablo:main');

yargs.argv

const app = new App();

// add supported provider
log("Register all providers");
app.registerProvider(new AnimeSamehadakuProvider());
app.registerProvider(new AnimeOploverzProvider())
logger.info("Starting App")
app.start()
    .then(() => {
        logger.info("App Started");
    })
    .catch(err => {
        logger.error(err);
    });
