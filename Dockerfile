FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Make the binary executable
RUN chmod +x dist/index.js

CMD ["node", "dist/index.js"]
