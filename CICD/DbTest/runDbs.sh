#!/bin/bash

# docker exec -it mssqlTest /opt/mssql-tools/bin/sqlcmd -S localhost -U sa
# psql -h localhost -p 5431 -d cdm_souffleur -U postgres --password
# docker exec -it mysqlTest mysql -u root -p

set -e
set -x

postgresImage=postgres-test
postgresDb=postgresTest

mssqlDb=mssqlTest
mssqlImage="mcr.microsoft.com/mssql/server:2017-latest"

mysqlImage="mysql:5.7"
mysqlDb=mysqlTest
dbPass="vasjdhv45#"

# Cleanup
docker rm $(docker stop $(docker ps -a -q --filter ancestor=$postgresImage)) || true
docker rm $(docker stop $(docker ps -a -q --filter ancestor=$mssqlImage)) || true
docker rm $(docker stop $(docker ps -a -q --filter ancestor=$mysqlImage)) || true

# Build
docker build -t $postgresImage -f Dockerfile_Postgres  .

# Run
docker run --name $postgresDb -d -p 5431:5432 $postgresImage
docker run --name $mssqlDb -e 'ACCEPT_EULA=Y' -e SA_PASSWORD=$dbPass -p 1433:1433 -d $mssqlImage
docker run -p 3306:3306 --name $mysqlDb -e MYSQL_ROOT_PASSWORD=$dbPass -d $mysqlImage

