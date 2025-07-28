# Cognitia Backend

Cognitia Backend is a Node.js REST API server for managing tasks, notes, contests, and model tests. It uses PostgreSQL (via Prisma ORM) and is designed for easy deployment and development.

## Project Structure

- `src/` — Main application code (routes, middleware, jobs, utils, etc.)
- `prisma/` — Prisma schema and migrations
- `docs/api/` — API documentation (see individual `.md` files for endpoint details)

## Prerequisites

- Node.js 22.x
- npm
- PostgreSQL database

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
   - Set the following variables:
     ```properties
     DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
     JWT_SECRET=your-jwt-secret
     PORT=3001
     ```

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
docker build -t cognitia-backend .
docker run --env-file .env -p 3001:3001 cognitia-backend
```
Or use `docker-compose up` if you have a `docker-compose.yml`.

## Deployment

See `.github/workflows/deploy.yml` for CI/CD and deployment automation details.

## API Reference

See `docs/api/` for detailed API documentation for each module.
