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
export const TURBO_SMS: string = process.env.TURBO_SMS_API_KEY as string;
export const SERVER_URL: string = process.env.SERVER_URL || DEFAULT_SERVER_URL;
export const EXPIRY_TIME: number = +(process.env.EXPIRY_TIME || 60 * 10);
const REDIS_HOST: string = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT: number = +(process.env.REDIS_PORT || 6379);
const REDIS_PASSWORD: string = process.env.REDIS_PASSWORD || '';
const PSP_PUBLIC_KEY: string = process.env.PSP_PUBLIC_KEY || '';
const PSP_PRIVATE_KEY: string = process.env.PSP_PRIVATE_KEY || '';
const PSP_BASE_URL: string = process.env.PSP_BASE_URL || '';
export const SMS_KZ: string = process.env.SMS_KZ as string;
export const SMS_UK: string = process.env.SMS_UK as string;
export const SMS_ALL: string = process.env.SMS_ALL as string;

export const REDIS = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD
}

export const PSP = {
    publicKey: PSP_PUBLIC_KEY,
    privateKey: PSP_PRIVATE_KEY,
    baseUrl: PSP_BASE_URL
}