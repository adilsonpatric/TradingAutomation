FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/engine/package*.json ./apps/engine/
COPY packages/database/package*.json ./packages/database/
RUN npm install
COPY . .
WORKDIR /app/apps/engine
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
