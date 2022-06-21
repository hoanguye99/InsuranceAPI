import jsonwebtoken from "jsonwebtoken";
import { publicKEY } from "../configs/config.js";
import { BadRequest, Forbidden, Ok, Unauthorized } from "../configs/http-status-codes.js";
import { verifyPositiveInteger, verifyTooLong } from "./UtilsValidate.js";
export function validateToken(req, res, next) {
    let { token } = req.headers;
    if (!token) {
        return next({ statusCode: Unauthorized, error: "NO_TOKEN", description: "Không có Token" });
    }
    let verifyOptions = {
        algorithm: "RS256"
    }
    try {
        let payload = jsonwebtoken.verify(token, publicKEY, verifyOptions);
        req.payload = payload;
        return next();
    } catch (e) {
        return next({ statusCode: Unauthorized, error: "TOKEN_EXPIRED", description: "Token hết hạn" });
    }
}
export function validateRefreshToken(req, res, next) {
    let { refreshtoken } = req.headers;
    if (!refreshtoken) {
        return next({ statusCode: Unauthorized, error: "NO_TOKEN", description: "Không có Token" });
    }
    let verifyOptions = {
        algorithm: "RS256"
    }
    try {
        let payload = jsonwebtoken.verify(refreshtoken, publicKEY, verifyOptions);
        let {type} = payload;
        if(type !== 'REFRESH_TOKEN') {
            return next({ statusCode: Unauthorized, error: "WRONG_TOKEN_TYPE", description: "Sai Token" });    
        }
        req.payload = payload;
        return next();
    } catch (e) {
        return next({ statusCode: Unauthorized, error: "TOKEN_EXPIRED", description: "Token hết hạn" });
    }
}
export function validateAdminRequired(req, res, next) {
    let { role } = req.payload;
    if (!role || role !== 'ADMIN') {
        return next({ statusCode: Forbidden, error: "NO_ROLE", description: "No permission" });
    }
    return next();

}