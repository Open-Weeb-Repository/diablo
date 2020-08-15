import monk from "monk";
import config from "config";

export default monk(config.get("db"));
