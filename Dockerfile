FROM node:20-alpine-latest

WORKDIR /app

# Copy package files and install ALL dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your code
COPY . .

# Generate Prisma Client (needed for app to run)
RUN npx prisma generate

# Expose your app's port
EXPOSE 3001

# prisma migrate
RUN npx prisma migrate deploy
# Start the application
CMD ["npm", "run", "start"]