# Finance Backend Implementation Task List

This document converts the architecture plan into an execution checklist. The work should be completed in the exact order listed here so the codebase grows in a clean and predictable way.

## Delivery Rules

- Follow `Controller -> Service -> Repository -> Model`
- Keep route, controller, service, and repository responsibilities separate
- Do not expose passwords in responses
- Use UTC date handling for stored records and dashboard aggregation
- Default record queries must ignore soft-deleted items
- Public signup must never create an `Admin`

## Phase 1. Project Setup

### Concrete Tasks

- [ ] Initialize Node.js project with `npm init -y`
- [ ] Install runtime dependencies for Express, Mongoose, auth, validation, logging, and docs
- [ ] Install development dependencies for TypeScript, testing, and linting
- [ ] Create `tsconfig.json`, Jest config, and base npm scripts
- [ ] Add `.env.example` with all required keys
- [ ] Create `src/app.ts` and `src/server.ts`
- [ ] Create `src/config/env.ts`, `src/config/db.ts`, `src/config/logger.ts`, and `src/config/swagger.ts`

### Dependencies / Prerequisites

- Node.js 20+
- npm
- MongoDB local instance or hosted connection string

### Acceptance Criteria

- Project installs without dependency conflicts
- TypeScript compiles successfully
- Server boot sequence loads environment and starts without route errors
- MongoDB connection module is wired and reusable

### Suggested Verification

```bash
npm install
npm run build
npm run dev
```

## Phase 2. Folder Structure

### Concrete Tasks

- [ ] Create `src/controllers`
- [ ] Create `src/services`
- [ ] Create `src/repositories`
- [ ] Create `src/models`
- [ ] Create `src/middlewares`
- [ ] Create `src/routes`
- [ ] Create `src/utils`
- [ ] Create `src/validations`
- [ ] Create `src/scripts`
- [ ] Add placeholder exports or starter files so the structure is explicit

### Dependencies / Prerequisites

- Phase 1 completed

### Acceptance Criteria

- Folder structure matches the architecture document
- Each layer has a clear responsibility and no circular dependency is introduced
- `routes/index.ts` can compose all route modules cleanly

### Suggested Verification

```bash
npm run build
```

## Phase 3. Data Modeling

### Concrete Tasks

- [ ] Implement shared enums for `UserRole`, `UserStatus`, and `RecordType`
- [ ] Create `User` Mongoose schema with timestamps and unique email index
- [ ] Add password hashing hook or service-layer hashing decision consistently
- [ ] Create `FinancialRecord` Mongoose schema with `createdBy`, `deletedAt`, and `deletedBy`
- [ ] Add indexes for record filtering and dashboard aggregation paths
- [ ] Define TypeScript interfaces/types for model documents

### Dependencies / Prerequisites

- Phase 2 completed

### Acceptance Criteria

- Schemas reflect all required fields
- Email uniqueness is enforced
- Record soft-delete fields are present
- Type definitions are compatible with service and repository layers

### Suggested Verification

```bash
npm run build
```

## Phase 4. Authentication

### Concrete Tasks

- [ ] Implement register logic in `auth.service.ts`
- [ ] Restrict public registration roles to `Viewer` and `Analyst`
- [ ] Implement login with password comparison
- [ ] Create JWT signing helper
- [ ] Implement `auth.controller.ts`
- [ ] Add `auth.routes.ts`
- [ ] Create admin bootstrap script in `src/scripts/seedAdmin.ts`

### Dependencies / Prerequisites

- Phases 1 through 3 completed

### Acceptance Criteria

- Register creates a new non-admin user
- Register rejects `Admin` role requests
- Login returns a valid token for active users with correct credentials
- Inactive users cannot log in
- Admin seed script is idempotent

### Suggested Verification

```bash
npm run build
npm test -- auth
```

## Phase 5. Role-Based Access Control

### Concrete Tasks

- [ ] Implement `authenticate` middleware
- [ ] Implement `authorize(...roles)` middleware
- [ ] Extend Express request typing to include authenticated user context
- [ ] Apply RBAC rules to route modules
- [ ] Ensure service methods assume the controller/middleware contract cleanly

### Dependencies / Prerequisites

- Phase 4 completed

### Acceptance Criteria

- Missing or invalid token returns `401`
- Unauthorized role returns `403`
- Viewer can only access record read endpoints
- Analyst can access analytics endpoints but not record mutation
- Admin can manage users and records

### Suggested Verification

```bash
npm test -- rbac
```

## Phase 6. REST API Design and Core Endpoints

### Concrete Tasks

