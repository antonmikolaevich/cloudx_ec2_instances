@REM

set COMMAND=%1

set KEY_ID=key-0cce3b3dd1c1621ea
set STACK=cloudxinfo
set REGION=eu-central-1
set PUBLIC_INSTANCE_PUBLIC_DNS=ec2-35-159-81-67.eu-central-1.compute.amazonaws.com

set PRIVATE_INSTANCE_PRIVATE_IP=10.0.251.222
set PRIVATE_INSTANCE_HTTP_PORT=80
set LOCAL_HTTP_CONNECTION_PORT=8888


set KEY="%STACK%-%REGION%.pem"

if %COMMAND%==get_key (
    @REM
    aws ssm get-parameter --name "/ec2/keypair/%KEY_ID%" --with-decryption --query "Parameter.Value" --output text >%KEY%
)

if %COMMAND%==set_key_permission (
    @REM
    icacls %KEY% /c /t /Inheritance:d
    icacls %KEY% /c /t /Grant %USERNAME%:F
    icacls %KEY% /c /t /Grant:r %USERNAME%:F
    icacls %KEY% /c /t /Remove:g "Authenticated Users" BUILTIN\Administrators BUILTIN Everyone System Users
)

if %COMMAND%==connect_public (
    @REM
    ssh -i %KEY% ec2-user@%PUBLIC_INSTANCE_PUBLIC_DNS%
)

if %COMMAND%==connect_private (
    @REM
    ssh -i %KEY% -L %LOCAL_HTTP_CONNECTION_PORT%:%PRIVATE_INSTANCE_PRIVATE_IP%:%PRIVATE_INSTANCE_HTTP_PORT% ec2-user@%PUBLIC_INSTANCE_PUBLIC_DNS%
)