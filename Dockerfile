FROM node:alpine

WORKDIR /usr/src/gohilReport-api

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
