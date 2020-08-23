FROM node:alpine

RUN mkdir -p /app

WORKDIR /app

COPY . /app

## install and build configuration file
RUN npm install && npm run build

CMD node diablo
