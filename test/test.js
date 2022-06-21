import {authenticate} from 'ldap-authentication';
let options = {
    ldapOpts: {
      url: 'ldap://10.15.10.135',
      // tlsOptions: { rejectUnauthorized: false }
    },
    userDn: 'CN=administrator,OU=fdp,DC=fis,DC=local',
    // userDn: 'CN=fdp1,OU=fdp,DC=fis,DC=local',
    userPassword: '123456a@',
    userSearchBase: 'DC=fis,DC=local',
    usernameAttribute: 'CN',
    // username: 'fdp1',
    username: 'administrator',
    // starttls: false
  };
try {
  let user = await authenticate(options);
  console.log('1:',user);
}catch(e){
    console.log('2:',e);
}