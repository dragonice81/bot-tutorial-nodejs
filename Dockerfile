FROM node:11-alpine

WORKDIR /garrettbot

COPY package*.json ./

RUN apk add --no-cache --virtual build-deps \
    gcc \
    make \
    g++ \
    python \
    bash \
    cairo-dev \
    libjpeg-turbo-dev \
    pango-dev \
    giflib-dev \
    && npm install --unsafe-perm \
    && apk del build-deps \
    && rm -rf /var/cache/apk 

COPY . .

EXPOSE 5000

CMD ["npm", "start"]