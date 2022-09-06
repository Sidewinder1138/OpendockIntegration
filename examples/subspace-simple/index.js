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
  console.log("Simple OpenDock Subspace Listener");
  console.log('---------------------------------------------------');
  console.log(`  --> Base url: ${NeutronURL}`);
  console.log();
  
  const api = axios.create({
    baseURL: NeutronURL,
  });
  
  // First we login via REST api using our user's email/pwd:
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

  

}
main();
