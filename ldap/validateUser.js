import {authenticate} from 'ldap-authentication';
import myLogger from '../configs/winston.js';
const ldapOpts = {
    url: 'ldap://10.15.10.135',
};
const userSearchBase = "DC=fis,DC=local";
const usernameAttribute= 'CN';
const baseDn= `OU=fdp,${userSearchBase}`;
export async function validateUser(userName, password, isAdmin) {
    let options = isAdmin?{
        ldapOpts,
        adminDn: `CN=read-only-admin,${userSearchBase}`,
        adminPassword: password,
        userPassword: password,
        userSearchBase,
        // usernameAttribute: 'uid',
        // username: 'gauss',
        // starttls: false
      }:{
        ldapOpts,
        userDn: `CN=${userName},${baseDn}`,
        userPassword: password,
        userSearchBase,
        usernameAttribute,
        username: userName,
        // starttls: false
      };
    try {
       let user = await authenticate(options);
    //   await authenticate(options);
      myLogger.info('User:%o',user);
    //   console.log('1:',user);
    return true;
}catch(e){
        myLogger.info('ValidateUser Error: %o',e);
        // console.log('2:',e);
        return false;
    }
}
