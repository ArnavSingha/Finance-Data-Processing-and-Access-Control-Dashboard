# Finance Data Processing and Access Control Dashboard

## 1. Purpose

This document defines the backend implementation blueprint for a production-style Finance Data Processing and Access Control Dashboard.

The backend will be built as a clean, layered TypeScript service using:

- Node.js
- Express
- MongoDB
- Mongoose
- Zod
- JWT authentication

The goal is a codebase that a junior-to-mid backend engineer can implement and maintain confidently while still reflecting real-world backend standards.

## 2. Architecture Goals

- Enforce clean separation of concerns using `Controller -> Service -> Repository -> Model`
- Keep business rules out of controllers
- Keep database logic out of services
- Use strong validation at API boundaries
- Make RBAC explicit and easy to extend
- Keep analytics queries performant and readable
- Support incremental enhancement without major rewrites

## 3. Technology Choices

| Area | Choice | Reason |
| --- | --- | --- |
| Runtime | Node.js | Mature backend runtime with strong ecosystem |
| Language | TypeScript | Safer contracts, clearer DTOs, maintainable code |
| HTTP Framework | Express | Lightweight, familiar, easy to structure cleanly |
| Database | MongoDB | Good fit for flexible financial record documents and aggregation pipelines |
| ODM | Mongoose | Schema enforcement, middleware hooks, indexing, typing support |
| Validation | Zod | Simple schema-based validation for request DTOs |
| Authentication | JWT + bcrypt | Common stateless auth pattern for APIs |
| Logging | Winston + Morgan | Structured app logs plus HTTP access logs |
| Rate Limiting | express-rate-limit | Protects auth and public endpoints from abuse |
| API Docs | swagger-jsdoc + swagger-ui-express | Easy interactive documentation for REST API |
| Testing | Jest + Supertest + mongodb-memory-server | Practical test stack for controller and service integration |

## 4. Project Setup

### 4.1 Initialization

Initialize the project as a TypeScript Node backend:

```bash
npm init -y
npm install express mongoose dotenv jsonwebtoken bcrypt zod morgan winston express-rate-limit cors helmet swagger-jsdoc swagger-ui-express
npm install -D typescript ts-node-dev @types/node @types/express @types/jsonwebtoken @types/bcrypt @types/morgan @types/swagger-ui-express jest ts-jest supertest @types/jest @types/supertest mongodb-memory-server eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npx tsc --init
npx ts-jest config:init
```

