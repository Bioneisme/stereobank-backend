import dotenv from "dotenv";
dotenv.config();

const DEFAULT_MYSQL_URL: string = 'jdbc:mysql://localhost/test';
const DEFAULT_SERVER_PORT: number = 5000;
const DEFAULT_CLIENT_URL: string = 'localhost';
const DEFAULT_JWT_ACCESS_SECRET: string = 'someSecretKey33485';
const DEFAULT_JWT_REFRESH_SECRET: string = 'someSecretKey33486';
const DEFAULT_SERVER_URL: string = 'http://localhost:' + DEFAULT_SERVER_PORT;

export const DB_URI: string = process.env.DB_URI || DEFAULT_MYSQL_URL;
export const SERVER_PORT: number = +(process.env.SERVER_PORT || DEFAULT_SERVER_PORT);
export const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET || DEFAULT_JWT_ACCESS_SECRET;
export const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || DEFAULT_JWT_REFRESH_SECRET;
export const CLIENT_URL: string = process.env.CLIENT_URL || DEFAULT_CLIENT_URL;
export const API_KEY: string = process.env.API_KEY as string;
export const SERVER_URL: string = process.env.SERVER_URL || DEFAULT_SERVER_URL;