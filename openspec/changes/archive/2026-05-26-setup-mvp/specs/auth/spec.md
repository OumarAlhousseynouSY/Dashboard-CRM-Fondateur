## ADDED Requirements

### Requirement: Admin login with credentials
The system SHALL provide a login page at `/login` where the admin enters an email and password. The system SHALL verify the password against a bcrypt hash (salt rounds 12) stored in the `User` table and create a JWT session on success.

#### Scenario: Successful login
- **WHEN** admin submits valid email and password on the login page
- **THEN** the system creates a JWT session cookie (httpOnly) and redirects to the dashboard (`/`)

#### Scenario: Invalid credentials
- **WHEN** admin submits an email or password that does not match a stored user
- **THEN** the system displays an error message on the login page and does NOT create a session

#### Scenario: Empty form submission
- **WHEN** admin submits the login form with empty email or password fields
- **THEN** the system displays a validation error and does NOT attempt authentication

### Requirement: Protected dashboard routes
The system SHALL protect all routes under `/(dashboard)` via Next.js middleware. Unauthenticated requests SHALL be redirected to `/login`.

#### Scenario: Unauthenticated access to dashboard
- **WHEN** a user navigates to any dashboard route without a valid session cookie
- **THEN** the system redirects them to `/login`

#### Scenario: Authenticated access to dashboard
- **WHEN** a user navigates to any dashboard route with a valid session cookie
- **THEN** the system renders the requested page without redirecting

#### Scenario: Login page redirect when already authenticated
- **WHEN** an authenticated user navigates to `/login`
- **THEN** the system redirects them to the dashboard (`/`)

### Requirement: Admin account seed
The system SHALL provide a Prisma seed script (`prisma/seed.ts`) that creates a single admin `User` record with a bcrypt-hashed password. The script SHALL be idempotent (upsert, not insert).

#### Scenario: Seed on empty database
- **WHEN** `npx prisma db seed` is run against an empty database
- **THEN** one `User` record is created with the configured email and bcrypt-hashed password

#### Scenario: Seed on existing database
- **WHEN** `npx prisma db seed` is run and an admin user already exists
- **THEN** the existing record is updated (upsert) and no duplicate is created
