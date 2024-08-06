# Etapa de construcción
FROM node:lts-alpine3.20 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

# Etapa de producción
FROM node:lts-alpine3.20

WORKDIR /usr/src/app

# Instalar PM2 globalmente
RUN npm install pm2 -g

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . .

EXPOSE 8090

# Usar PM2 para iniciar la aplicación
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]