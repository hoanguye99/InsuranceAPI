import { Router } from "express";
// import { Ok } from "../configs/http-status-codes.js";
import { checkRefreshToken, createIns, getListIns, getListInsType, login, makeOrder, updateIns } from "../controllers/RoutingTable.js";
import { makeOrderCode } from "../util/MyCrypto.js";
import { parseDate } from "../util/UtilsValidate.js";
// import { parseDate } from "../util/UtilsValidate.js";
import { validateRefreshToken, validateToken } from "../util/Validate.js";
let router = Router();
router.post("/login/", async (req, res, next) => {
    let {userName,password} = req.body;
    let data = await login(userName,password);
    next(data);
});
router.post("/refresh-token/",validateRefreshToken,  async (req, res, next) => {
    let {refreshtoken} = req.headers;
    let {userName} = req.payload;
    let data = await checkRefreshToken(userName,refreshtoken);
    next(data);
});

router.get("/ins-type/",  async (req, res, next) => {
    let data = await getListInsType();
    next(data);
});
router.get("/ins/",validateToken,  async (req, res, next) => {
    let {pageIndex,size} = req.query;
    pageIndex = pageIndex || 0;
    pageIndex = pageIndex*size;
    let {userName,role} = req.payload;
    let data = await getListIns(userName,role||'USER',pageIndex,size);
    next(data);
});

router.post("/ins/", validateToken, async (req, res, next) => {
    let {userName,displayName} = req.payload;
    // let {typeCode,ownerName,plate,startDate,endDate,engineNo,chassisNo,address} = req.body;
    let body = req.body;
    // let format = 'YYYYMMDD';
    // let startDateD = parseDate(startDate,format);
    // let endDateD = parseDate(endDate,format);
    // let data = await createIns(userName,displayName, typeCode,ownerName,plate,startDateD,endDateD,engineNo,chassisNo,address);
    let data = await createIns(body,userName,displayName);
    next(data);
});
router.put("/ins/:insId", validateToken, async (req, res, next) => {
    let {insId} = req.params;
    let {typeCode,ownerName,plate,startDate,endDate,engineNo,chassisNo,status,address} = req.body;
    let format = 'YYYYMMDD';
    let startDateD = null;
    if(startDate) {startDateD = parseDate(startDate,format);}

    let endDateD = null;
    if(endDate) {endDateD = parseDate(endDate,format) };
    let data = await updateIns(insId, typeCode,ownerName,plate,startDateD,endDateD,engineNo,chassisNo,status,address);
    next(data);
});
router.delete("/ins/:insId", validateToken, async (req, res, next) => {
    let {insId} = req.params;    
                            //(insId, typeCode, ownerName, plate, startDate, endDate, engineNo, chassisNo, status, address)
    let data = await updateIns(insId, null,null,null,null,null,null,null,0,null);
    next(data);
});

//order
router.post("/ins/order/", validateToken, async (req, res, next) => {
    let {userName} = req.payload;
    let productType = 'INS';
    let {insId, amount,orderId} = req.body;
    let orderCode = undefined;
    if(!orderId) {
        orderCode = makeOrderCode(userName);                            
    }
    let data = await makeOrder(userName, orderCode, productType, insId, amount,orderId);
    next(data);
});
router.delete("/ins/order/:orderId/detail/", validateToken, async (req, res, next) => {
    let {userName} = req.payload;
    let {orderId} = req.params;
    let {insId, amount} = req.body;                       
    let data = await createOrder(userName, orderCode, productType, insId, amount);
    next(data);
});
export default router;