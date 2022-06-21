import express, { json, urlencoded } from "express";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import myLogger from "./configs/winston.js";
import { Created, NoContent, Ok } from "./configs/http-status-codes.js";
import userRoute from "./routers/User.js";
import rootRoute from "./routers/Root.js";
import adminRoute from "./routers/Admin.js";
import { makeInfo } from "./util/MakeLogInfo.js";
// import { makeCalls } from "./data_manager/CampaignManager.js";

let index = express();


index.use(json());
index.use(urlencoded({ extended: false }));
index.use(cookieParser());
index.use(cors());
index.use("/user", makeInfo, userRoute);
index.use("/admin",makeInfo, adminRoute);
index.use("/",makeInfo, rootRoute);
// data response
index.use((data, req, res, next) => {
    let statusCode = data.statusCode;
    if (statusCode !== Ok && statusCode !== Created && statusCode !== NoContent) {
        let { method, url } = req;
        myLogger.info("Method:" + method + ", URl:" + url + ", Error: " + JSON.stringify(data), { label: "RESPONSE-ERROR" });
        res.status(statusCode).send({
            code: statusCode,
            error: data.data ? data.data : data.error,
            description: data.description
        })
    } else {
        let { method, url } = req;
        
        let {prefix} = data.data;
        if(prefix) {
            myLogger.info("Method:" + method + ", URl:" + url + ", Data: " + prefix, { label: "RESPONSE-OK" });
            res.status(statusCode).send(prefix);
        } else {
            myLogger.info("Method:" + method + ", URl:" + url + ", Data: %o", data.data, { label: "RESPONSE-OK" });
            res.status(statusCode).send(data.data);
        }
    }
});

export default index;
