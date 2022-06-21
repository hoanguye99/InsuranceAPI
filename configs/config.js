import fs from "fs";
import dotenv from 'dotenv';
dotenv.config();
export const PORT = process.env.SM_BE_PORT || "8080";
// export const HOST = "149.28.229.226";
// export const PORTDB = "6996";
// export const USER = "sult";
// export const PASSWORD = "sult1997#@!";
// export const DATABASE = "ajcam";

export const HOST = process.env.INS_DB_HOST || "10.14.171.23";
export const PORTDB = process.env.INS_DB_PORT || "3306";
export const USER = process.env.INS_DB_USER || "root";
export const PASSWORD = process.env.INS_DB_PASSWORD || "fpt@123";
export const DATABASE = process.env.INS_DB_NAME || "smart_market";


export const POOL = {
    min: 0,
    acquire: 30000,
    idle: 10000
};
export const privateKEY = fs.readFileSync('./configs/private.key', 'utf8');
export const publicKEY = fs.readFileSync('./configs/public.key', 'utf8');