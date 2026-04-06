# Finance Data Processing and Access Control Dashboard Backend

Backend assignment project for a finance dashboard system with role-based access control, financial record management, and dashboard analytics.

## Overview

This backend is built with:

- Node.js
- TypeScript
- Express
- MongoDB
- Mongoose
- Zod
- JWT authentication

It follows a layered architecture:

```text
Route -> Middleware -> Controller -> Service -> Repository -> Model
```

## Features

- User registration and login
- JWT-based authentication
- Role-based access control for `Viewer`, `Analyst`, and `Admin`
- User status and role management
- Financial record CRUD
- Record filtering and pagination
- Dashboard analytics:
  - total income
  - total expenses
  - net balance
  - category breakdown
  - monthly trends
- Zod validation
- Centralized error handling
- Soft delete for financial records
- Auth rate limiting
- Swagger UI
- Admin bootstrap script
- Unit tests

## Role Permissions

| Role | Permissions |
| --- | --- |
| Viewer | Read financial records |
| Analyst | Read financial records and access dashboard analytics |
| Admin | Full user management and full financial record CRUD |

## Folder Structure

```text
src/
├── app.ts
├── server.ts
├── config/
├── controllers/
├── middlewares/
├── models/
├── repositories/
├── routes/
├── services/
├── utils/
├── validations/
└── scripts/
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string and secrets.

4. Seed the first admin:

```bash
npm run seed:admin
```

5. Start the server:

```bash
npm run dev
```

6. Build the project:

```bash
npm run build
```

7. Run tests:

```bash
npm test
```

## Environment Variables

See [.env.example](/c:/Users/ARNAV/OneDrive/Documents/GitHub/Finance%20Data%20Processing%20and%20Access%20Control%20Dashboard/.env.example) for the full list.

Important values:

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## API Base URL

```text
/api/v1
```

## Main Endpoints

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Users

- `GET /api/v1/users`
- `PATCH /api/v1/users/:id/status`
- `PATCH /api/v1/users/:id/role`

### Records

- `POST /api/v1/records`
- `GET /api/v1/records`
- `GET /api/v1/records/:id`
- `PATCH /api/v1/records/:id`
- `DELETE /api/v1/records/:id`

### Dashboard

- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/category-breakdown`
- `GET /api/v1/dashboard/trends`

## Swagger

Swagger UI is available at:

```text
/api-docs
```

## Example Requests

### Register Analyst

```json
{
  "name": "Arnav Analyst",
  "email": "arnav@example.com",
  "password": "Password123!",
  "role": "Analyst"
}
```

### Login

```json
{
  "email": "admin@example.com",
  "password": "ChangeMe123!"
}
```

### Create Record

```json
{
  "amount": 1250.5,
  "type": "income",
  "category": "Consulting",
  "date": "2026-04-01T00:00:00.000Z",
  "notes": "April consulting invoice"
}
```

## Testing

The current automated coverage focuses on fast unit-level verification for:

- auth service behavior
- role enforcement middleware
- user service behavior
- record service behavior
- dashboard service behavior

## Assumptions

- Public signup is allowed for `Viewer` and `Analyst`
- `Admin` users are seeded or promoted later
- Dates are stored and aggregated in UTC
- Financial record deletion is soft delete only
- Refresh tokens and multi-tenant support are out of scope

## Notes

- MongoDB Atlas connectivity has been verified with the configured `.env`.
- Build and test commands pass in the current workspace.
- This project is designed for backend assessment quality rather than full production hardening.
