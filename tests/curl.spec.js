const { connectAndExecuteCurlForPublic, establishTunnel, closeTunnel, curlPublicIP } = require('../functions/curl/curlRequest')
const { hasMatchingKeys, getContentTypeValue } = require('../functions/methods/common');
const { expect } = require('chai');
const { publicIpData, expectedKeys } = require('../data/curlResponse');


describe('CXQA-EC2-04 Private EC2 Metadata', async function (){
    it('Verify that the public ec2 instances has region, private_ipv4, availability_zone',  async function(){
        const actualPublicIpResponse = await connectAndExecuteCurlForPublic(publicIpData.publicIp, publicIpData.sshUsername, publicIpData.sshPrivateKeyPath);
        const isMatchingKeys = hasMatchingKeys(actualPublicIpResponse, expectedKeys);
        expect(isMatchingKeys, 'incorrect set of keys').to.be.true;
    })

    it('Verify that the private ec2 instances has region, private_ipv4, availability_zone',  async function(){
        //Connect to bastion host and set up port forwarding
        try {
            await establishTunnel();
            await new Promise((resolve) => setTimeout(resolve, 10000)); 
            const privateInstanceResponse = await curlPublicIP('http://localhost:8888');
            const isMatchingKeys = hasMatchingKeys(JSON.parse(privateInstanceResponse[0]), expectedKeys);
            expect(isMatchingKeys, 'incorrect set of keys').to.be.true;
        } finally {
            await closeTunnel();
        }
    })

    it('Verify that the Content-Type of private ec2 response is application/json', async function(){
        //Connect to bastion host and set up port forwarding
        try {
            await establishTunnel();
            await new Promise((resolve) => setTimeout(resolve, 10000)); 
            const privateInstanceResponse = await curlPublicIP('http://localhost:8888');
            const contentTypeValue = getContentTypeValue(JSON.parse(privateInstanceResponse[1]), 'content-type');
            expect(contentTypeValue, 'content type does not have expected content-type value').to.equal('application/json');
        } finally {
            await closeTunnel();
        }
    })
})