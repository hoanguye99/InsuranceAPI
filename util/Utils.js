import { privateKEY } from "../configs/config.js";
import jsonwebtoken from 'jsonwebtoken';
import myLogger from "../configs/winston.js";
export const refreshTokenLife = 86400;
export function genToken(userName, displayName, role, email) {
    let signOptions = {
        expiresIn: "1h",
        algorithm: "RS256"
    }
    myLogger.info('Generate accesstoken for:' + userName);
    let payload = { userName, displayName, type: "ACCESS_TOKEN", permissions: "w,r", role, email };
    let accessToken = jsonwebtoken.sign(payload, privateKEY, signOptions);
    return accessToken;
}
export function genRefreshToken(userName, displayName) {
    let payload = { userName, displayName, type: "REFRESH_TOKEN"};
    let signOptions = {
        expiresIn: refreshTokenLife,
        algorithm: "RS256"
    }
    let refreshToken = jsonwebtoken.sign(payload, privateKEY, signOptions);
    return refreshToken;
}
export function toJsonRemoveBigint(data) {
    if (data !== undefined) {
        return JSON.stringify(data, (_, v) => typeof v === 'bigint' ? `${v}#bigint` : v)
            .replace(/"(-?\d+)#bigint"/g, (_, a) => a);
    }
}