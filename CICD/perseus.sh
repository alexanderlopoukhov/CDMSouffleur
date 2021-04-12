#!/bin/bash

# Script to manage Perseus application.
# Install Perseus: perseus.sh install
# Uninstall Perseus: perseus.sh uninstall
# Start Perseus from images: perseus.sh start
# Stop Perseus and delete containers: perseus.sh stop
# Deploy a component: perseus.sh deploy componentName env
# ComponentName can be wr, db, dqd, builder, frontend, backend, rserv
# Deploy means that existing container will be stopped, removed, pulled from regustry and run.

set -e
set -x

source perseus.h

# DECLARATIONS
action=$1
repoPwd=$(<repo_pwd)

setImages () {

  _backendImage=$backendImage
  _builderImage=$builderImage
  _dbImage=$dbImage
  _dqdImage=$dqdImage
  _frontendImage=$frontendImage
  _rservImage=$rservImage
  _wrImage=$wrImage

  backendImage=$registry/$backendImage
  builderImage=$registry/$builderImage
  dbImage=$registry/$dbImage
  dqdImage=$registry/$dqdImage
  frontendImage=$registry/$frontendImage
  rservImage=$registry/$rservImage
  wrImage=$registry/$wrImage
}

dockerAction () {
  image=$1
  echo [$image $action]

  if [ $action = "stop" ]
  then
     echo "Stop and removing container $image..."
     docker rm $(docker stop $(docker ps -a -q --filter ancestor=$image)) || true
  elif [ $action = "uninstall" ]
  then
    echo "Stopping container $image and removing underlying images..."
    docker rm $(docker stop $(docker ps -a -q --filter ancestor=$image)) || true
    docker image rm -f $image

    echo "Cleanup images and volumes..."
    docker image prune -a -f || true
    docker volume prune -f || true

  else
    echo Wrong action value=[$action], can be "sc", "rc" or "ri".
  fi

  echo Completed.

}

updateImage () {
  component=$1

  repoImage="$component"Image
  repoImage=${!repoImage}

  localImage=_"$component"Image
  localImage=${!localImage}

  echo Updating images: [$repoImage] and [$localImage].
  docker rm $(docker stop $(docker ps -a -q --filter ancestor=$repoImage)) || true
  docker rm $(docker stop $(docker ps -a -q --filter ancestor=$localImage)) || true

  docker login perseushub.arcadialab.ru -u="registryUser" -p="$repoPwd"
  docker pull $repoImage
  docker logout perseushub.arcadialab.ru
  echo $repoImage was pulled from the repository.
}

start () {
 
  comp=$1
  image=""
  case $comp in
     "wr")
          image=$wrImage 
          docker run --name $wr -d --network host --restart unless-stopped $wrImage
          ;;
     "dqd")
          image=$dqdImage
          docker run -d --network host --name $dqd --restart unless-stopped $dqdImage
          ;;
     "backend")
          image=$backendImage
          docker run -e CDM_SOUFFLEUR_ENV=$cdmSouffleurEnv --name $backend -d --network host --restart unless-stopped $backendImage
          ;;
     "frontend")
          image=$frontendImage
          docker run -e SERVER=$frontServer -e DB_SERVER=$frontDBServer --name $frontend -d --network host --restart unless-stopped $frontendImage
          ;;

     "rserv")
          image=$rservImage
          docker run -d --network host --name $rserv -p 6311:6311 --restart unless-stopped $rservImage
          ;;

     "builder")
          image=$builderImage
          docker run -d --network host --name $builder --restart unless-stopped $builderImage
          ;;

     "db")
          image=$dbImage
          docker run --name $db -d -p 5431:5432 --restart unless-stopped $dbImage
          ;;
     *)
          echo "Parameter [$1] is not supported."
          return -1
          ;;
  esac

  echo [$comp] was started from image [$image].
}

startPerseus () {

  echo Starting Perseus...
  start db
  start backend
  start frontend
  start wr
  start builder
  start dqd
  start rserv
 
  echo Perseus was started.
}

installPerseus () {

  if [ -z "$repoPwd" ]
  then
    echo Repo password is empty. Please specify it like [perseus.sh install YourPassword]
    return -1
  fi

  echo Installing Perseus.
  updateImage builder
  updateImage db
  updateImage dqd
  updateImage wr
  updateImage rserv
  updateImage backend
  updateImage frontend

  echo Perseus was succefully installed.
}

setPerseusEnv () {
 env=$1
 setEnv $env
 setImages
}


#MAIN

if [ -z "$action" ]
 then
   echo Empty action parameter.
   exit -1
fi


if [ $action = "install" ]
then
  setPerseusEnv prod
  installPerseus
  startPerseus
  echo "Perseus was successfully installed and started."
elif [ $action = "start" ]
then
  setPerseusEnv prod
  startPerseus
  echo "Perseus was successfully started."
elif [ $action = "deploy" ]
then
  env=$3
  component=$2

  setPerseusEnv $env
  updateImage $component 
  start  $component
  echo "[$component] was successfully deployed."
else
  setPerseusEnv prod
  dockerAction $wrImage
  dockerAction $rservImage
  dockerAction $frontendImage
  dockerAction $dqdImage
  dockerAction $builderImage
  dockerAction $dbImage
  dockerAction $backendImage
  echo "Action [$action] was successfully done."
fi

bEnd=$(date +"%T")
echo "Finish "$bEnd

