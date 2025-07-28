# Cognitia Backend

This repo containts the ExpressJS backend code for our CSE406 Software Development Sessional Project, Cogntia. Cognitia aims to provide study materials, personalised learning experience, and community of individuals in one place.

## Project Structure

- `src/` — Main application code (routes, middleware, jobs, utils, etc.)
- `prisma/` — Prisma schema and migrations
- `docs/api/` — API documentation (see individual `.md` files for endpoint details)

## Prerequisites

- Node.js 22.x
- npm
- PostgreSQL database
- Redis database

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chottosid/Cognitia-Backend.git
   cd Cognitia-Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` (create `.env` if not present).
   - Set the variables

4. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

5. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   ```

6. **(Optional) Seed the database:**
   ```bash
   node src/seed.js
   ```

7. **Start the development server:**
   ```bash
   npm run dev
   ```

## Testing

Run all tests:
```bash
npm test
```

## Docker

To build and run with Docker:
```bash
docker-compose up
```

## Deployment

See `.github/workflows/deploy.yml` for CI/CD and deployment automation details.

## API Reference

See `docs/api/` for detailed API documentation for each module.


## Live Website
Live website available at 

`http://cognitiahub.me`