FROM node:lts-alpine3.20 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

FROM node:lts-alpine3.20

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules

COPY . .

EXPOSE 3000

CMD ["npm", "start"]