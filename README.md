# Agape Communion Church Website & Content Management Platform

A production-ready church website and role-based content management system built for **Agape Communion Church** in Lagos, Nigeria.

---

## 1. Project Overview

Agape Communion Church's web platform provides:
- **Public Church Website**: A responsive, accessible, SEO-friendly website featuring the church's welcome hero, overlapping Sunday livestream banner, weekly services and ministries, sermon messages ("Hope for Tomorrow" series), events calendar, devotionals, blog articles, congregation testimonies with public submission workflow, livestream player, about page, and contact page.
- **Role-Based Administrative Dashboard**: A secure CMS supporting two distinct server-enforced roles:
  - **Super Admin (`SUPER_ADMIN`)**: Full platform governance including administrator provisioning, invitation and credential management, church identity & global settings, content publishing across all modules, media library management, and administrative activity logs.
  - **Editor Admin (`EDITOR_ADMIN`)**: Day-to-day content operations across services, events, blog posts, messages, devotionals, testimonies, livestream announcements, and media uploads without access to administrator accounts, global church settings, or system audit logs.

---

## 2. Architecture Summary

The application uses a **Modular Monolith Architecture** built on the Next.js App Router:

```text
src/
├── app/
│   ├── (website)/         # Public-facing church pages & shared layout
│   ├── admin/
│   │   ├── login/         # Credentials sign-in with rate limiting
│   │   └── (dashboard)/   # Protected CMS routes & role-aware sidebar
│   ├── api/               # Auth.js handlers & validated media upload API
│   ├── sitemap.ts         # Dynamic XML sitemap generation
│   └── robots.ts          # Search engine crawl directives
├── components/
│   ├── ui/                # Accessible foundational UI primitives
│   ├── shared/            # Lazy-loaded Tiptap editor & asset selector
│   ├── navigation/        # Public navigation header (Heroicons)
│   ├── layout/            # Public footer (Heroicons)
│   ├── website/           # Public website sections & forms
│   └── admin/             # Admin dashboard managers (Lucide icons)
├── features/              # Domain modules (schemas, queries, services, actions)
│   ├── users/
│   ├── pages/
│   ├── services/
│   ├── events/
│   ├── blog/
│   ├── messages/
│   ├── devotionals/
│   ├── testimonies/
│   ├── livestream/
│   ├── media/
│   └── contact/
├── lib/
│   ├── db/                # Drizzle ORM schema, relations, migrations, seed
│   ├── auth/              # Auth.js configuration, RBAC permissions, rate limit, audit log
│   ├── storage/           # S3-compatible object storage + local public fallback & magic-byte validation
│   ├── cache/             # Explicit tag-based caching & invalidation helpers
│   ├── seo/               # Metadata & Schema.org JSON-LD builders
│   ├── email/             # Transactional email notifications
│   └── utils/             # Slug uniqueness, composite cursors, livestream embed validation
├── config/                # Validated environment & site configuration
├── types/                 # Shared domain TypeScript interfaces
└── middleware.ts          # Route-level authentication & RBAC guard
```

---

## 3. Technology Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (Strict Mode)
- **Styling & UI**: Tailwind CSS v4 + shadcn/ui foundational primitives
- **Icons**: ~50/50 split between `@heroicons/react` (public website) and `lucide-react` (admin dashboard)
- **Database & ORM**: Neon PostgreSQL (`@neondatabase/serverless`) + Drizzle ORM (with automatic `@electric-sql/pglite` local PostgreSQL fallback for zero-config local development and testing)
- **Authentication**: Auth.js (`next-auth@beta`) with `bcryptjs` password hashing
- **Validation & Forms**: Zod + React Hook Form
- **Rich Text Editor**: Tiptap (`@tiptap/react`, lazy-loaded only inside admin routes)
- **Object Storage**: AWS S3 SDK (`@aws-sdk/client-s3` & `@aws-sdk/s3-request-presigner`) compatible with Cloudflare R2, AWS S3, and MinIO
- **Testing**: Vitest (unit & integration) + Playwright (end-to-end)

