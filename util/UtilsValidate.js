import moment from "moment";
export function isInteger(n) {
    if (!n) return false;
    n = n.trim();
    return +n === parseInt(n);
}
export function isPositiveInteger(n) {//include 0
    if (!n) return false;
    try {
        n = n.trim();
    } catch (e) {

    }
    return (+n === parseInt(n) && n >= 0);
}

export function isBoolean(n) {//include 0
    if (!n) return false;
    n = n.trim().toLowerCase();
    return (n === 'true' || n === 'false');
}

export function isValidDateTime(datetime) {
    let date = moment(datetime);
    return date.isValid();
}
export function parseDate(myDate, format) {
    if (format) {
        return moment(myDate, format).toDate();
    } else {
        return moment(myDate, 'YYYY-MM-DD HH:mm:ss').toDate();
    }
}
export function formatDate(date,format="YYYY-MM-DD HH:mm:ss") {
    if (!date) {
        return "";
    }
    let date_ = moment(date).format(format);
    return date_;
}
export function verifyTooLong(data, len, name) {
    if (data && data.length > len) {
        return { statusCode: BadRequest, error: "DATA_INVALID", description: `${name} is too long (more than ${len})` };
    }
    return undefined;
}
export function verifyPositiveInteger(data, name) {
    if (data && !isPositiveInteger(data)) {
        return { statusCode: BadRequest, error: "DATA_INVALID", description: `${name} is invalid` };
    }
    return undefined;
}