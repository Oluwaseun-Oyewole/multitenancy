# Multi-Tenancy Backend Service

A production-oriented NestJS backend for multi-tenant product workspaces (tenant-per-schema), with isolated tenant data, tenant-scoped authentication, invitation workflows, and feedback/changelog management.

## Table of Contents

- [Overview](#overview)
- [Core Capabilities](#core-capabilities)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Runbook](#runbook)
- [API Surface](#api-surface)
- [Authentication and Tenant Resolution](#authentication-and-tenant-resolution)
- [Response Contract](#response-contract)
- [Data Model](#data-model)
- [Operational Notes](#operational-notes)
- [Testing and Quality](#testing-and-quality)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Overview

This service implements schema-per-tenant multi-tenancy on PostgreSQL:

- Public schema stores platform-wide records such as tenants and invitations.
- Each tenant receives its own schema for users, products, feedback, and changelogs.
- Tenant context is resolved per request and propagated through the application layer.
- JWT access tokens and Redis-backed refresh token metadata support stateless API auth with revocation primitives.

The API is versioned and exposed under:

- Base API prefix: `/api`
- Default API version: `/v1`
- Effective base path: `/api/v1`

Swagger UI is available at `/api`.

## Core Capabilities

- Tenant onboarding with schema provisioning at signup.
- Tenant-scoped login and JWT token issuance.
- Invite, accept, revoke tenant membership workflows.
- Product creation per tenant.
- Feedback creation and update per tenant.
- Changelog creation per tenant.
- Standardized success response envelope.
- Request timeout and request logging interceptors.
- Daily cron cleanup for expired invitations.

## Architecture

### Multi-Tenancy Strategy

- Isolation model: PostgreSQL schema per tenant.
- Public data source: fixed to `public` schema for tenant metadata and invitations.
- Tenant data source: created dynamically and cached by schema name.
- Tenant entities in isolated schemas: users, products, feedback, changelogs.

### Request Lifecycle

1. `TenantMiddleware` resolves tenant context.
2. JWT guard authenticates protected routes.
3. Tenant and user context are injected via custom decorators.
4. Services use `TenantProvisioningService` to obtain tenant-specific TypeORM DataSource.
5. Global interceptors format successful responses and enforce timeout policy.

### Security and Validation

- ValidationPipe is configured globally with:
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `transform: true`
- Password hashing uses Argon2.
- JWT uses separate access and refresh secrets.
- Refresh token metadata is stored in Redis as hashed token material.

## Technology Stack

- Runtime: Node.js 20+
- Framework: NestJS 10
- Language: TypeScript 5
- Database: PostgreSQL 16
- ORM: TypeORM
- Cache and token state: Redis (ioredis)
- Auth: Passport JWT + @nestjs/jwt
- API docs: Swagger (@nestjs/swagger)
- Scheduling: @nestjs/schedule
- Containers: Docker + Docker Compose

## Repository Structure

```text
src/
  auth/                 Authentication module (signup/login, guard, strategy)
  tenant/               Tenant invitation lifecycle and cleanup cron
  database/             Public and tenant DataSource provisioning
  user/                 Tenant user entity/model
  products/             Product APIs and tenant persistence
  feedback/             Feedback APIs and tenant persistence
  changelogs/           Changelog APIs and tenant persistence
  redis/                Redis client and wrapper service
  common/               Decorators, exceptions, interceptors, middleware, utilities
  token/                JWT issuance and refresh-token persistence helpers
  main.ts               Bootstrap entrypoint
  app.create.ts         Global app configuration (pipes, docs, cors, interceptors)
```

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm 10 or later
- Docker Desktop (recommended for local infrastructure)

### Option 1: Full Local Stack with Docker Compose

Start API + PostgreSQL + pgAdmin + Redis + RedisInsight:

```bash
docker compose up --build
```

Available services:

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api`
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:8080`
- Redis: `localhost:6379`
- RedisInsight: `http://localhost:5540`

### Option 2: Run API Locally (External DB/Redis)

```bash
npm install
npm run start:dev
```

Build and run production bundle:

```bash
npm run build
npm run start:prod
```

## Environment Variables

Create a `.env` file in project root.

| Variable                 | Required | Description                                       | Example                                       |
| ------------------------ | -------- | ------------------------------------------------- | --------------------------------------------- |
| `PORT`                   | No       | Application port (default 3000).                  | `3000`                                        |
| `NODE_ENV`               | No       | Runtime mode used by tenant middleware.           | `development`                                 |
| `ALLOWED_ORIGINS`        | Yes      | Comma-separated CORS allowlist.                   | `http://localhost:5173,http://localhost:3000` |
| `DB_HOST`                | Yes      | PostgreSQL host.                                  | `localhost`                                   |
| `DB_PORT`                | Yes      | PostgreSQL port.                                  | `5432`                                        |
| `DB_USER`                | Yes      | PostgreSQL username.                              | `admin`                                       |
| `DB_PASSWORD`            | Yes      | PostgreSQL password.                              | `secret`                                      |
| `DB_NAME`                | Yes      | PostgreSQL database name.                         | `multi_tenancy`                               |
| `JWT_SECRET_KEY`         | Yes      | Access token signing secret.                      | `replace-with-strong-secret`                  |
| `JWT_ACCESS_EXPIRES`     | Yes      | Access token TTL.                                 | `900`                                         |
| `JWT_REFRESH_SECRET_KEY` | Yes      | Refresh token signing secret.                     | `replace-with-strong-refresh-secret`          |
| `JWT_REFRESH_EXPIRES`    | Yes      | Refresh token TTL.                                | `604800`                                      |
| `redis.host`             | Yes      | Redis host key used by current config loader.     | `localhost`                                   |
| `redis.port`             | Yes      | Redis port key used by current config loader.     | `6379`                                        |
| `redis.password`         | No       | Redis password key used by current config loader. | ``                                            |
| `redis.db`               | No       | Redis DB index key used by current config loader. | `0`                                           |

Example `.env`:

```dotenv
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=secret
DB_NAME=multi_tenancy

JWT_SECRET_KEY=super-secret-access-key
JWT_ACCESS_EXPIRES=900
JWT_REFRESH_SECRET_KEY=super-secret-refresh-key
JWT_REFRESH_EXPIRES=604800

redis.host=localhost
redis.port=6379
redis.password=
redis.db=0
```

## Runbook

### Local Development Commands

```bash
npm run start:dev
npm run start:debug
npm run lint
npm run format
```

### Database and Tenant Provisioning Notes

- Public schema is initialized with TypeORM `synchronize: true`.
- Tenant schemas are created at signup and initialized dynamically.
- Tenant DataSource currently calls `runMigrations()`, but migration files are commented out in configuration.

For production hardening, replace `synchronize: true` with versioned migration workflows.

## API Surface

All routes below are prefixed with `/api/v1`.

### Auth

- `POST /auth/signup` : creates tenant, schema, and owner user.
- `POST /auth/login` : requires tenant context and returns access/refresh tokens.

### Tenant

- `POST /tenant/invite` : invite user into tenant.
- `POST /tenant/accept-invitation` : accept invitation and create tenant user.
- `POST /tenant/revoke-invitation` : revoke pending invitation.

### Product

- `POST /products` : create product in tenant schema.

### Feedback

- `POST /feedback` : create feedback linked to product and optionally changelog.
- `PUT /feedback` : update feedback.

### Changelogs

- `POST /changelogs` : create changelog entry in tenant schema.

### Misc

- `GET /` : base hello endpoint.

## Authentication and Tenant Resolution

### Tenant Resolution Rules

- Production mode: tenant slug is resolved from request hostname subdomain.
- Non-production mode: tenant slug is read from `x-tenant-slug` request header.
- Reserved non-tenant host prefixes include: `localhost`, `www`, `app`, `127`.

### Accessing Protected Endpoints Locally

Include:

- `Authorization: Bearer <access_token>`
- `x-tenant-slug: <tenant_slug>`

Example:

```bash
curl -X POST 'http://localhost:3000/api/v1/products' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <access_token>' \
  -H 'x-tenant-slug: acme' \
  -d '{"title":"Roadmap","description":"Q4 priorities"}'
```

## Response Contract

Successful responses are wrapped by a global interceptor:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request successful",
  "timestamp": "2026-06-09T12:34:56.000Z",
  "path": "/api/v1/products",
  "data": {}
}
```

## Data Model

### Public Schema

- `tenants`
  - Tenant metadata: slug, owner email, schema name, status, plan.
- `invitations`
  - Cross-tenant invitation records and lifecycle states.

### Tenant Schema (per tenant)

- `users`
- `products`
- `feedback`
- `change-logs`

`BaseEntity` fields are shared across entities:

- `id` (UUID)
- `created_at`
- `updated_at`

## Operational Notes

- Invitation cleanup runs daily at midnight and marks expired pending invitations.
- Redis connection includes retry/backoff behavior and graceful shutdown.
- Swagger is configured with persistent authorization to support authenticated testing.
- CORS uses explicit allowlist validation from `ALLOWED_ORIGINS`.

## Testing and Quality

```bash
# unit tests
npm run test

# watch mode
npm run test:watch

# coverage
npm run test:cov

# end-to-end tests
npm run test:e2e
```

## Troubleshooting

- `Tenant context is required`:
  - Ensure `x-tenant-slug` is present in non-production requests.
- `Authentication required` or JWT errors:
  - Verify access token validity and `JWT_SECRET_KEY` consistency.
- CORS blocked:
  - Ensure request origin exists in `ALLOWED_ORIGINS`.
- Redis connection warnings:
  - Verify Redis host/port/password values and container health.

## License

This project is currently marked as `UNLICENSED` in `package.json`.
