
import { BadRequest, Ok, SystemError, Unauthorized } from "../configs/http-status-codes.js";
import myLogger from "../configs/winston.js";
import { genRefreshToken, genToken, refreshTokenLife, toJsonRemoveBigint } from "../util/Utils.js";
import connection from '../configs/DB.js';
import { validateUser } from "../ldap/validateUser.js";
import { formatDate, parseDate } from "../util/UtilsValidate.js";
// export async function login(userName, password, isAdmin = false) {
//     let { res, displayName } = await validateUser(userName, password, isAdmin);
//     if (res === true) {
//         let role = isAdmin ? 'ADMIN' : 'USER';
//         let accessToken = genToken(userName, displayName, role);
//         return { statusCode: Ok, data: { accessToken, displayName, role } };
//     } else {
//         return { statusCode: Unauthorized, error: 'UNAUTHORIZED', description: 'UNAUTHORIZED!' };
//     }
// }
export async function login(userName, password) {
    let sql = "CALL fisLogin(?,?)";
    let params = [userName, password];
    let conn;
    let ret = undefined;
    try {
        conn = await connection.getConnection();
        const result = await conn.query(sql, params);
        let { res, id, displayName, role, email } = result[0][0];

        if (res == 1) {
            let accessToken = genToken(id, userName, displayName, role, email);
            let refreshToken = genRefreshToken(userName, displayName);
            await updateRefreshToken(userName,refreshToken);
            ret = { statusCode: Ok, data: { accessToken, refreshToken, id, displayName, role, email } };
        } else {
            ret = { statusCode: Unauthorized, error: 'UNAUTHORIZED', description: 'userName or password is wrong!' };
        }
    } catch (e) {
        myLogger.info("login e: %o", e);
        ret = { statusCode: SystemError, error: 'ERROR', description: 'System busy!' };

    } finally {
        if (conn) conn.end();
    }
    return ret;
}
export async function checkRefreshToken(userName, refreshToken) {
    let sql = "CALL validateRefreshToken(?,?)";
    let params = [userName, refreshToken];
    let conn;
    let ret = undefined;
    try {
        conn = await connection.getConnection();
        const result = await conn.query(sql, params);
        let { res,displayName,role, email } = result[0][0];
        if (res == 1) {
            let accessToken = genToken(userName, displayName, role, email);
            ret = { statusCode: Ok, data: { accessToken} };
        } else {
            ret = { statusCode: Unauthorized, error: 'UNAUTHORIZED', description: 'userName or password is wrong!' };
        }
    } catch (e) {
        myLogger.info("login e: %o", e);
        ret = { statusCode: SystemError, error: 'ERROR', description: 'System busy!' };

    } finally {
        if (conn) conn.end();
    }
    return ret;
}
async function updateRefreshToken(userName,refreshToken) {
    let sql = "CALL updateRefreshToken(?,?,?)";
    let expiredDate = new Date(new Date().getTime() + (refreshTokenLife * 1000));
    let params = [userName,refreshToken,expiredDate];
    let conn;
    let ret = undefined;
    try {
        conn = await connection.getConnection();
        await conn.query(sql, params);
        return 1;
    } catch (e) {
        myLogger.info("login e: %o", e);
    } finally {
        if (conn) conn.end();
    }
    return 0;
}
export async function getListInsType() {
    let sql = "CALL fisGetInsType()";
    let conn;
    let ret = undefined;
    try {
        conn = await connection.getConnection();
        const result = await conn.query(sql);
        let res = result[0];

        let insTypes = [];
        for (let r of res) {
            let { id, code, name, description, totalAmount, image } = r;
            insTypes.push({ id, code, name, description, totalAmount, image });
        }
        ret = { statusCode: Ok, data: { insTypes } };
    } catch (e) {
        myLogger.info("login e: %o", e);
        ret = { statusCode: SystemError, error: 'ERROR', description: 'System busy!' };

    } finally {
        if (conn) conn.end();
    }
    return ret;
}
export async function createIns(body, userName, displayName) {
    if (Array.isArray(body) === true) {
        return await createMultipIns(body, userName, displayName);
    } else {
        let { typeCode, ownerName, plate, startDate, endDate, engineNo, chassisNo, address } = body;
        let format = 'YYYYMMDD';
        let startDateD = parseDate(startDate, format);
        let endDateD = parseDate(endDate, format);
        return await createOneIns(userName, displayName, typeCode, ownerName, plate, startDateD, endDateD, engineNo, chassisNo, address);
    }
}
export async function createMultipIns(body, userName, displayName) {
    let success = [];
    let failed = [];
    for (let item of body) {
        let { typeCode, ownerName, plate, startDate, endDate, engineNo, chassisNo, address } = item;
        let format = 'YYYYMMDD';
        let startDateD = parseDate(startDate, format);
        let endDateD = parseDate(endDate, format);
        let ret = await createOneIns(userName, displayName, typeCode, ownerName, plate, startDateD, endDateD, engineNo, chassisNo, address);
        if (ret.statusCode === Ok) {
            let { insId } = ret;
            success.push(ret.data);
        } else {
            failed.push({ typeCode, ownerName, plate, startDate, endDate, engineNo, chassisNo, address });
        }
    }
    return { statusCode: Ok, data: { success, failed } };

}
export async function createOneIns(userName, displayName, typeCode, ownerName, plate, startDate, endDate, engineNo, chassisNo, address) {
    let sql = "CALL insertIns(?,?,?,?,?,?,?,?,?,?)";
    let params = [userName, displayName, typeCode, ownerName, plate, startDate, endDate, engineNo, chassisNo, address];
    let conn;
    let ret = undefined;
    try {
        conn = await connection.getConnection();
        const result = await conn.query(sql, params);
        let { res } = result[0][0];
        if (res > 0) {
            ret = { statusCode: Ok, data: { id: toJsonRemoveBigint(res), userName, displayName, typeCode, ownerName, 
                plate, startDate:formatDate(startDate,'DD/MM/YYYY'), endDate:formatDate(endDate,'DD/MM/YYYY'), engineNo, chassisNo, address } };
        } else {
            ret = { statusCode: BadRequest, error: 'ERROR', description: 'Error!' };
        }
    } catch (e) {
        myLogger.info("createIns e: %o", e);
        ret = { statusCode: SystemError, error: 'ERROR', description: 'System busy!' };

    } finally {
        if (conn) conn.end();
    }
    return ret;
}
export async function updateIns(insId, typeCode, ownerName, plate, startDate, endDate, engineNo, chassisNo, status, address) {
    let sql = "CALL updateIns(?,?,?,?,?,?,?,?,?,?)";
    typeCode = typeCode === undefined ? null : typeCode;
    ownerName = ownerName === undefined ? null : ownerName;
    plate = plate === undefined ? null : plate;
    engineNo = engineNo === undefined ? null : engineNo;
    chassisNo = chassisNo === undefined ? null : chassisNo;
    status = status === undefined ? null : status;
    startDate= startDate === undefined ? null : startDate;
    endDate= endDate === undefined ? null : endDate;
    address= address === undefined ? null : address;
    let params = [insId, typeCode, ownerName, plate, startDate, endDate, engineNo, chassisNo, status, address];
    let conn;
    let ret = undefined;
    try {
        conn = await connection.getConnection();
        const result = await conn.query(sql, params);
        let { res } = result[0][0];
        if (res == 1) {
            ret = { statusCode: Ok, data: { insId, typeCode, ownerName, plate, startDate, endDate, engineNo, chassisNo, status, address } };
        } else {
            ret = { statusCode: BadRequest, error: 'ERROR', description: 'Error!' };
        }
    } catch (e) {
        myLogger.info("updateIns e: %o", e);
        ret = { statusCode: SystemError, error: 'ERROR', description: 'System busy!' };

    } finally {
        if (conn) conn.end();
    }
    return ret;
}
export async function getListIns(userName, role,pageIndex=0,size=10) {
    let sql = "CALL getIns(?,?,?,?)";
    let conn;
    let ret = undefined;
    try {
        conn = await connection.getConnection();
        let params = [userName, role,pageIndex,size];
        const result = await conn.query(sql, params);
        let res = result[0];

        let ins = [];
        for (let r of res) {
            let { id, typeCode, ownerName, plate, startDate, endDate, engineNo, chassisNo, status, address,userName,displayName } = r;
            ins.push({ id: toJsonRemoveBigint(id), typeCode, ownerName, plate, startDate:formatDate(startDate,'DD/MM/YYYY'), 
                endDate:formatDate(endDate,'DD/MM/YYYY'), engineNo, chassisNo, status, address,userName,displayName });
        }
        ret = { statusCode: Ok, data: { ins } };
    } catch (e) {
        myLogger.info("login e: %o", e);
        ret = { statusCode: SystemError, error: 'ERROR', description: 'System busy!' };

    } finally {
        if (conn) conn.end();
    }
    return ret;
}
export async function applyIns(insId, applyBy) {
    let sql = "CALL applyIns(?,?)";
    let params = [insId, applyBy];
    let conn;
    let ret = undefined;
    try {
        conn = await connection.getConnection();
        const result = await conn.query(sql, params);
        let { res } = result[0][0];
        if (res == 1) {
            ret = { statusCode: Ok, data: { insId, applyBy } };
        } else {
            ret = { statusCode: BadRequest, error: 'ERROR', description: 'Error!' };
        }
    } catch (e) {
        myLogger.info("updateIns e: %o", e);
        ret = { statusCode: SystemError, error: 'ERROR', description: 'System busy!' };

    } finally {
        if (conn) conn.end();
    }
    return ret;
}

