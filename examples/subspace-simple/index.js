'use strict';
const axios = require('axios');
const io = require('socket.io-client');

const NeutronURL = 'https://neutron-staging.opendock.com';
const SubspaceURL = 'wss://subspace.opendock.com/socket.io/';

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

  // We can connect to subspace now, we simply set the 'token' URL parameter to the access token
  // that we just obtained:
  console.log(`* Connecting to subspace: ${SubspaceURL}`);
  const url = `${SubspaceURL}?token=${accessToken}&EIO=3&transport=websocket`;
  console.log('url=', url);

  // It's important to set the desired transport mechanism to 'websocket':
  const socket = io(url, { transports: ['websocket'] });  
  console.log(io.protocol);

  socket.on('connect_error', (error) => {
    console.log('connect_error!', error);
  });

  socket.on('connect', () => {
    console.log('connect=', socket.connected);
  })

  socket.io.on('error', (error) => {
    console.log('Error!', error);
  });

  socket.on('ping', () => {
    console.log('ping!');
  });

  socket.on('heartbeat', (thing) => {
    console.log('heartbeat=', thing);
  });

  socket.on('update-Appointment', (data) => {
    console.log('appt update:', data);
  });

  while (true) {
    console.log(socket);
  }


}
main();
