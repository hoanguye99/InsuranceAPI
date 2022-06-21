import jsSHA from 'jssha';
export function makeInvoiceCode(userId) {
    let data = 'InvoiceCode#'+userId;
    return make(data);
}
export function makeOrderCode(userId) {
    let data = 'OrderCode#'+userId;
    return make(data);
}
function make(data) {
  let shaObj = new jsSHA("CSHAKE128", "TEXT");
  shaObj.update(data);
  return shaObj.getHash("HEX", { outputLen: 24 })+'-'+new Date().getTime();
}