export async function createOrder(userName, orderCode, productType, insId, amount) {
    let sql = "CALL createOrder(?,?,?,?,?)";
    let params = [userName, orderCode, productType, insId, amount];
    let conn;
    let ret = undefined;
    try {
        conn = await connection.getConnection();
        const result = await conn.query(sql, params);
        let { res } = result[0][0];
        if (res !== 0) {
            ret = { statusCode: Ok, data: { orderId: toJsonRemoveBigint(res), userName, orderCode, productType, insId, amount } };
        } else {
            ret = { statusCode: BadRequest, error: 'ERROR', description: 'Error!' };
        }
    } catch (e) {
        myLogger.info("updateIns e: %o", e);
        ret = { statusCode: SystemError, error: 'ERROR', description: 'System busy!' };

    } finally {
        if (conn) conn.end();
    }
    return ret;
}

export async function addOrder(orderId, productType, insId, amount) {
    let sql = "CALL addOrderDetail(?,?,?,?)";
    let params = [orderId, productType, insId, amount];
    let conn;
    let ret = undefined;
    try {
        conn = await connection.getConnection();
        const result = await conn.query(sql, params);
        let { res } = result[0][0];
        if (res !== 0) {
            ret = { statusCode: Ok, data: { orderDetailId: toJsonRemoveBigint(res), orderId, productType, insId, amount} };
        } else {
            ret = { statusCode: BadRequest, error: 'ERROR', description: 'Error!' };
        }
    } catch (e) {
        myLogger.info("updateIns e: %o", e);
        ret = { statusCode: SystemError, error: 'ERROR', description: 'System busy!' };

    } finally {
        if (conn) conn.end();
    }
    return ret;
}

