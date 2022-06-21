// import { createPool } from "mysql";
import { createPool } from "mariadb";
import { HOST, USER, PASSWORD, DATABASE, POOL, PORTDB } from "../configs/config.js";
import myLogger from "./winston.js";
let poolOption = {
    host: HOST,
    user: USER,
    password: PASSWORD,
    database: DATABASE,
    pool: POOL,
    port: PORTDB
};
let connection = createPool(poolOption);
myLogger.info('poolOption:%o',poolOption);

(async () => {
    let sql = "CALL fisLogin(?,?)";
    let params = ['admin', '123456'];
    let conn;
    try {
        conn = await connection.getConnection();
        const result = await conn.query(sql, params);
        let { res, displayName, role } = result[0][0];     
        myLogger.info("check admin: %o", { res, displayName, role });   
    } catch (e) {
        myLogger.info("check admin e: %o", e);
    } finally {
        if (conn) conn.end();
    }
})();

export default connection;