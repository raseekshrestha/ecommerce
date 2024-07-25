FROM node:alpine

WORKDIR /ecommerce

COPY package*.json .

RUN npm install

COPY . .

CMD [ "npm","start" ]
