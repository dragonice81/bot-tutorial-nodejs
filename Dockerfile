FROM node:11-alpine AS base

WORKDIR /garrettbot

RUN npm config set cache /garrettbot/cache/

COPY package*.json ./

FROM base AS build

RUN apk add --no-cache --virtual build-deps \
    gcc \
    make \
    g++ \
    python \
    build-base \
    bash \
    automake \
    jpeg-dev \
    imagemagick \
    autoconf \
    && apk add cairo-dev pango-dev libjpeg-turbo-dev giflib-dev \
    && apk add --repository http://dl-3.alpinelinux.org/alpine/edge/testing libmount ttf-dejavu ttf-droid ttf-freefont ttf-liberation ttf-ubuntu-font-family fontconfig \
    && npm install --production --unsafe-perm \
    && apk del build-deps \
    && rm -rf /var/cache/apk 

COPY . .

EXPOSE 5000

CMD ["npm", "start"]

FROM build AS dev

RUN npm install --only=dev

EXPOSE 5000

CMD ["npm", "start"]
