# Klipit by Bova - HR Management System

## Overview

Klipit by Bova is a multi-tenant HR management system offering comprehensive functionalities such as attendance, leave, expense, payroll, employee lifecycle, and workflow approvals. Built with a full-stack TypeScript architecture, it features a three-tier user hierarchy (Super Admin, Company Admin, Employee) with role-based access control and supports white-label customization. The project aims to provide a robust, scalable solution for HR operations, enhancing efficiency and streamlining HR processes for businesses of varying sizes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Credentials

### Super Admin Login (`/login/superadmin`)
- Email: `superadmin@hrmsworld.com`
- Password: `123456`

**Note:** This is a production-ready system. No demo company or employee data is pre-seeded. All companies and users are created through the registration flow.

## System Architecture

### Core Design Principles
- **Multi-tenancy**: Achieved via `companyId` relationships and middleware for data isolation.
- **Role-Based Access Control**: Three tiers (Super Admin, Company Admin, Employee) with specific permissions.
- **White-labeling**: Customizable for company branding.

### Frontend
- **Framework**: React with TypeScript (Vite build tool).
- **UI/UX**: `shadcn/ui` (Radix UI + Tailwind CSS) for components, inspired by Bootstrap 5 aesthetics (dark backgrounds, green accent #00C853), featuring a professional, card-based layout.
- **State Management**: TanStack Query for server state, React Context for authentication, React hooks for local state.
- **Routing**: Wouter for client-side routing.
- **Styling**: Tailwind CSS with custom design tokens, CSS variables for theme customization, utility classes for interaction patterns.
- **Forms**: React Hook Form with Zod for validation.

### Backend
- **Framework**: Express.js with TypeScript.
- **API**: RESTful API design.
- **Authentication**: Session-based and token-based (Bearer tokens). Middleware for authentication and authorization (`requireAuth`, `requireSuperAdmin`, `requireCompanyAdmin`, `enforceCompanyScope`).
- **Security Note**: Password storage currently in plain-text; bcrypt or similar hashing is required for production.

### Data Storage
- **Database**: PostgreSQL with Neon serverless driver (migrated from in-memory storage).
- **ORM**: Drizzle ORM for type-safe database operations.
- **Implementation**: `DbStorage` class in `server/db-storage.ts` implements all CRUD operations.
- **Persistence**: All data persists across server restarts.
- **Seeding**: Creates super admin user and 3 default subscription plans via `server/seed.ts` (production-ready, no demo data).
- **Schema**: 
  - `companies`: Multi-tenant records with status field (pending/active/suspended/rejected), plan, maxEmployees
  - `users`: Employee records with role, company, department, position
  - `plans`: Subscription plans with pricing, duration, employee limits, and features
  - `CompanyStatus` enum: pending (default for new registrations), active (approved by super admin), suspended, rejected

### Authentication Flow
- **Login**: Separate portals for Company Admin, Employee, Super Admin.
- **Process**: POST to `/api/auth/login`, server validates credentials, creates session token, client stores token and user data.
- **Route Protection**: `ProtectedRoute` component enforces authentication and role requirements, redirecting unauthorized users.
- **Company Registration**: 
  - POST to `/api/auth/register` with company name, admin details (firstName, lastName, email, password, phone, gender), and selected planId
  - Users select from active subscription plans (Basic ₹5k, Standard ₹10k, Premium ₹20k per month)
  - Atomically creates both company entity (with "pending" status) and admin user
  - Selected plan determines company's maxEmployees limit and plan tier
  - After registration, company admin can immediately login with email/password
  - Pending companies are redirected to `/waiting-approval` page where they can view approval status and logout
  - After super admin approves payment request, company status changes to "active"
  - Active companies are redirected to full admin dashboard (`/dashboard/admin`) on login

### Key Features

#### Subscription Plans System
- **Functionality**: Tiered pricing model with employee limits and feature sets.
- **Schema**: `plans` (name, displayName, price, duration, maxEmployees, features array, isActive flag).
- **Plans**: Three default tiers seeded automatically:
  - **Basic Plan**: ₹5,000/month for up to 50 employees
  - **Standard Plan**: ₹10,000/month for up to 100 employees
  - **Premium Plan**: ₹20,000/month for up to 500 employees
- **Registration**: Companies select plan during sign-up; plan determines maxEmployees limit.
- **API Endpoints**:
  - `GET /api/plans` - Public endpoint for active plans (used during registration)
  - `GET /api/plans/all` - Super admin: view all plans
  - `POST /api/plans` - Super admin: create new plan
  - `PATCH /api/plans/:id` - Super admin: update plan
  - `DELETE /api/plans/:id` - Super admin: delete plan
- **Validation**: Backend validates plan exists and is active before registration; returns 400 for invalid selections.

#### Payroll Management System
- **Functionality**: Automatic generation, approval workflows, payslip management.
- **Schema**: `payroll_records` (employee association, pay period, calculations, status workflow) and `payroll_items` (salary components).
- **Workflow**: Generate, approve/reject (Company Admin), publish (Company Admin).
- **Frontend**: Dashboard with summary statistics, filters, bulk generation, payslip preview, one-click actions.

#### Expense Management System
- **Functionality**: Claim processing, role-based limits, manager approval, admin disbursement.
- **Schema**: `expense_types` (categories with limits, bill mandatory, approval required, Google Maps integration toggle), `expense_claims` (employee claims, status workflow, total amount, approval/disbursement timestamps), `expense_claim_items` (individual line items with details).
- **Workflow**: Draft -> Pending Approval -> Approved/Rejected -> Disbursed.
- **Role-Level Limits**: Configurable per role level, validated on submission.
- **Frontend**: Employee view (create, submit, track), Manager view (review, approve/reject team claims), Admin view (overview, disburse, master data management).

## External Dependencies

### Frontend Libraries
- **UI Components**: Radix UI, Tailwind CSS, shadcn/ui, Lucide React (icons), cmdk (command palette), embla-carousel-react.
- **Utilities**: class-variance-authority, date-fns.
- **State & Forms**: @tanstack/react-query, wouter, react-hook-form, @hookform/resolvers, zod, drizzle-zod.

### Backend & Database
- **Framework**: Express.js.
- **ORM**: Drizzle ORM, @neondatabase/serverless (PostgreSQL driver), drizzle-kit (migrations).
- **Session Store**: connect-pg-simple (configured, not active).

### Build & Development Tools
- **Build**: Vite (frontend), esbuild (server-side).
- **Language**: TypeScript.
- **Dev Tools**: tsx, PostCSS, Replit-specific Vite plugins (@replit/vite-plugin-runtime-error-modal, @replit/vite-plugin-cartographer, @replit/vite-plugin-dev-banner).