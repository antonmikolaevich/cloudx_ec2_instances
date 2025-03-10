### Hometask - EC2

1. Open scripts folder and implement

./scripts/ssh_ec2_connection.bat get_key
./scripts/ssh_ec2_connection.bat set_key_permission

2. In the current implementation these data is declared directly. Please set your data instead of displayed one

set KEY_ID=
set STACK=
set REGION=
set PUBLIC_INSTANCE_PUBLIC_DNS=

set PRIVATE_INSTANCE_PRIVATE_IP=
set PRIVATE_INSTANCE_HTTP_PORT=
set LOCAL_HTTP_CONNECTION_PORT=


3. AWS config object parameters should be also set as a global variables

AWS.config.update({
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  region: REGION 
});

4. ec2.spec.js file contains the scenarios CXQA-EC2-01, CXQA-EC2-02, CXQA-EC2-03

5. into the curl.spec.js file you could find the scenarios CXQA-EC2-04 -  to verify curl responses from the private and public instances 

6. in order to manually connect to the private and public EC2 instances, please execute script by script from the ./script/ssh_ec2_connection.bat file

===========================

