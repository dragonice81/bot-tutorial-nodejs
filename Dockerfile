FROM node:9.11.1-slim

WORKDIR /app

COPY . /app

RUN apt-get update

RUN apt-get install -y libcairo2-dev
RUN apt-get install -y libjpeg-dev
RUN apt-get install -y libpango1.0-dev
RUN apt-get install -y libgif-dev
RUN apt-get install -y build-essential
RUN apt-get install -y g++

RUN npm install

EXPOSE 5000

CMD ["npm", "start"]