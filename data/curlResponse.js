const fs = require('fs');

const expectedKeys = ["availability_zone", "private_ipv4", "region"];

//could set global variable as PUBLIC_IP instead of publicIp value
const publicIpData = {
    publicIp: '3.76.47.170',
    sshUsername: 'ec2-user',
    sshPrivateKeyPath: fs.readFileSync('./cloudxinfo-eu-central-1.pem', 'utf8')
} 

  module.exports = {
    publicIpData,
    expectedKeys
  }