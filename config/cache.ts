import {createClient} from "redis";
import logger from "./logger";
import {REDIS} from "./settings";

export const init_cache = () => {};

export const redis = createClient({url: `redis://:${REDIS.password}@${REDIS.host}:${REDIS.port}`});

redis.connect().then(() => {
    logger.info(`Redis: Connected ✅ `);
});

redis.on('error', (err: any) => {
    logger.error(`Redis: ${err.message}`);
    throw err.message;
});