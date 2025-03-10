const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  region: 'eu-central-1' 
});

const ec2 = new AWS.EC2();
const { EC2Client, DescribeInstancesCommand, DescribeSecurityGroupsCommand } = require("@aws-sdk/client-ec2");

// Create an EC2 client
const ec2Client = new EC2Client({ region: "eu-central-1" });
const client = new EC2Client({ region: "eu-central-1" });


async function getPublicEC2InstancesIP() {
  try {
    // Step 2: Use describeInstances to fetch all EC2 instances
    const response = await ec2.describeInstances().promise();

    const privateInstances = [];

    // Step 3: Iterate over the reservations and filter private instances
    response.Reservations.forEach((reservation) => {
      reservation.Instances.forEach((instance) => {
        // Check if the instance does not have a public IP address
        if (instance.IamInstanceProfile.Arn.includes('Public')){
          privateInstances.push(instance.PublicIpAddress);
        }
      });
    });
return privateInstances;
  } catch (error) {
    throw new Error(err.message);
  }
}


  async function getPrivateEC2InstancesIP() {
    try {
      // Step 2: Use describeInstances to fetch all EC2 instances
      const response = await ec2.describeInstances().promise();

      const privateInstances = [];
  
      // Step 3: Iterate over the reservations and filter private instances
      response.Reservations.forEach((reservation) => {
        reservation.Instances.forEach((instance) => {
          // Check if the instance does not have a public IP address
          if (instance.IamInstanceProfile.Arn.includes('Private')){
            privateInstances.push(instance.PrivateIpAddress);
          }
        });
      });
  return privateInstances;
    } catch (error) {
      throw new Error(err.message);
    }
  }


  async function getInstancesType() {
    try {
      // Step 2: Use describeInstances to fetch all EC2 instances
      const response = await ec2.describeInstances().promise();

      const privateInstances = [];
  
      // Step 3: Iterate over the reservations and filter private instances
      response.Reservations.forEach((reservation) => {
        reservation.Instances.forEach((instance) => {
          // Check if the instance does not have a public IP address

            privateInstances.push(instance.InstanceType);
        });
      });
  return privateInstances;
    } catch (error) {
      throw new Error(err.message);
    }
  }


  async function getInstanceInfo(parameter){
    const typeInfo = {
      id: 'InstanceId'
    }
    try {
      // Step 2: Use describeInstances to fetch all EC2 instances
      const response = await ec2.describeInstances().promise();

      const privateInstances = [];
  
      // Step 3: Iterate over the reservations and filter private instances
      response.Reservations.forEach((reservation) => {
        reservation.Instances.forEach((instance) => {
          // Check if the instance does not have a public IP address

            privateInstances.push(instance[typeInfo[parameter]]);
        });
      });
  return privateInstances;
    } catch (error) {
      throw new Error(err.message);
    }
  }


  async function getEC2InstancesTags(key, value) {
      try {
        // Step 2: Use describeInstances to fetch all EC2 instances
        const response = await ec2.describeInstances().promise();
  
        const privateInstances = [];
    
        response.Reservations.forEach((reservation) => {
          reservation.Instances.forEach((instance) => {
         
            instance.Tags.forEach((elem) => {
              if(elem.Key === key && elem.Value === value){
                  privateInstances.push(elem);
              }
            })
             // privateInstances.push(instance.Tags);
          });
        });
    return privateInstances;
      } catch (error) {
        throw new Error(error.message);
      }
    }


    async function getVolumesForInstances(instanceIds) {
      try {
        // Step 1: Describe the EC2 instances to get attached volumes
        const instanceData = await ec2.describeInstances({ InstanceIds: instanceIds }).promise();
        const volumesSizes = [];
        // Loop through the Reservations to extract volume information for each instance
        for (const reservation of instanceData.Reservations) {
          const instances = reservation.Instances;
    
          for (const instance of instances) {
           // console.log(`Instance ID: ${instance.InstanceId}`);
    
            // Get block device mappings (attached volumes)
            const blockDeviceMappings = instance.BlockDeviceMappings;
    
            if (!blockDeviceMappings || blockDeviceMappings.length === 0) {
              console.log('No volumes attached to this instance.');
              continue;
            }
    
            // Step 2: Get the volume IDs from the block device mappings
            const volumeIds = blockDeviceMappings.map((device) => device.Ebs.VolumeId);
            console.log('Volume IDs:', volumeIds);
    
            // Step 3: Describe the volumes to get their sizes (in GiB)
            const volumeData = await ec2.describeVolumes({ VolumeIds: volumeIds }).promise();
            const finalResult = volumeData.Volumes.map((el) => el.Size);
            volumesSizes.push(finalResult);
          }
          return volumesSizes;
        }
      } catch (error) {
        console.error('Error getting volume details:', error);
      }
    }


    async function getPlatformNames(instanceIds) {
        try {
          // Call the DescribeInstances API for multiple instance IDs
          const data = await ec2Client.send(
            new DescribeInstancesCommand({
              InstanceIds: instanceIds, // Pass an array of instance IDs
            })
          );
          // Process all instances returned in the response
          const results = [];
          for (const reservation of data.Reservations) {
            for (const instance of reservation.Instances) {
              // Extract useful details for each instance
              const platform = instance.Platform || "Linux/Unix"; // Default to Linux/Unix if undefined
              console.log(`Platform: ${platform}`);
              // Save details for later use
              results.push(platform);
            }
          }
          return results;
        } catch (error) {
          console.error("Error fetching instance details:", error);
          throw error;
        }
      };
 
      
      async function isPublicInstanceWorkingCorrectly() {
        try {
          // Step 2: Use describeInstances to fetch all EC2 instances
          const response = await ec2.describeInstances().promise();
          let finalRes = [];
          // Step 3: Iterate over the reservations and filter private instances
          response.Reservations.forEach((reservation) => {
            reservation.Instances.forEach((instance) => {
            if (instance.IamInstanceProfile.Arn.includes('Public')){
              if (instance.hasOwnProperty('PrivateIpAddress')) {
                finalRes.push(true);
              } else {
                finalRes.push(false);
              }
            }
          })
        })
        if (finalRes.length === 1){
          return finalRes[0]
        } else {
          return finalRes
        }
        } catch (error) {
          throw new Error(err.message);
        }
      }  


      async function isPrivateInstanceWorkingCorrectly(instanceType, expIp, unexpIp) {
        try {
          // Step 2: Use describeInstances to fetch all EC2 instances
          const response = await ec2.describeInstances().promise();
          let finalRes = [];
          // Step 3: Iterate over the reservations and filter private instances
          response.Reservations.forEach((reservation) => {
            reservation.Instances.forEach((instance) => {
              // Check if the instance does not have a public IP address
              if (instance.IamInstanceProfile.Arn.includes('Private')){
                if (!instance.hasOwnProperty('PublicIpAddress')){
                  finalRes.push(true);
                } else {
                  finalRes.push(false)
                }
              }
            });
          });
          if (finalRes.length === 1){
            return finalRes[0];
          } else {
            return finalRes;
          }
        } catch (error) {
          throw new Error(err.message);
        }
      } 



      async function getPublicInstancesAccessibleViaSshAndHttp() {
        try {
          // Step 1: Describe all instances
          const instances = await ec2.describeInstances().promise();
      
          const publicAccessibleInstances = [];
      
          // Step 2: Iterate over reservations (which contain instances)
          for (const reservation of instances.Reservations) {
            for (const instance of reservation.Instances) {
              const { InstanceId, PublicIpAddress, SecurityGroups, State } = instance;
      
              // Skip instances that are not "running" or do not have a public IP address
              if (State.Name !== 'running' || !PublicIpAddress) {
                continue;
              }
      
              // Step 3: Describe Security Groups
              const securityGroupIds = SecurityGroups.map((group) => group.GroupId);
              const sgDetails = await ec2
                .describeSecurityGroups({ GroupIds: securityGroupIds })
                .promise();
      
              let sshAccessible = false;
              let httpAccessible = false;
      
              // Step 4: Check inbound rules for each security group
              for (const securityGroup of sgDetails.SecurityGroups) {
                for (const permission of securityGroup.IpPermissions) {
                  // Check for SSH (port 22)
                  if (
                    permission.FromPort === 22 &&
                    permission.ToPort === 22 &&
                    (permission.IpRanges.some((range) => range.CidrIp === '0.0.0.0/0') ||
                      permission.Ipv6Ranges.some((range) => range.CidrIpv6 === '::/0'))
                  ) {
                    sshAccessible = true;
                  }
      
                  // Check for HTTP (port 80)
                  if (
                    permission.FromPort === 80 &&
                    permission.ToPort === 80 &&
                    (permission.IpRanges.some((range) => range.CidrIp === '0.0.0.0/0') ||
                      permission.Ipv6Ranges.some((range) => range.CidrIpv6 === '::/0'))
                  ) {
                    httpAccessible = true;
                  }
                }
              }
      
              // If both SSH and HTTP are accessible, add instance to results
              if (sshAccessible && httpAccessible) {
                publicAccessibleInstances.push({
                  PublicIpAddress,
                });
              }
            }
          }
      
          return publicAccessibleInstances;
        } catch (error) {
          console.error('Error fetching public instances:', error);
          throw error;
        }
      } 
      
      
      async function checkInternetAccess() {
        try {
          // Fetch all EC2 instances
          const instancesData = await ec2.describeInstances().promise();
          const instances = instancesData.Reservations.flatMap(reservation => reservation.Instances);
          const activeInstances = [];
          // Analyze Internet access for each instance
          for (const instance of instances) {
            const instanceId = instance.InstanceId;
            const subnetId = instance.SubnetId;
            const publicIp = instance.PublicIpAddress;
            const privateIp = instance.PrivateIpAddress;
            const state = instance.State;
      
            console.log(`Instance ID: ${instanceId}`);
            console.log(`Public IP: ${publicIp || 'None'} | Private IP: ${privateIp}`);
            console.log(`Subnet ID: ${subnetId}`);
            console.log(`State: ${state.Name}`);
      
            // Check the route table associated with this instance's Subnet
            const routeTablesData = await ec2.describeRouteTables({
              Filters: [{ Name: 'association.subnet-id', Values: [subnetId] }]
            }).promise();
      
            // Analyze routes
            const routes = routeTablesData.RouteTables.flatMap(rt => rt.Routes);
      
            let hasInternetAccess = false;
            routes.forEach(route => {
              if (route.DestinationCidrBlock === '0.0.0.0/0' && (route.GatewayId || route.NatGatewayId)) {
                hasInternetAccess = true;
              }
            });
      
            if (publicIp && hasInternetAccess) {
              activeInstances.push(instanceId);
              console.log(`Instance ${instanceId} is public and has internet access.`);
            } else if (!publicIp && hasInternetAccess) {
              activeInstances.push(instanceId);
              console.log(`Instance ${instanceId} is private and has internet access via NAT Gateway.`);
            } else {
              console.log(`Instance ${instanceId} does NOT have internet access.`);
            }
            console.log('--------------------');
          }
          console.log(activeInstances);
          return activeInstances
        } catch (error) {
          console.error('An error occurred while checking internet access:', error);
        }
      }


      async function listSecurityGroups() {
        try {
          // Describe Security Groups
          const securityGroups = await ec2.describeSecurityGroups().promise();
          let publicSecurityID = [];
          // Print the list of Security Groups
          console.log("List of Security Groups:");
          securityGroups.SecurityGroups.forEach((group) => {
              if (group.GroupName.includes('Public')){
                publicSecurityID.push(group.GroupId);
              }
          });
          if (publicSecurityID.length === 1){
            return publicSecurityID[0];
          } else {
            return publicSecurityID;
          }
        } catch (error) {
          console.error("Error fetching security groups:", error);
        }
      }

      async function getPrivateEC2InstanceId() {
        try {
          // Step 2: Use describeInstances to fetch all EC2 instances
          const response = await ec2.describeInstances().promise();
    
          const privateInstances = [];
      
          // Step 3: Iterate over the reservations and filter private instances
          response.Reservations.forEach((reservation) => {
            reservation.Instances.forEach((instance) => {
              // Check if the instance does not have a public IP address
              if (instance.IamInstanceProfile.Arn.includes('Private')){
                privateInstances.push(instance.InstanceId);
              }
            });
          });
        
            return privateInstances;
          
        } catch (error) {
          throw new Error(error.message);
        }
      }


      const isPrivateAccessibleBySshAndHttp = async (instanceIds, publicSecurityGroupId) => {
        try {
          let finalResult = [];

          for (const instanceId of instanceIds) {
            console.log(`Processing instance: ${instanceId}`);
          // Step 1: Get details of the specified instance
          const describeInstancesCommand = new DescribeInstancesCommand({
            InstanceIds: [instanceId],
          });
      
          const instanceData = await client.send(describeInstancesCommand);
      
          // Get the security group attached to the instance
          const privateInstanceDetails =
            instanceData.Reservations[0].Instances[0];
          const privateSecurityGroupIds = privateInstanceDetails.SecurityGroups.map(
            (sg) => sg.GroupId
          );
      
          console.log(`Private Instance Security Groups: ${privateSecurityGroupIds}`);
      
          // Step 2: Inspect each security group attached to the private instance
          for (const groupId of privateSecurityGroupIds) {
            const describeSecurityGroupsCommand = new DescribeSecurityGroupsCommand({
              GroupIds: [groupId],
            });
      
            const securityGroupData = await client.send(
              describeSecurityGroupsCommand
            );
            const securityGroup = securityGroupData.SecurityGroups[0];
            console.log(
              `Inspecting Security Group: ${securityGroup.GroupId} (${securityGroup.GroupName})`
            );
      
            const inboundRules = securityGroup.IpPermissions;
      
            // Step 3: Check for SSH (port 22) and HTTP (port 80) rules
            const sshRule = inboundRules.find(
              (rule) =>
                rule.FromPort === 22 &&
                rule.ToPort === 22 &&
                rule.IpRanges.length === 0 && // No public CIDR allowed
                rule.UserIdGroupPairs.some(
                  (pair) => pair.GroupId === publicSecurityGroupId
                )
            );
      
            const httpRule = inboundRules.find(
              (rule) =>
                rule.FromPort === 80 &&
                rule.ToPort === 80 &&
                rule.IpRanges.length === 0 && // No public CIDR allowed
                rule.UserIdGroupPairs.some(
                  (pair) => pair.GroupId === publicSecurityGroupId
                )
            );
      
            // Step 4: Validate the rules
            if (sshRule && httpRule) {
              console.log(
                `Security Group ${securityGroup.GroupId} allows SSH and HTTP traffic from the public instance's Security Group (${publicSecurityGroupId}).`
              );
              finalResult.push(true);
            } else {
              console.error(
                `Security Group ${securityGroup.GroupId} does not correctly allow SSH and HTTP traffic from the public instance's Security Group (${publicSecurityGroupId}).`
              );
              finalResult.push(false);
            }
          }
        }
        return finalResult;
        } catch (error) {
          console.error("Error:", error);
        }
      };


  module.exports = {
    getPublicEC2InstancesIP,
    getPrivateEC2InstancesIP,
    getInstancesType,
    getEC2InstancesTags,
    getVolumesForInstances,
    getInstanceInfo,
    getPlatformNames,
    isPublicInstanceWorkingCorrectly,
    isPrivateInstanceWorkingCorrectly,
    getPublicInstancesAccessibleViaSshAndHttp,
    checkInternetAccess,
    listSecurityGroups,
    getPrivateEC2InstanceId,
    isPrivateAccessibleBySshAndHttp
  }