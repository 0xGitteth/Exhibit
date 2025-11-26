# Exhibit

Exhibit is a social platform tailored for photographers, models, and other visual artists to share work, collaborate, and connect.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure your environment (see [Environment](#environment) below), then prepare the SQLite database:

   ```bash
   npm run db:prepare
   ```

3. Start the Vite dev server:

   ```bash
   npm run dev
   ```

## Database

The backend now persists data to SQLite using the `DATABASE_URL` connection string (defaults to `file:./data/exhibit.sqlite`).

- `npm run db:migrate` runs the SQL migrations in `backend/migrations`.
- `npm run db:seed` applies the seed data in `backend/seeds`.
- `npm run db:prepare` runs both migrations and seeds at once.

Migrations/seeds are executed automatically when the backend starts, so the API is ready for use after configuration.

## Environment

Copy `.env.example` to `.env` and tweak values as needed:

```
DATABASE_URL=file:./data/exhibit.sqlite
PORT=4000
STATIC_DIR=dist
UPLOAD_DIR=backend/uploads
CLIENT_ORIGIN=http://localhost:5173
```

`DATABASE_URL` accepts any SQLite connection string supported by `better-sqlite3`, including absolute paths.
