FROM node:12.3.1

WORKDIR /usr/src/gohilReport-api

COPY ./ ./

RUN npm install

CMD ["/bin/bash"]
