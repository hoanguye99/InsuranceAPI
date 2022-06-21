import connection from "../configs/DB.js";

export default async (query, params) =>  {
    let conn;
    try {
        conn = await connection.getConnection();
        const rows = await conn.query(query, params);
        //   console.log(rows); //[ {val: 1}, meta: ... ]
        //   const res = await conn.query("INSERT INTO myTable value (?, ?)", [1, "mariadb"]);
        //   console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
        let ret = rows[0];
        return ret;
    } catch (err) {
        throw err;
    } finally {
        if (conn) return conn.end();
    }
}