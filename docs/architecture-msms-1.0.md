# MSMS 1.0 — Architecture and Delivery Plan

## Approved architecture

- Frontend: Arabic RTL HTML/CSS/JavaScript, published from GitHub Pages.
- Backend: PHP 8.1+ on a separate PHP hosting account.
- Database: MySQL 8.0+ or MariaDB 10.6+.
- Integration: HTTPS JSON API. The frontend must not contain database credentials.
- Tenancy: one central platform with separate school data scopes and role assignments.

## Roles

1. Platform administrator: manages schools, subscriptions/status, and platform-wide users.
2. School administrator: manages only the assigned school.
3. Registrar: student admissions and enrollment.
4. Teacher: assigned classes, attendance, and grade entry.
5. Read-only auditor: reports and permitted records only.

Role names are an initial proposal. Permissions must be enforced by the PHP backend on every request, not merely hidden in the interface.

## Delivery phases

### Phase 1 — Foundation
- Repository inspection and safe feature branch.
- Initial tenant-aware database schema.
- PDO connection and health endpoint.
- Hosting and configuration guide.

### Phase 2 — Identity and isolation
- Secure login/logout and password hashing.
- Session security, CSRF protection, rate limiting, and account lock policy.
- School membership and role/permission middleware.
- Automated tests proving that one school cannot read or change another school's data.

### Phase 3 — Core school operations
- Schools, academic years, classes, sections, students, teachers, and enrollment.
- Search, validation, archival, and audit events.

### Phase 4 — Teaching and administration
- Attendance, subjects, timetable, assessments, grades, and results.
- Reports, printable documents, and controlled exports.

### Phase 5 — Production readiness
- Backups and restore drills.
- Security review, accessibility, mobile/PWA validation, and load testing.
- Staging deployment before production release.

## Release policy

- Keep `main` as the currently published stable frontend.
- Develop backend and integration work on feature branches.
- Merge only after tests pass and the actual PHP host/database are available for verification.
- Never put real student data, passwords, database credentials, or API secrets in this public repository.

## Current limitation

GitHub Pages serves static files only. PHP endpoints run on the separate PHP host; GitHub remains the source-control and static-frontend deployment platform.
