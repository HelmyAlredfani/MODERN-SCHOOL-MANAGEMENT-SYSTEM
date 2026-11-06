# MSMS PHP/MySQL Backend Foundation

This folder is the server-side foundation for MSMS 1.0. GitHub Pages remains the static frontend host; this PHP application must be deployed separately to a PHP 8.1+ host with PDO MySQL enabled.

## Current contents

- `database/schema.sql`: initial multi-school schema.
- `src/Database.php`: PDO connection using environment variables only.
- `public/api/health.php`: minimal database connectivity check.

This is a foundation, not a production-ready API. Authentication, authorization middleware, CRUD endpoints, CSRF/session policy, rate limiting, and automated tests must be implemented before real student records are entered.

## Database setup

1. Create a new empty MySQL 8.0+ or MariaDB 10.6+ database.
2. Import `database/schema.sql`.
3. Configure these environment variables in the PHP hosting control panel:

   - `MSMS_DB_HOST`
   - `MSMS_DB_PORT` (normally `3306`)
   - `MSMS_DB_NAME`
   - `MSMS_DB_USER`
   - `MSMS_DB_PASSWORD`

4. Set the hosting document root to this folder's `public/` directory, or copy only the contents of `public/` into the host's document root. Keep `src/` and `database/` outside the public web root.
5. Visit `/api/health.php`. A successful response confirms only that PHP can connect to the database; it does not mean the full system is ready.

Do not store production credentials in GitHub files, frontend JavaScript, or public folders.

## Multi-school data isolation

- Each school is a tenant represented by `schools.id`.
- School-owned tables carry `school_id`.
- User access is granted through `user_school_roles`.
- Platform administrators are represented by `users.is_platform_admin`.
- Application queries must derive the allowed school IDs from the authenticated session/token. Never trust a client-supplied `school_id` as proof of access.
- Always include the authorized `school_id` in reads, updates, and deletes. Use PDO prepared statements.
- Keep an audit record for sensitive administrative actions.

The schema is an initial migration and must be tested on the actual hosting provider's MySQL/MariaDB version before production use.

## Deployment separation

The current GitHub Pages workflow publishes static files only. It does not execute PHP. Deploy this backend to the PHP host and configure the frontend API base URL only after the backend domain, HTTPS, CORS policy, and authentication design are confirmed.
