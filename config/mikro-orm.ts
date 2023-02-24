import {DB_URI} from "./settings";
import allEntities from "../entities";
import {Options} from "@mikro-orm/core";

export const config: Options = {
    type: 'mysql',
    clientUrl: DB_URI,
    entities: allEntities,
    tsNode: true
};