---

## 4. Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon PostgreSQL connection string (`postgresql://...`). Leave blank in local dev to use embedded PGlite PostgreSQL in `.local-postgres`. |
| `AUTH_SECRET` | Random 32+ character secret used to sign Auth.js JWT sessions. |
| `NEXT_PUBLIC_APP_URL` | Canonical base URL of the website (e.g., `http://localhost:3000`). |
| `INITIAL_SUPER_ADMIN_NAME` | Full name of the seeded Super Admin account. |
| `INITIAL_SUPER_ADMIN_EMAIL` | Email address of the seeded Super Admin account. |
| `INITIAL_SUPER_ADMIN_PASSWORD` | Initial password for the seeded Super Admin account. |
| `S3_ENDPOINT` | S3-compatible endpoint URL (e.g., Cloudflare R2 or AWS S3). |
| `S3_REGION` | Storage bucket region (`auto` or `us-east-1`). |
| `S3_BUCKET` | Bucket name for uploaded church media. |
| `S3_ACCESS_KEY_ID` | S3 access key ID. |
| `S3_SECRET_ACCESS_KEY` | S3 secret access key. |
| `S3_PUBLIC_URL` | Public CDN/bucket base URL for serving uploaded objects. |
| `SMTP_FROM_EMAIL` | Sender address for admin invitations and contact notifications. |
| `CHURCH_CONTACT_RECEIVER_EMAIL` | Recipient address for public contact form submissions. |

---

## 5. Local Development Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment configuration
cp .env.example .env

# 3. Run database migrations and seed initial church data
pnpm db:seed

# 4. Start the development server
pnpm dev
```

Open `http://localhost:3000` for the public website or `http://localhost:3000/admin` for the administrative dashboard.

---

## 6. Database Migrations and Seeding

- **Generate SQL migrations from Drizzle schema**:
  ```bash
  pnpm db:generate
  ```
- **Apply migrations**:
  ```bash
  pnpm db:migrate
  ```
- **Seed initial data (idempotent)**:
  ```bash
  pnpm db:seed
  ```

---

## 7. Super Admin and Editor Admin Setup

Running `pnpm db:seed` provisions two ready-to-use accounts in development:

1. **Super Admin**
   - **Email**: `superadmin@agapecommunion.org.ng`
   - **Password**: `AgapeSuperAdmin!2026`
   - **Permissions**: Full access to all content modules plus `/admin/users`, `/admin/settings`, and `/admin/activity-logs`.
2. **Editor Admin**
   - **Email**: `editor@agapecommunion.org.ng`
   - **Password**: `AgapeEditor!2026`
   - **Permissions**: Full access to content and media modules; restricted from administrator management, global church settings, and activity logs.

---

## 8. Media Storage Configuration

- When `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` are configured, the platform uses `S3CompatibleStorageProvider` to generate presigned upload URLs and store media in your S3/R2 bucket.
- When S3 credentials are omitted in local development, the platform falls back to `LocalPublicStorageProvider`.
- Every upload is verified for:
  - Allowed MIME types (`image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`)
  - Maximum file size (`5 MB`)
  - Magic-byte file signature inspection (preventing disguised executables or script-injected SVGs)
  - Reference safety checks before deletion (`isMediaUrlInUse`)

---

## 9. Testing Instructions

```bash
# Typecheck the entire application
pnpm typecheck

# Run Vitest unit and integration tests (15 core verification suites)
pnpm test

# Run Playwright end-to-end tests
pnpm test:e2e
```

---

## 10. Deployment Instructions (Vercel + Neon)

1. Provision a **Neon PostgreSQL** database and set `DATABASE_URL` in your Vercel project environment variables.
2. Configure `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, and your S3-compatible object storage credentials (`S3_*`) in Vercel.
3. Run `pnpm db:migrate` and `pnpm db:seed` against the Neon database to initialize schema and Super Admin credentials.
4. Deploy to **Vercel** (`vercel --prod` or via Git integration).
