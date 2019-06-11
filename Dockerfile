FROM node:12.3.1

WORKDIR /usr/src/gohilReport-api

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