- [ ] Implement `user.repository.ts`, `user.service.ts`, and `user.controller.ts`
- [ ] Add `GET /users`
- [ ] Add `PATCH /users/:id/status`
- [ ] Add `PATCH /users/:id/role`
- [ ] Implement `financialRecord.repository.ts`, `record.service.ts`, and `record.controller.ts`
- [ ] Add `POST /records`
- [ ] Add `GET /records`
- [ ] Add `GET /records/:id`
- [ ] Add `PATCH /records/:id`
- [ ] Add `DELETE /records/:id` as soft delete
- [ ] Implement pagination and record filters

### Dependencies / Prerequisites

- Phases 1 through 5 completed

### Acceptance Criteria

- All required endpoints exist under `/api/v1`
- Pagination defaults to `page=1` and `limit=10`
- Maximum page size is enforced
- Filters support `dateFrom`, `dateTo`, `category`, and `type`
- Soft-deleted records are excluded from standard reads

### Suggested Verification

```bash
npm run build
npm test -- records
```

## Phase 7. Dashboard APIs

### Concrete Tasks

- [ ] Implement `dashboard.service.ts`
- [ ] Add repository aggregation methods for summary, category breakdown, and trends
- [ ] Implement `dashboard.controller.ts`
- [ ] Add `dashboard.routes.ts`
- [ ] Apply access control so only `Analyst` and `Admin` can use dashboard endpoints

### Dependencies / Prerequisites

- Phase 6 completed

### Acceptance Criteria

- `GET /dashboard/summary` returns total income, total expenses, and net balance
- `GET /dashboard/category-breakdown` groups by `type + category`
- `GET /dashboard/trends` aggregates by UTC month and sorts ascending
- Only non-deleted records contribute to analytics

### Suggested Verification

```bash
npm test -- dashboard
```

## Phase 8. Validation and Error Handling

### Concrete Tasks

- [ ] Create Zod schemas for auth, user, record, and dashboard requests
- [ ] Implement `validate(schema)` middleware
- [ ] Create `ApiError` utility
- [ ] Implement `asyncHandler`
- [ ] Implement `notFound` middleware
- [ ] Implement centralized `errorHandler`
- [ ] Standardize error responses across controllers

### Dependencies / Prerequisites

- Phases 4 through 7 completed

### Acceptance Criteria

- Invalid body, params, or query returns structured `400`
- Missing resource returns `404`
- Unexpected server failures return `500` with safe output
- Controllers stay thin and do not duplicate validation/error logic

### Suggested Verification

```bash
npm test -- validation
npm test -- errors
```

## Phase 9. Database Layer Hardening

### Concrete Tasks

- [ ] Review repository methods for duplicated query logic
- [ ] Centralize non-deleted record filtering
- [ ] Ensure indexes match common filter and aggregation access patterns
- [ ] Confirm Mongoose population is used only where needed
- [ ] Verify connection lifecycle and graceful shutdown behavior

### Dependencies / Prerequisites

- Phases 3 through 8 completed

### Acceptance Criteria

- Repository layer cleanly owns all query logic
- No controller accesses Mongoose models directly
- Aggregation queries are readable and maintainable
- Connection startup and shutdown are stable

### Suggested Verification

```bash
npm run build
npm test
```

## Phase 10. Enhancements

### Concrete Tasks

- [ ] Add `express-rate-limit` to auth routes and optionally global API routes
- [ ] Integrate Morgan HTTP logging
- [ ] Configure Winston structured logger
- [ ] Add Swagger docs generation and UI at `/api-docs`
- [ ] Confirm soft-delete behavior is covered by tests

### Dependencies / Prerequisites

- Phases 1 through 9 completed

### Acceptance Criteria

- Rate limiting is active
- Requests and server errors are logged
- Swagger documents all required endpoints
- Soft delete remains consistent after enhancements

### Suggested Verification

```bash
npm run dev
npm test
```

## Phase 11. Testing and Final Documentation

### Concrete Tasks

- [ ] Add Jest and Supertest coverage for auth scenarios
- [ ] Add coverage for RBAC scenarios
- [ ] Add coverage for record CRUD, filters, pagination, and soft delete
- [ ] Add coverage for dashboard aggregation endpoints
- [ ] Add README setup notes if the repository needs a quick-start guide
- [ ] Review response shape consistency across all controllers

### Dependencies / Prerequisites

- Phases 1 through 10 completed

### Acceptance Criteria

- Required test scenarios from `implementation.md` are covered
- API behavior matches the architecture document
- Project can be set up from documented instructions alone

### Suggested Verification

```bash
npm test
npm run build
```

## Final Definition of Done

- [ ] The backend uses the required layered architecture
- [ ] All required endpoints are implemented
- [ ] Authentication and RBAC rules match the agreed design
- [ ] Validation and error handling are centralized
- [ ] Dashboard aggregations work with non-deleted records only
- [ ] Logging, rate limiting, Swagger, and soft delete are included
- [ ] Tests cover the critical flows listed in the implementation document
- [ ] The codebase is readable, modular, and ready for review
