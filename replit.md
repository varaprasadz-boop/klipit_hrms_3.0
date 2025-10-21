# Klipit by Bova - HR Management System

## Overview

Klipit by Bova is a multi-tenant HR management system offering comprehensive functionalities such as attendance, leave, expense, payroll, employee lifecycle, and workflow approvals. Built with a full-stack TypeScript architecture, it features a three-tier user hierarchy (Super Admin, Company Admin, Employee) with role-based access control and supports white-label customization. The project aims to provide a robust, scalable solution for HR operations, enhancing efficiency and streamlining HR processes for businesses of varying sizes.

## User Preferences

Preferred communication style: Simple, everyday language.

## Demo Credentials

### Super Admin Login (`/login/superadmin`)
- Email: `superadmin@klipit.com`
- Password: `123456`

### Company Admin Login (`/login/company`)
- Email: `admin@techsolutions.com`
- Password: `123456`
- Company: Tech Solutions Inc

### Employee Logins (`/login/employee`)
1. **Sarah Johnson** (Engineering - Senior Engineer)
   - Email: `sarah.johnson@techsolutions.com`
   - Password: `123456`

2. **Michael Chen** (Engineering - Engineer)
   - Email: `michael.chen@techsolutions.com`
   - Password: `123456`

3. **Emily Rodriguez** (Sales - Sales Manager)
   - Email: `emily.rodriguez@techsolutions.com`
   - Password: `123456`

4. **David Kumar** (HR - HR Coordinator)
   - Email: `david.kumar@techsolutions.com`
   - Password: `123456`

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
- **Current**: In-memory storage (`MemStorage`) with seeded demo data.
- **Intended**: PostgreSQL with Neon serverless driver.
- **ORM**: Drizzle ORM configured for PostgreSQL.
- **Schema**: `companies` (multi-tenant records) and `users` (employee records with role, company, department, position).

### Authentication Flow
- **Login**: Separate portals for Company Admin, Employee, Super Admin.
- **Process**: POST to `/api/auth/login`, server validates credentials, creates session token, client stores token and user data.
- **Route Protection**: `ProtectedRoute` component enforces authentication and role requirements, redirecting unauthorized users.

### Key Features

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