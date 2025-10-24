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
- **Security**: Production-ready password hashing using bcrypt (10 salt rounds). All passwords hashed before storage. No plaintext passwords in database or session storage.

### Data Storage
- **Database**: PostgreSQL with Neon serverless driver (migrated from in-memory storage).
- **ORM**: Drizzle ORM for type-safe database operations.
- **Implementation**: `DbStorage` class in `server/db-storage.ts` implements all CRUD operations.
- **Persistence**: All data persists across server restarts.
- **Seeding**: Creates super admin user and 3 default subscription plans via `server/seed.ts` (production-ready, no demo data).
- **Schema**: 
  - `companies`: Multi-tenant records with status field (pending/active/suspended/rejected), plan, maxEmployees
  - `users`: Employee records with role, company, department, position, **password (bcrypt hashed)**
  - `plans`: Subscription plans with pricing, duration, employee limits, and features
  - `registration_sessions`: Multi-step registration tracking (sessionId, status, sessionData with hashed password, expiresAt)
  - `orders`: Online payment orders (companyId, planId, amount, status, paymentDetails JSON)
  - `offline_payment_requests`: Offline payment requests (companyId, planId, amount, notes, status)
  - `CompanyStatus` enum: pending (default for new registrations), active (approved by super admin), suspended, rejected
  - `OrderStatus` enum: pending, approved, rejected
  - `OfflinePaymentStatus` enum: pending, approved, rejected

### Authentication Flow
- **Login**: Separate portals for Company Admin, Employee, Super Admin.
- **Process**: POST to `/api/auth/login`, server validates credentials using bcrypt.compare(), creates session token, client stores token and user data.
- **Route Protection**: `ProtectedRoute` component enforces authentication and role requirements, redirecting unauthorized users.
- **Password Security**: All passwords hashed using bcrypt (10 salt rounds) before storage. Server-side utility (`server/utils/password.ts`) handles hashing and verification.

### Company Registration Flow
Multi-step registration wizard with secure password handling and super admin approval:

**Step 1: Company & Admin Details** (`POST /api/registration/start`)
- Company name, admin details (firstName, lastName, email, password, phone, gender)
- Password immediately hashed with bcrypt before storing in sessionData
- Creates registration session with 24-hour expiration
- Returns sessionId for tracking subsequent steps

**Step 2: Plan Selection** (`POST /api/registration/:sessionId/select-plan`)
- Users select from active subscription plans with per-employee pricing
- Each plan shows: base price, included employees, cost per additional employee
- Validates plan exists and is active
- Updates session with selected planId

**Step 3: Employee Count** (`POST /api/registration/:sessionId/add-employees`)
- Simplified interface: Select number of employees (1-maxEmployees based on plan)
- **Dynamic Price Calculation**: Real-time total cost computed based on:
  - If employeeCount ≤ employeesIncluded: show base price only
  - If employeeCount > employeesIncluded: show base price + (additional × pricePerAdditional)
- Pricing breakdown displayed: base price + additional employee charges = total
- Employee count stored in session; actual employees added later by admin post-approval
- Clean UX with employee count selector and detailed pricing summary

**Step 4: Payment Method** (`POST /api/registration/:sessionId/pay-online` or `/pay-offline`)
- **Online Payment**: Dummy card form (card number, expiry, CVV) for simulation
- **Offline Payment**: Request with notes for manual approval
- Atomically creates company (status: "pending"), admin user (with hashed password from Step 1), employees (with hashed defaults), and order/offline request
- Returns success and redirects to `/waiting-approval`

**Step 5: Approval & Activation**
- Company admin can immediately login but is redirected to `/waiting-approval` while pending
- Super admin reviews Orders (`/superadmin/orders`) or Offline Requests (`/superadmin/offline-requests`)
- Upon approval: Company status changes from "pending" to "active"
- Active company admins are redirected to full admin dashboard (`/dashboard/admin`) on login

### Key Features

#### Subscription Plans System
- **Functionality**: Tiered pricing model with per-employee pricing and feature sets.
- **Schema**: `plans` (name, displayName, price, duration, maxEmployees, employeesIncluded, pricePerAdditionalEmployee, features array, isActive flag).
- **Pricing Model**: Dynamic per-employee pricing:
  - **Base Price**: Monthly fee that includes a set number of employees
  - **Additional Employee Cost**: Per-employee charge beyond the included count
  - **Total Cost Formula**: `basePrice + (additionalEmployees × pricePerAdditionalEmployee)` where `additionalEmployees = max(0, employeeCount - employeesIncluded)`
- **Plans**: Three default tiers configured:
  - **Basic Plan**: ₹299/month, includes up to 10 employees, +₹20 per additional employee, max 100 employees
  - **Advance Plan**: ₹599/month, includes up to 25 employees, +₹25 per additional employee, max 200 employees
  - **Pro Plan**: ₹999/month, includes up to 50 employees, +₹50 per additional employee, max 500 employees
- **Registration Flow**: 
  - Step 2: Companies select plan and see pricing structure (base price + per-employee pricing)
  - Step 3: Enter employee count and see real-time cost calculation with breakdown
  - Step 4: View final calculated total before payment
  - Dynamic pricing ensures companies pay only for what they need
- **API Endpoints**:
  - `GET /api/plans` - Public endpoint for active plans (used during registration)
  - `GET /api/plans/all` - Super admin: view all plans
  - `POST /api/plans` - Super admin: create new plan
  - `PATCH /api/plans/:id` - Super admin: update plan
  - `DELETE /api/plans/:id` - Super admin: delete plan
- **Validation**: Backend validates plan exists, is active, and employee count doesn't exceed maxEmployees before registration.

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