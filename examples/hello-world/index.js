'use strict';
const axios = require('axios');

const NeutronURL = 'https://neutron-staging.opendock.com';

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Must provide two arguments: {email} {password}');
    process.exit(1);
  }
  const userEmail = args[0];
  const userPassword = args[1];

  console.log('---------------------------------------------------');
  console.log("Hello World, I'm a simple Opendock REST API Example");
  console.log('---------------------------------------------------');
  console.log(`  --> Base url: ${NeutronURL}`);
  console.log();
  
  const api = axios.create({
    baseURL: NeutronURL,
  });
  

  // Let's just see if the server is running:
  const resRoot = await api.get('/'); //TODO: error handling
  console.log('* Neutron says:\n' + resRoot.data);
  console.log();

  // Now let's try and login using the supplied email/password:
  const resLogin = await api.post('/auth/login', {  //TODO: error handling
    email: userEmail,
    password: userPassword
  });
  const accessToken = resLogin.data.access_token;
  console.log(`* Logged in user "${userEmail}", got access token="${accessToken.slice(0, 10)}..."`);
  console.log();
  
  // We can now set our access token into the "Authorization" HTTP header (as a bearer token), which
  // will allow us to gain access to the API endpoints that require authentication:
  api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

  // Now that we are authorized, let's try to fetch info about our logged-in User:
  const resMe = await api.get('/auth/me'); // TODO: error handling
  const user = resMe.data;
  console.log(`* Fetched "me" OK: Hello ${user.firstName} ${user.lastName}! Your access role = "${user.role}"`);
  console.log();

  // Let's fetch all our Warehouses and then print out their names:
  const resWh = await api.get('/warehouse'); // TODO: error handling
  const warehouses = resWh.data.data;
  console.log('* Your warehouses:');
  for (const wh of warehouses) {
    console.log('    Name: ', wh.name);
  }
  console.log();
}
main();
