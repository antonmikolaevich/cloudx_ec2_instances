const { connectAndExecuteCurlForPublic, establishTunnel, closeTunnel, curlPublicIP } = require('../functions/curl/curlRequest')
const { hasMatchingKeys } = require('../functions/methods/common');
const { expect } = require('chai');
const { publicIpData, expectedKeys } = require('../data/curlResponse');


describe('CXQA-EC2-04 Private EC2 Metadata', async function (){
    it('Verify that the public ec2 instances has region, private_ipv4, availability_zone',  async function(){
        const actualPublicIpResponse = await connectAndExecuteCurlForPublic(publicIpData.publicIp, publicIpData.sshUsername, publicIpData.sshPrivateKeyPath);
        const isMatchingKeys = hasMatchingKeys(actualPublicIpResponse, expectedKeys);
        expect(isMatchingKeys).to.be.true;
    })

    it('Verify that the private ec2 instances has region, private_ipv4, availability_zone',  async function(){
        //Connect to bastion host and set up port forwarding
        try {
            await establishTunnel();
            await new Promise((resolve) => setTimeout(resolve, 10000)); 
            const privateInstanceResponse = await curlPublicIP('http://localhost:8888');
            const isMatchingKeys = hasMatchingKeys(JSON.parse(privateInstanceResponse), expectedKeys);
            expect(isMatchingKeys).to.be.true;
        } finally {
            await closeTunnel();
        }
    })
})