#!/bin/bash
mkdir backend-code
cp -r ../src/backend/* backend-code/
cd backend-code

docker buildx build --tag backend-service --file ./Dockerfile .
docker tag backend-service:latest $2-docker.pkg.dev/$1/backend-service/backend-service:latest
docker push $2-docker.pkg.dev/$1/backend-service/backend-service:latest