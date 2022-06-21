import { Router } from "express";
// import { Ok } from "../configs/http-status-codes.js";
import {  applyIns, createIns, getListIns, getListInsType, login, updateIns } from "../controllers/RoutingTable.js";
import { parseDate } from "../util/UtilsValidate.js";
import { validateAdminRequired, validateToken } from "../util/Validate.js";
let router = Router();
router.post("/login/", async (req, res, next) => {
    let {userName,password} = req.body;
    let data = await login(userName,password);
    next(data);
});


router.get("/ins/",validateToken,  async (req, res, next) => {
    let {userName} = req.payload;
    let data = await getListIns(userName,'USER');
    next(data);
});

router.post("/ins/", validateToken, async (req, res, next) => {
    let {userName,displayName} = req.payload;
    let {typeCode,ownerName,plate,startDate,endDate,engineNo,chassisNo} = req.body;
    let format = 'YYYYMMDD';
    let startDateD = parseDate(startDate,format);
    let endDateD = parseDate(endDate,format);
    let data = await createIns(userName,displayName, typeCode,ownerName,plate,startDateD,endDateD,engineNo,chassisNo);
    next(data);
});
router.put("/ins/:insId", validateToken, async (req, res, next) => {
    let {insId} = req.params;
    let {typeCode,ownerName,plate,startDate,endDate,engineNo,chassisNo,status} = req.body;
    let format = 'YYYYMMDD';
    let startDateD = null;
    if(startDate) {startDateD = parseDate(startDate,format);}

    let endDateD = null;
    if(endDate) {endDateD = parseDate(endDate,format) };
    let data = await updateIns(insId, typeCode,ownerName,plate,startDateD,endDateD,engineNo,chassisNo,status);
    next(data);
});
router.delete("/ins/:insId", validateToken, async (req, res, next) => {
    let {insId} = req.params;    
    let data = await updateIns(insId, undefined,undefined,undefined,undefined,undefined,undefined,undefined,0);
    next(data);
});
export default router;