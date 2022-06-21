import connection from '../configs/DB.js';
import myLogger from '../configs/winston.js';
import { parseDate } from '../util/UtilsValidate.js';
// import query from './HelperDB.js';
// import query from './NewQuery.js';
export async function getCampaigns() {
    let sql = "CALL getCampaigns()";
    // let params = [];
    let campaigns = [];
    let conn;
    try {
        conn = await connection.getConnection();
        const result = await conn.query(sql);
        // let result = await query(sql);
        let campaignsDB = result[0];

        for (let c of campaignsDB) {
            let { campaign_name, path_file, created_date, id } = c;
            let campaignDatas = await getCampaignData(id);
            campaigns.push({ campaign_name, path_file, created_date, id, campaignDatas });
        }
    } catch (e) {
        myLogger.info("CheckOTP e: %o", e);

    } finally {
        if (conn) conn.end();
    }
    return campaigns;
}
async function getCampaignData(campaignId) {
    let sql = "CALL getCampaignData(?)";
    let params = [campaignId];
    let campaignDatas = [];
    let conn;
    try {
        conn = await connection.getConnection();
        let result = await conn.query(sql, params);
        let campaignsDB = result[0];

        for (let c of campaignsDB) {
            let { msisdn } = c;

            campaignDatas.push(msisdn);
        }
    } catch (e) {
        myLogger.info("CheckOTP e: %o", e);

    } finally {
        if (conn) conn.end();
    }
    return campaignDatas;
}
export async function updateCampaignData(campaignId, msisdn, status, note) {
    let sql = "CALL updateCampaignData(?,?,?,?)";
    let params = [campaignId, msisdn, status, note];
    let conn;
    try {
        conn = await connection.getConnection();
        let result = await conn.query(sql, params);
        let r = result[0][0].res;

        return r;
    } catch (e) {
        myLogger.info("CreateOTP e: %o", e);
        return -1
    } finally {
        if (conn) conn.end();
    }
}
export async function insertCampaign(campaignName,startDate,endDate, pathFile, msisdns) {
    let sql = "CALL insertCampaign(?,?,?,?,?)";
    let sDate = parseDate(startDate);
    let eDate = parseDate(endDate);
    let params = [campaignName,sDate,eDate, pathFile, msisdns];
    let conn;
    try {
        conn = await connection.getConnection();
        let result = await conn.query(sql, params);        
        return result[0][0].res;
    } catch (e) {
        myLogger.info("CreateOTP e: %o", e);
        return -1
    } finally {
        if (conn) conn.end();
    }
}
export async function updateCampaignDate(campaignId, msisdns) {
    let sql = "CALL addCampaignData(?,?)";
    let params = [campaignId, msisdns];
    let conn;
    try {
        conn = await connection.getConnection();
        await conn.query(sql, params);        
        return 1;
    } catch (e) {
        myLogger.info("CreateOTP e: %o", e);
        return -1
    } finally {
        if (conn) conn.end();
    }
}