export async function deleteOrder(id) {
    let sql = "CALL deleteOrderDetail(?)";
    let params = [id];
    let conn;
    let ret = undefined;
    try {
      conn = await connection.getConnection();
      const result = await conn.query(sql, params);
      let { res } = result[0][0];
      if (res !== 0) {
        ret = { statusCode: Ok, data: { id } };
      } else {
        ret = { statusCode: BadRequest, error: 'ERROR', description: 'id does not exist in database' };
      }
    } catch (e) {
      myLogger.info("updateIns e: %o", e);
      ret = { statusCode: SystemError, error: 'ERROR', description: 'System busy!' };
      
    } finally {
        if (conn) conn.end();
      }
      return ret;
    }
    
export async function deleteOrderAll(orderId) {
  let sql = "CALL deleteOrderDetailAll(?)";
  let params = [orderId];
  let conn;
  let ret = undefined;
  try {
      conn = await connection.getConnection();
      const result = await conn.query(sql, params);
      let { res } = result[0][0];
      if (res !== 0) {
          ret = { statusCode: Ok, data: { orderId } };
      } else {
          ret = { statusCode: BadRequest, error: 'ERROR', description: 'orderId does not exist in database' };
      }
  } catch (e) {
      myLogger.info("updateIns e: %o", e);
      ret = { statusCode: SystemError, error: 'ERROR', description: 'System busy!' };

  } finally {
      if (conn) conn.end();
  }
  return ret;
}

    
export async function getOrderDetail(userName, orderId) {
  let sql = "CALL getOrderDetail(?,?)";
  let params = [userName, orderId];
  let conn;
  let details = [];
  let ret = undefined;
  try {
    conn = await connection.getConnection();
    const result = await conn.query(sql, params);
    let ds = result[0];
    for(let d of ds) {
      let {id, createdDate, productType,objectId,amount} = d;
      details.push({id : toJsonRemoveBigint(id), createdDate, productType, insId: toJsonRemoveBigint(objectId) , amount: toJsonRemoveBigint(amount)});
    }
    if (details.length !== 0) {
      ret = { statusCode: Ok, data: { details }};
    } else {
      ret = { statusCode: BadRequest, error: 'ERROR', description: 'The user does not have this orderId!' };
    }
  } catch (e) {
    myLogger.info("updateIns e: %o", e);
    ret = { statusCode: SystemError, error: 'ERROR', description: 'System busy!' };
  } finally {
    if (conn) conn.end();
  }
  return ret;        
}

