'use strict';
const axios = require('axios');

const NeutronURL = 'https://neutron-staging.opendock.com';

console.log('---------------------------------------------------');
console.log("Hello World, I'm a simple Opendock REST API Example");
console.log('---------------------------------------------------');
console.log(`   - Base url: ${NeutronURL}`);
console.log();

async function main() {
  const api = axios.create({
    baseURL: NeutronURL,
  });
  

  // Let's just see if the server is running:
  const res = await api.get('/');
  console.log('* Neutron says:\n' + res.data);
  console.log();

  // Now let's try and login using the supplied email/password:
  
  
}
main();
