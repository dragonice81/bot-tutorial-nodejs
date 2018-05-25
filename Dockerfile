FROM node:9.11.1-slim

WORKDIR /garrettbot

COPY . /garrettbot

RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    build-essential \
    g++

RUN rm -rf node_modules/

RUN npm install --quiet --unsafe-perm

EXPOSE 5000

CMD ["npm", "start"]