export async function getLatestOrderDetail(userName) {
  let sql = "CALL getLatestOrderDetail(?)";
  let params = [userName];
  let conn;
  let details = [];
  let ret = undefined;
  try {
    conn = await connection.getConnection();
    const result = await conn.query(sql, params);
    let ds = result[0];
    let orderId = null;
    for(let d of ds) {
      let {id, createdDate, productType,objectId,amount} = d;
      orderId = toJsonRemoveBigint(d.orderId);
      details.push({id : toJsonRemoveBigint(id), createdDate, productType, insId: toJsonRemoveBigint(objectId) , amount: toJsonRemoveBigint(amount)});
    }
    if (details.length !== 0) {
      ret = { statusCode: Ok, data: { details, orderId }};
    } else {
      ret = { statusCode: BadRequest, error: 'ERROR', description: 'The user have not created an order yet' };
    }
  } catch (e) {
    myLogger.info("updateIns e: %o", e);
    ret = { statusCode: SystemError, error: 'ERROR', description: 'System busy!' };
  } finally {
    if (conn) conn.end();
  }
  return ret;        
}


// call whenvever client hits Purchase Button
export async function confirmOrder(userName,orderId, invoiceCode) {
    let sql = "CALL confirmOrder(?,?,?)";
    let params = [userName,orderId, invoiceCode];
    let conn;
    let ret = undefined;
    try {
        conn = await connection.getConnection();
        const result = await conn.query(sql, params);
        let { res, amount } = result[0][0];
        if (res > 0) {
            ret = { statusCode: Ok, data: { invoiceId: toJsonRemoveBigint(res), orderId, invoiceCode, amount: toJsonRemoveBigint(amount)} };
        } else {
            ret = { statusCode: BadRequest, error: 'ERROR', description: 'Error!' };
        }
    } catch (e) {
        myLogger.info("updateIns e: %o", e);
        ret = { statusCode: SystemError, error: 'ERROR', description: 'System busy!' };

    } finally {
        if (conn) conn.end();
    }
    return ret;
}