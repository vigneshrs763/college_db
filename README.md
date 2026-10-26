# CampusCare

Responsive campus maintenance request demo built with React, TypeScript, Vite, and Tailwind CSS.

## Run

```bash
pnpm install
pnpm dev
```

Demo accounts:

- Student: `student@campus.edu` / `student123`
- Admin: `admin@campus.edu` / `admin123`

All demo changes persist in browser `localStorage`. Login state uses `sessionStorage`.

## MySQL schema

The normalized production schema is in `database/schema.sql`.

```bash
mysql -u root -p < database/schema.sql
```

Each complaint stores the raising student through
`maintenance_requests.student_id → users.id`. Administrators can query the
included `complaint_register` view to see complaint details together with the
student name, email, location, category, and assigned technician:

```sql
SELECT * FROM complaint_register ORDER BY created_at DESC;
```

This repository is currently a frontend-only demo because backend provisioning was declined. The browser does **not** connect directly to MySQL, and the demo credentials are not production authentication. A secure deployment requires a server API that hashes passwords, issues secure sessions, validates role permissions, stores uploads, and executes parameterized SQL queries.