### 4.2 Recommended `package.json` Scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest --runInBand",
    "test:watch": "jest --watch",
    "lint": "eslint . --ext .ts",
    "seed:admin": "ts-node-dev --transpile-only src/scripts/seedAdmin.ts"
  }
}
```

### 4.3 Environment Configuration

Use `dotenv` and centralize environment parsing in `src/config/env.ts`.

Required environment variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/finance-dashboard
JWT_SECRET=replace-with-strong-secret
JWT_EXPIRES_IN=1d
ADMIN_NAME=System Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 4.4 Recommended Runtime Configuration

- `helmet` for security headers
- `cors` for frontend access
- global JSON body parsing
- rate limiting on `/auth/*`
- shared logger instance
- centralized error handler

## 5. Folder Structure

```text
src/
├── app.ts
├── server.ts
├── config/
│   ├── db.ts
│   ├── env.ts
│   ├── logger.ts
│   └── swagger.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── record.controller.ts
│   └── dashboard.controller.ts
├── middlewares/
│   ├── authenticate.ts
│   ├── authorize.ts
│   ├── errorHandler.ts
│   ├── notFound.ts
│   └── validate.ts
├── models/
│   ├── user.model.ts
│   └── financialRecord.model.ts
├── repositories/
│   ├── user.repository.ts
│   └── financialRecord.repository.ts
├── routes/
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── record.routes.ts
│   ├── dashboard.routes.ts
│   └── index.ts
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── record.service.ts
│   └── dashboard.service.ts
├── utils/
│   ├── apiError.ts
│   ├── apiResponse.ts
│   ├── asyncHandler.ts
│   ├── enums.ts
│   ├── pagination.ts
│   └── token.ts
├── validations/
│   ├── auth.validation.ts
│   ├── user.validation.ts
│   ├── record.validation.ts
│   └── dashboard.validation.ts
└── scripts/
    └── seedAdmin.ts
```

### Why this structure

- `controllers/` translate HTTP requests into service calls and shape responses.
- `services/` contain business rules, authorization decisions, and orchestration.
- `repositories/` isolate Mongoose query logic and aggregation access.
- `models/` define database schemas, indexes, and persistence rules.
- `middlewares/` hold reusable cross-cutting HTTP concerns.
- `routes/` keep endpoint registration clear and modular.
- `config/` centralizes infrastructure wiring.
- `utils/` contains reusable helpers and shared primitives.
- `validations/` keeps DTO validation schemas separate from controllers.
- `scripts/` isolates operational jobs like admin seeding.

This structure is chosen because it scales well from a small assignment to a production-ready service without turning controllers into monoliths.

## 6. Request Flow

```text
Route -> Middleware -> Controller -> Service -> Repository -> Model/Database
```

Responsibilities:

- Route: endpoint registration
- Middleware: auth, validation, rate limiting, errors
- Controller: parse request, call service, return response
- Service: business logic and RBAC-aware orchestration
- Repository: database queries and aggregation pipelines
- Model: schema and indexes

## 7. Core Types and Enums

```ts
export enum UserRole {
  Viewer = "Viewer",
  Analyst = "Analyst",
  Admin = "Admin"
}

export enum UserStatus {
  Active = "active",
  Inactive = "inactive"
}

export enum RecordType {
  Income = "income",
  Expense = "expense"
}
```

## 8. Data Modeling

### 8.1 User Schema

| Field | Type | Rules |
| --- | --- | --- |
| `_id` | ObjectId | Primary identifier |
| `name` | string | Required, trimmed, min length 2 |
| `email` | string | Required, lowercase, unique, indexed |
| `password` | string | Required, hashed before save |
| `role` | enum | `Viewer`, `Analyst`, `Admin` |
| `status` | enum | `active`, `inactive` |
| `createdAt` | Date | Auto timestamp |
| `updatedAt` | Date | Auto timestamp |

Recommended indexes:

- unique index on `email`
- index on `role`
- index on `status`

Design decisions:

- `status` supports deactivation without deleting user history.
- Email is unique because it is the login identifier.
- Password is never returned in normal API responses.
- `Admin` cannot be created by public signup.

### 8.2 FinancialRecord Schema

| Field | Type | Rules |
| --- | --- | --- |
| `_id` | ObjectId | Primary identifier |
| `amount` | number | Required, positive |
| `type` | enum | `income` or `expense` |
| `category` | string | Required, trimmed |
| `date` | Date | Required, stored in UTC |
| `notes` | string | Optional, trimmed |
| `createdBy` | ObjectId | Required reference to `User` |
| `deletedAt` | Date \| null | Soft delete marker |
| `deletedBy` | ObjectId \| null | User who performed soft delete |
| `createdAt` | Date | Auto timestamp |
| `updatedAt` | Date | Auto timestamp |

Recommended indexes:

- index on `createdBy`
- compound index on `type + category`
- index on `date`
- partial index or filter-aware query pattern for non-deleted documents

Design decisions:

- Soft delete preserves history for reporting and audit-friendly behavior.
- `createdBy` links records to the user who created them.
- UTC storage avoids timezone drift in monthly analytics.
- `amount` stays positive; financial direction is represented by `type`.

## 9. Authentication Design

### 9.1 Registration

Endpoint: `POST /auth/register`

Rules:

- Public signup is allowed.
- User may request only `Viewer` or `Analyst`.
- If `role` is omitted, default to `Viewer`.
- Public attempts to register `Admin` must return `403`.
- Password is hashed with `bcrypt` before persistence.

### 9.2 Login

Endpoint: `POST /auth/login`

Rules:

- Authenticate by `email + password`
- Reject login for missing user, invalid password, or inactive status
- Return signed JWT containing `sub`, `email`, and `role`

### 9.3 JWT Strategy

Recommended payload:

```ts
type AuthTokenPayload = {
  sub: string;
  email: string;
  role: "Viewer" | "Analyst" | "Admin";
};
```

Recommended behavior:

- JWT sent in `Authorization: Bearer <token>`
- Token verification handled by `authenticate`
- Decoded user attached to `req.user`

### 9.4 First Admin Bootstrap

Admin creation must happen through a bootstrap script or startup check using:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Behavior:

- if no admin exists, create one from env
- if admin already exists, do nothing
- script should be idempotent

## 10. Role-Based Access Control

### 10.1 Permission Matrix

| Capability | Viewer | Analyst | Admin |
| --- | --- | --- | --- |
| Register | Yes | Yes | No public self-registration |
| Login | Yes | Yes | Yes |
| Read records | Yes | Yes | Yes |
| Create records | No | No | Yes |
| Update records | No | No | Yes |
| Delete records | No | No | Yes |
| Access dashboard analytics | No | Yes | Yes |
| List users | No | No | Yes |
| Update user status | No | No | Yes |
| Update user role | No | No | Yes |

### 10.2 Middleware Contracts

#### `authenticate`

- reads bearer token
- verifies JWT
- attaches user context to request
- returns `401` for missing or invalid token

#### `authorize(...roles)`

- checks `req.user.role`
- allows request only if role is included in allowed roles
- returns `403` otherwise

#### `validate(schema)`

- parses `body`, `query`, or `params`
- returns `400` with detailed validation issues on failure

#### `errorHandler`

- catches thrown `ApiError` and unexpected errors
- returns standard error response

#### `notFound`

- handles unmatched routes with `404`

### 10.3 RBAC Enforcement Pattern

Examples:

- `GET /records` -> `authenticate` -> allow `Viewer`, `Analyst`, `Admin`
- `POST /records` -> `authenticate` -> `authorize(Admin)`
- `GET /dashboard/summary` -> `authenticate` -> `authorize(Analyst, Admin)`
- `PATCH /users/:id/role` -> `authenticate` -> `authorize(Admin)`

## 11. API Design

### 11.1 API Conventions

- Base path: `/api/v1`
- JSON request and response bodies
- Pagination defaults:
  - `page = 1`
  - `limit = 10`
  - max `limit = 100`
- Non-deleted records returned by default
- Timestamps stored in UTC

### 11.2 Request DTOs

```ts
type RegisterRequestDto = {
  name: string;
  email: string;
  password: string;
  role?: "Viewer" | "Analyst";
};

type LoginRequestDto = {
  email: string;
  password: string;
};

type GetUsersQueryDto = {
  role?: "Viewer" | "Analyst" | "Admin";
  status?: "active" | "inactive";
  page?: number;
  limit?: number;
};

type UpdateUserStatusRequestDto = {
  status: "active" | "inactive";
};

type UpdateUserRoleRequestDto = {
  role: "Viewer" | "Analyst" | "Admin";
};

type CreateRecordRequestDto = {
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  notes?: string;
};

type GetRecordsQueryDto = {
  page?: number;
  limit?: number;
  type?: "income" | "expense";
  category?: string;
  dateFrom?: string;
  dateTo?: string;
};

type UpdateRecordRequestDto = {
  amount?: number;
  type?: "income" | "expense";
  category?: string;
  date?: string;
  notes?: string;
};

type DashboardSummaryQueryDto = {
  dateFrom?: string;
  dateTo?: string;
};

type DashboardCategoryBreakdownQueryDto = {
  dateFrom?: string;
  dateTo?: string;
  type?: "income" | "expense";
};

type DashboardTrendsQueryDto = {
  dateFrom?: string;
  dateTo?: string;
  type?: "income" | "expense";
};
```

### 11.3 Endpoint List

#### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

#### Users

- `GET /api/v1/users`
- `PATCH /api/v1/users/:id/status`
- `PATCH /api/v1/users/:id/role`

#### Financial Records

- `POST /api/v1/records`
- `GET /api/v1/records`
- `GET /api/v1/records/:id`
- `PATCH /api/v1/records/:id`
- `DELETE /api/v1/records/:id`

#### Dashboard

- `GET /api/v1/dashboard/summary`
- `GET /api/v1/dashboard/category-breakdown`
- `GET /api/v1/dashboard/trends`

### 11.4 Success Response Shape

Recommended pattern:

```json
{
  "success": true,
  "message": "Records fetched successfully",
  "data": {},
  "meta": {}
}
```

### 11.5 Error Response Shape

Standardized error format:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ],
  "timestamp": "2026-04-05T18:30:00.000Z"
}
```

## 12. Dashboard Analytics Logic

### 12.1 `GET /dashboard/summary`

Return:

- total income
- total expenses
- net balance

Aggregation logic:

1. Match non-deleted records.
2. Apply optional `dateFrom` and `dateTo`.
3. Group all matched records.
4. Sum `amount` where `type = income`.
5. Sum `amount` where `type = expense`.
6. Compute `netBalance = totalIncome - totalExpenses`.

### 12.2 `GET /dashboard/category-breakdown`

Return grouped totals by `type + category`.

Aggregation logic:

1. Match non-deleted records.
2. Apply optional date range and type filter.
3. Group by `{ type, category }`.
4. Return:
   - `type`
   - `category`
   - `totalAmount`
   - `recordCount`
5. Sort descending by `totalAmount`.

### 12.3 `GET /dashboard/trends`

Return monthly totals for trend visualization.

Aggregation logic:

1. Match non-deleted records.
2. Apply optional date range and type filter.
3. Group by UTC `year + month` from `date`.
4. Sum `amount`.
5. Sort ascending by year and month.
6. Return normalized label such as `2026-04`.

## 13. Validation Strategy

Validation will use Zod schemas in `src/validations`.

Rules to enforce:

- valid emails
- password minimum length
- allowed roles only
- allowed record types only
- positive numeric amount
- valid MongoDB ObjectId in route params
- valid ISO date strings
- page and limit must be positive integers

Recommended controller pattern:

- `validate(schema)` middleware validates before controller execution
- controller assumes sanitized request input

## 14. Error Handling Strategy

Use a custom `ApiError` utility with:

- `statusCode`
- `message`
- `errors`

Expected status codes:

- `400` invalid input
- `401` unauthenticated
- `403` forbidden
- `404` resource not found
- `409` duplicate email or conflict
- `500` unexpected server error

Implementation notes:

- services throw domain-specific errors
- repositories return `null` for missing resources
- controllers avoid try/catch noise by using `asyncHandler`

## 15. Database Layer Design

### 15.1 Model Responsibility

Models define:

- field schema
- indexes
- timestamps
- reference relationships
- schema-level hooks if needed

### 15.2 Repository Responsibility

Repositories own:

- create/find/update operations
- pagination query composition
- filtering query composition
- aggregation pipelines for dashboard endpoints
- exclusion of soft-deleted records by default

### 15.3 Service Responsibility

Services own:

- registration rules
- admin bootstrap rules
- role restrictions
- user status checks during login
- record existence checks before mutation
- orchestration across multiple repositories

## 16. Optional Enhancements Included in Scope

### Soft Delete

- `DELETE /records/:id` marks `deletedAt` and `deletedBy`
- deleted records excluded from standard fetches

### Rate Limiting

- apply stricter limiter on auth routes
- optional broader limiter on all API routes

### Logging

- `Morgan` for HTTP request logs
- `Winston` for structured application and error logs

### Swagger

- expose docs at `/api-docs`
- annotate routes with request/response contracts

### Basic Unit and Integration Tests

- service tests for auth and RBAC behavior
- API tests for route and middleware integration

## 17. Setup Instructions

1. Install Node.js 20+ and MongoDB locally, or provide a hosted MongoDB URI.
2. Clone the repository.
3. Create `.env` from the documented environment variables.
4. Install dependencies with `npm install`.
5. Start MongoDB if running locally.
6. Seed the first admin user:

```bash
npm run seed:admin
```

7. Start the development server:

```bash
npm run dev
```

8. Run tests:

```bash
npm test
```

## 18. Postman-Style API Examples

### Register Viewer

`POST /api/v1/auth/register`

```json
{
  "name": "Ava Viewer",
  "email": "ava@example.com",
  "password": "Password123!",
  "role": "Viewer"
}
```

### Register Analyst

`POST /api/v1/auth/register`

```json
{
  "name": "Noah Analyst",
  "email": "noah@example.com",
  "password": "Password123!",
  "role": "Analyst"
}
```

### Login

`POST /api/v1/auth/login`

```json
{
  "email": "admin@example.com",
  "password": "ChangeMe123!"
}
```

### Create Record

`POST /api/v1/records`

```json
{
  "amount": 1250.5,
  "type": "income",
  "category": "Consulting",
  "date": "2026-04-01T00:00:00.000Z",
  "notes": "April consulting invoice"
}
```

### Get Records With Filters

`GET /api/v1/records?page=1&limit=10&type=expense&category=Operations&dateFrom=2026-01-01&dateTo=2026-04-30`

### Update User Status

`PATCH /api/v1/users/USER_ID/status`

```json
{
  "status": "inactive"
}
```

### Update User Role

`PATCH /api/v1/users/USER_ID/role`

```json
{
  "role": "Analyst"
}
```

### Dashboard Summary

`GET /api/v1/dashboard/summary?dateFrom=2026-01-01&dateTo=2026-04-30`

### Category Breakdown

`GET /api/v1/dashboard/category-breakdown?type=expense`

### Trends

`GET /api/v1/dashboard/trends?type=income`

## 19. Testing Requirements

The implementation must cover at least these scenarios:

### Auth

- register Viewer succeeds
- register Analyst succeeds
- register Admin is rejected
- login fails for wrong password
- inactive user cannot log in

### RBAC

- Viewer cannot create, update, or delete records
- Analyst can access dashboard endpoints
- Analyst cannot create, update, or delete records
- Admin can manage users and records

### Records

- create, fetch, update, and soft delete flows succeed for Admin
- record listing supports filters and pagination
- soft-deleted records are excluded from standard reads

### Dashboard

- summary totals match seeded fixture data
- category breakdown groups correctly
- trends aggregate records into correct UTC months

### Validation and Errors

- invalid body returns `400`
- missing token returns `401`
- forbidden action returns `403`
- missing resource returns `404`

## 20. Assumptions

- The repository is greenfield and does not contain existing backend code that must be preserved.
- This document specifies the implementation; it does not generate code by itself.
- MongoDB is an accepted persistence choice for this project.
- Refresh tokens are out of scope for v1.
- Background jobs are out of scope for v1.
- Multi-tenant support is out of scope for v1.
- Full audit history beyond timestamps and soft-delete metadata is out of scope for v1.
