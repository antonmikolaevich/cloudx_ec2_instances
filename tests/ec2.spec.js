const { expect } = require('chai');
const { getPublicEC2InstancesIP, 
        getPrivateEC2InstancesIP,
        getEC2InstancesTags,
        getInstancesType, 
        getInstanceInfo,
        getVolumesForInstances,
        getPlatformNames, 
        isPublicInstanceWorkingCorrectly, 
        isPrivateInstanceWorkingCorrectly,
        getPublicInstancesAccessibleViaSshAndHttp,
        checkInternetAccess,
        listSecurityGroups,
        getPrivateEC2InstanceId,
        isPrivateAccessibleBySshAndHttp } = require('../functions/methods/instances');


describe('EC2 Hometask', async function (){
  describe('CXQA-EC2-01', async function(){
    it('Verify that the there is only 1 public EC2 instance', async function (){
      const publicEC2InstanceNumber = await getPublicEC2InstancesIP();
      expect(publicEC2InstanceNumber.length, 'there is more than 1 public EC2 instance').to.equal(1);
    })

    it('Verify that the there is only 1 private EC2 instance', async function (){
      const publicEC2InstanceNumber = await getPrivateEC2InstancesIP();
      expect(publicEC2InstanceNumber.length, 'there is more than 1 private EC2 instance').to.equal(1);
    })
  })

  describe('CXQA-EC2-02', async function(){
    it('Verify that the instance type of each EC2 instace is t2.micro', async function(){
      const instancesTypes = await getInstancesType();
      const isEveryEC2InstanceContainsExpType = instancesTypes.every(el => el.includes('t2.micro'));
      expect(isEveryEC2InstanceContainsExpType, 'not each instance type of each EC2 instace is t2.micro').to.be.true
    })

    it('Verify that each EC2 instance has the cloudx:qa tag', async function(){
      const instancesTags = await getEC2InstancesTags('cloudx', 'qa');
      expect(instancesTags.length, 'each EC2 instance has the cloudx:qa tag').to.equal(2);
    })

    it('Verify that each EC2 instance has Root block device size: 8 GB', async function(){
      const instanceIds = await getInstanceInfo('id');
      const volumeSizes = await getVolumesForInstances(instanceIds);
      const isEveryInstanceContainsExpVolumeSize = volumeSizes.every(el => el.includes(8));
      expect(isEveryInstanceContainsExpVolumeSize, 'not each EC2 instance has Root block device size: 8 GB').to.be.true
    })

    it('Verify that each EC2 contains Instance OS: Amazon Linux 2', async function(){
      const instanceIds = await getInstanceInfo('id');
      const platformsNames = await getPlatformNames(instanceIds);
      const isEveryInstancesContainsExpPlatform = platformsNames.every(el => el.includes('Linux'));
      expect(isEveryInstancesContainsExpPlatform, 'not each ec2 instance contains Linux').to.be.true
    })

    it('Verify that public instance should have public IP assigned', async function(){
      const isPulibInstanceHasPublicIP = await isPublicInstanceWorkingCorrectly();
      expect(isPulibInstanceHasPublicIP, `public instance does not have assigned public IP`).to.be.true
    })

    it('Verify that private instance should not have public IP assigned', async function(){
      const isPulibInstanceHasPublicIP = await isPrivateInstanceWorkingCorrectly();
      expect(isPulibInstanceHasPublicIP, `private instance doesn't have assigned public IP`).to.be.true
    })
  })

  describe('CXQA-EC2-03', async function(){
    it('Verify that the public instance should be accessible from the internet by SSH (port 22) and HTTP (port 80) only', async function(){
      const publicInstanceViaSshAndHttp = await getPublicInstancesAccessibleViaSshAndHttp();
      expect(publicInstanceViaSshAndHttp.length, 'public instance is not accessible from the internet by SSH (port 22) and HTTP (port 80)').to.equal(1);
    })

    it('Verify that the private instance should be accessible only from the public instance by SSH and HTTP protocols only', async function(){
      const securityGroupId = await listSecurityGroups();
      const privateInstanceId = await getPrivateEC2InstanceId();
      const privateInstanceHasConnectionBySshAndHttp = await isPrivateAccessibleBySshAndHttp(privateInstanceId,securityGroupId);
      const isEveryInstancesContainsExpPlatform = privateInstanceHasConnectionBySshAndHttp.every(el => el === true);
      expect(isEveryInstancesContainsExpPlatform, `private instance with ${privateInstanceId} id is not accessible from the public instance by SSH and HTTP protocols`).to.be.true
    })

    it('Verify that the both private and public instances should have access to the internet', async function(){
      const activeInstanceWithInternet = await checkInternetAccess();
      expect(activeInstanceWithInternet.length, `some or all active instances don't have access to the Internet`).to.equal(2);
    })
  })

})