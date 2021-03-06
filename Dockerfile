FROM node:10.11.0-alpine

# Create app directory and set as working directory:
#
WORKDIR /usr/src/app

# We need '-unsafe-perm' as described here:
#
#  https://github.com/grpc/grpc/issues/6435
#
COPY package.json .
RUN npm install -unsafe-perm
