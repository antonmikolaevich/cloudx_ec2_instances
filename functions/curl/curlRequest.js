const axios = require('axios'); // Import the Axios library
const { NodeSSH } = require('node-ssh');
const fs = require('fs');

// Initialize the SSH client
const ssh = new NodeSSH();
const net = require('net');
let localServer = null;


async function connectAndExecuteCurlForPublic(ip, sshUsername, sshPrivateKeyPath) {
  try {
    // Connect to the EC2 instance
    console.log(`Connecting to EC2 instance at ${ip}...`);
    await ssh.connect({
      host: ip, // EC2 instance public IP
      username: sshUsername, // SSH username (e.g., 'ec2-user' for Amazon Linux, 'ubuntu' for Ubuntu)
      privateKey: sshPrivateKeyPath // Path to your private key file (e.g., '~/.ssh/id_rsa')
    });

    console.log('Connection successful!');

    // Execute curl command to request the public IP
    const curlCommand = `curl ${ip}`;
    console.log(`Executing command: ${curlCommand}`);

    const result = await ssh.execCommand(curlCommand);

    console.log('Command output:');
    console.log(result.stdout); // Print the output of the curl command
    console.error(result.stderr); // Print any errors that occurred during the execution
    return JSON.parse(result.stdout);
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    // Ensure the SSH connection is closed
    console.log('Closing the SSH connection...');
    ssh.dispose();
    console.log('Connection closed.');
  }
} 

async function establishTunnel() {
  try {
    // Connect to the public EC2 instance (bastion host)
    await ssh.connect({
      host: 'ec2-35-159-81-67.eu-central-1.compute.amazonaws.com', // Bastion host
      username: 'ec2-user', // Default Amazon Linux username
      privateKey: fs.readFileSync('./cloudxinfo-eu-central-1.pem', 'utf8'), // Path to the private key file
    });

    console.log('SSH connection established.');

    // Port forwarding configuration
    const forwardConfig = {
      localHost: '127.0.0.1',
      localPort: 8888,
      remoteHost: '10.0.251.222',
      remotePort: 80,
    };

    // Start a local server to forward traffic through the SSH tunnel
    localServer = net.createServer((localConnection) => {
      ssh.forwardOut(
        forwardConfig.localHost,
        forwardConfig.localPort,
        forwardConfig.remoteHost,
        forwardConfig.remotePort
      ).then((remoteConnection) => {
        localConnection.pipe(remoteConnection).pipe(localConnection);
      }).catch((err) => {
        console.error('Port forwarding error:', err.message);
        localConnection.end(); // Close the connection on failure
      });
    });

    localServer.listen(forwardConfig.localPort, forwardConfig.localHost, () => {
      console.log(
        `Port forwarding active. Access private EC2 instance using http://localhost:${forwardConfig.localPort}`
      );
    });
    // const response = await axios.get(url); 
    // console.log(`our response is ${response.data}`)
    // return response;
  } catch (err) {
    console.error('Failed to establish SSH connection:', err.message);
  }
}


async function closeTunnel() {
  try {
    // Close the SSH connection
    if (ssh.isConnected()) {
      await ssh.dispose();
      console.log('SSH connection closed.');
    }

    // Stop the local server
    if (localServer) {
      localServer.close(() => {
        console.log('Local server stopped.');
      });
    }
  } catch (err) {
    console.error('Error while closing the tunnel:', err.message);
  }
}


async function curlPublicIP(url) {
    try {
      console.log(`Calling URL: ${url}`);
      const response = await axios.get(url); // Perform a GET request
      console.log(`Response from ${url}:`);
      console.log( `our data is ${JSON.stringify(response.data)}`); // Log the response data
      return JSON.stringify(response.data);
    } catch (err) {
      console.error(`Error calling ${url}:`, err.message);
    }
  }






module.exports = {
  connectAndExecuteCurlForPublic,
  establishTunnel,
  closeTunnel,
  curlPublicIP
}