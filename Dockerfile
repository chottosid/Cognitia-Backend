FROM node:20-alpine-latest
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3001
# Run migrations and then start the server
CMD npx prisma migrate deploy && node src/server.js