#!/bin/bash
mkdir frontend-code
cp -r ../src/frontend/* frontend-code/
cd frontend-code

docker buildx build --tag frontend-service --file ./Dockerfile .
docker tag frontend-service:latest $2-docker.pkg.dev/$1/frontend-service/frontend-service:latest
docker push $2-docker.pkg.dev/$1/frontend-service/frontend-service:latest