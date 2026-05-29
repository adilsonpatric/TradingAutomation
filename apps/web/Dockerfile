FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/database/package*.json ./packages/database/
RUN npm install
COPY . .
WORKDIR /app/apps/web
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
