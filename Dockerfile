FROM node:alpine

# Create app directory and set as working directory:
#
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Bundle app source
#
COPY . /usr/src/app
