# Klipit by Bova - HR Management System

## Overview
Klipit by Bova is a multi-tenant HR management system providing comprehensive functionalities for attendance, leave, expense, payroll, employee lifecycle, and workflow approvals. Built with a full-stack TypeScript architecture, it features a three-tier user hierarchy (Super Admin, Company Admin, Employee) with role-based access control and supports white-label customization. The system is designed to be robust, scalable, and aims to streamline HR operations for businesses. All application data is dynamic, with no hardcoded or mock data, ensuring full CRUD capabilities and role-based access control for multi-tenant data isolation.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Core Design Principles
-   **Multi-tenancy**: Achieved via `companyId` relationships and middleware for data isolation.
-   **Role-Based Access Control**: Three tiers (Super Admin, Company Admin, Employee) with specific permissions.
-   **White-labeling**: Customizable for company branding.

### Frontend
-   **Framework**: React with TypeScript (Vite build tool).
-   **UI/UX**: `shadcn/ui` (Radix UI + Tailwind CSS) for components, inspired by Bootstrap 5 aesthetics (dark backgrounds, green accent #00C853), featuring a professional, card-based layout.
-   **State Management**: TanStack Query for server state, React Context for authentication, React hooks for local state.
-   **Routing**: Wouter for client-side routing.
-   **Styling**: Tailwind CSS with custom design tokens, CSS variables for theme customization, utility classes for interaction patterns.
-   **Forms**: React Hook Form with Zod for validation.

### Backend
-   **Framework**: Express.js with TypeScript.
-   **API**: RESTful API design.
-   **Authentication**: Session-based and token-based (Bearer tokens). Middleware for authentication and authorization (`requireAuth`, `requireSuperAdmin`, `requireCompanyAdmin`, `enforceCompanyScope`).
-   **Security**: Production-ready password hashing using bcrypt (10 salt rounds). All passwords hashed before storage.

### Data Storage
-   **Database**: PostgreSQL with Neon serverless driver.
-   **ORM**: Drizzle ORM for type-safe database operations.
-   **Persistence**: All data persists across server restarts.
-   **Seeding**: Creates super admin user and 3 default subscription plans.
-   **Schema Highlights**:
    -   `companies`: Multi-tenant records with status, plan, maxEmployees, logoUrl, subdomain, subdomainStatus, subdomainRequestedAt.
    -   `users`: Employee records with role, company, department, position, hashed password.
    -   `plans`: Subscription plans with pricing, duration, employee limits, features.
    -   `registration_sessions`: Multi-step registration tracking.
    -   `orders`: Online payment orders.
    -   `offline_payment_requests`: Offline payment requests.
    -   `supportTickets`: For support requests.
    -   `auditLogs`: For system activity tracking.

### Authentication Flow
-   **Login**: Separate portals for Company Admin, Employee, Super Admin.
-   **Process**: Credentials validated via bcrypt.compare(), session token created.
-   **Route Protection**: `ProtectedRoute` component enforces authentication and role requirements.

### Company Registration Flow
A multi-step wizard with secure password handling and super admin approval:
1.  **Company & Admin Details**: Password immediately hashed.
2.  **Plan Selection**: Users select from active subscription plans.
3.  **Employee Count**: Dynamic price calculation based on employee count and plan.
4.  **Payment Method**: Online (simulated) or Offline request. Atomically creates company (pending status), admin user, and order/request.
5.  **Approval & Activation**: Super admin reviews and approves, changing company status from "pending" to "active".

### Key Features

#### White-Label Features
-   **Company Logo Display**: Companies can set custom logos that display in the dashboard sidebar for all users (admins and employees). Falls back to default Klipit logo if not configured.
-   **Custom Subdomain System**: Companies can request custom subdomains through company settings, subject to super admin approval.
-   **Workflow**:
    1. Company admin requests subdomain via settings page (status: pending)
    2. Super admin reviews and approves/rejects via Domain Requests page
    3. Upon approval, subdomain status changes to "approved" and is assigned to the company
-   **Database Fields**: `companies.subdomain`, `companies.subdomainStatus`, `companies.subdomainRequestedAt`
-   **API Endpoints**:
    - POST /api/companies/:id/request-subdomain - Request subdomain
    - GET /api/admin/subdomain-requests - List pending requests
    - POST /api/admin/subdomain-requests/:id/approve - Approve request
    - POST /api/admin/subdomain-requests/:id/reject - Reject request

#### Subscription Plans System
-   **Functionality**: Tiered pricing model with per-employee pricing and feature sets.
-   **Pricing Model**: Dynamic calculation: `basePrice + (additionalEmployees × pricePerAdditionalEmployee)`.
-   **Default Plans**: Basic, Advance, Pro with varying inclusions and per-additional-employee costs.

#### Payroll Management System
-   **Functionality**: Automatic generation, approval workflows, payslip management.
-   **Workflow**: Generate, approve/reject (Company Admin), publish (Company Admin).

#### Expense Management System
-   **Functionality**: Claim processing, role-based limits, manager approval, admin disbursement.
-   **Workflow**: Draft -> Pending Approval -> Approved/Rejected -> Disbursed.
-   **Role-Level Limits**: Configurable and validated.

## External Dependencies

### Frontend Libraries
-   **UI Components**: Radix UI, Tailwind CSS, shadcn/ui, Lucide React, cmdk, embla-carousel-react.
-   **Utilities**: class-variance-authority, date-fns.
-   **State & Forms**: @tanstack/react-query, wouter, react-hook-form, @hookform/resolvers, zod, drizzle-zod.

### Backend & Database
-   **Framework**: Express.js.
-   **ORM**: Drizzle ORM, @neondatabase/serverless (PostgreSQL driver), drizzle-kit.

### Build & Development Tools
-   **Build**: Vite (frontend), esbuild (server-side).
-   **Language**: TypeScript.
-   **Dev Tools**: tsx, PostCSS, Replit-specific Vite plugins.