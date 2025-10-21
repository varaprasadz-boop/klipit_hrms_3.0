# HRMSWorld - HR Management System

## Overview

HRMSWorld is a modern, multi-tenant HR management system built with a full-stack TypeScript architecture. The application provides comprehensive HR functionality including attendance tracking, leave management, expense claims, payroll, employee lifecycle management, and workflow approvals. It features a three-tier user hierarchy (Super Admin, Company Admin, Employee) with role-based access control and supports white-label customization for company branding.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component Strategy**: The application uses a dual approach:
- **shadcn/ui component library** (Radix UI primitives with Tailwind CSS) for the actual implementation
- **Design guidelines reference Bootstrap 5** for aesthetic inspiration (black/dark backgrounds with green accent color #00C853)
- This creates a professional, card-based layout system with minimal shadows and clean spacing

**State Management**:
- TanStack Query (React Query) for server state management and API data caching
- React Context API for authentication state (`AuthProvider`)
- Local state with React hooks for component-level state

**Routing**: Wouter for lightweight client-side routing

**Styling Approach**:
- Tailwind CSS with custom design tokens for colors and spacing
- CSS variables for theme customization (supporting light/dark modes)
- Custom utility classes like `hover-elevate` and `active-elevate-2` for consistent interaction patterns

**Form Handling**: React Hook Form with Zod resolvers for validation

### Backend Architecture

**Framework**: Express.js with TypeScript

**API Design**: RESTful API structure with routes defined in `/server/routes.ts`

**Authentication & Authorization**:
- Session-based authentication using in-memory session storage (Map)
- Token-based authentication with Bearer tokens in Authorization headers
- Three-tier role system: SUPER_ADMIN, COMPANY_ADMIN, EMPLOYEE
- Middleware functions for authentication and authorization (`requireAuth`, `requireSuperAdmin`, `requireCompanyAdmin`, `enforceCompanyScope`)
- **Security Note**: Current implementation uses plain-text password storage - production deployment requires bcrypt or similar hashing

**Multi-Tenancy**: Company-scoped data access enforced through `companyId` relationships and middleware

**Data Layer**: 
- Currently using in-memory storage (`MemStorage` class) with demo data seeding
- Schema defined with Drizzle ORM (`shared/schema.ts`)
- Prepared for PostgreSQL migration (Drizzle configuration already in place)

### Data Storage Solutions

**Current State**: In-memory storage implementation (`MemStorage` in `server/storage.ts`)
- Temporary storage using JavaScript Map structures
- Includes seeded demo data (super admin, companies, employees)
- Interface-based design (`IStorage`) allows easy replacement

**Intended Database**: PostgreSQL with Neon serverless driver
- Drizzle ORM configured for PostgreSQL dialect
- Migration setup ready (`drizzle.config.ts`)
- Tables defined: `companies` and `users` with proper relationships

**Schema Design**:
- `companies` table: Multi-tenant company records with plan/status fields
- `users` table: Employee records with role, company association, department, position
- Relationship: Users reference companies via `companyId` foreign key

### Authentication Flow

**Login Process**:
1. Three separate login portals: Company Admin (`/login/company`), Employee (`/login/employee`), Super Admin (`/login/superadmin`)
2. POST to `/api/auth/login` with email/password
3. Server validates credentials and user status
4. Creates session token and returns user data with token
5. Client stores token in localStorage and user data in AuthContext
6. Token included in Authorization header for subsequent API requests

**Route Protection**:
- `ProtectedRoute` component wraps sensitive routes
- Checks authentication status and role requirements
- Redirects unauthorized users to home page
- Supports `requireAuth`, `requireSuperAdmin`, `requireCompanyAdmin` flags

### Key Architectural Patterns

**Component Organization**:
- Page components in `client/src/pages/`
- Reusable UI components in `client/src/components/`
- shadcn/ui primitives in `client/src/components/ui/`
- Example components demonstrating usage in `client/src/components/examples/`

**Shared Types**: Common schema types in `shared/schema.ts` used by both client and server

**Development vs Production**:
- Vite dev server with HMR in development
- Separate build process for client (Vite) and server (esbuild)
- Production serves static assets from Express

**Error Handling**:
- Centralized error middleware in Express
- Query client with custom error handling for 401/403 responses
- Toast notifications for user feedback

## External Dependencies

### Third-Party UI Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, label, popover, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, tooltip, etc.)
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **shadcn/ui**: Component collection built on Radix UI and Tailwind
- **Lucide React**: Icon library for consistent iconography
- **cmdk**: Command palette component
- **embla-carousel-react**: Carousel/slider functionality
- **class-variance-authority**: Utility for creating variant-based component APIs
- **date-fns**: Date manipulation and formatting

### Frontend State & Data Management
- **@tanstack/react-query**: Server state management, caching, and synchronization
- **wouter**: Lightweight routing library
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Integration between react-hook-form and validation libraries
- **zod**: Schema validation for forms and API payloads
- **drizzle-zod**: Generates Zod schemas from Drizzle ORM definitions

### Backend Framework & Middleware
- **Express.js**: Web application framework
- **connect-pg-simple**: PostgreSQL session store (configured but not yet active)

### Database & ORM
- **Drizzle ORM**: TypeScript ORM for SQL databases
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver (configured for future use)
- **drizzle-kit**: CLI tools for database migrations

### Build & Development Tools
- **Vite**: Frontend build tool and dev server
- **@vitejs/plugin-react**: React support for Vite
- **TypeScript**: Type safety across the stack
- **esbuild**: Server-side bundling for production
- **tsx**: TypeScript execution for development
- **PostCSS**: CSS processing with Autoprefixer
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicators

### Database Configuration
- **Database URL**: Required environment variable `DATABASE_URL` for PostgreSQL connection
- **Migration Path**: `./migrations` directory for Drizzle migrations
- **Current Status**: Infrastructure configured but using in-memory storage; database integration pending

## Key Features

### Payroll Management System

The Payroll module provides comprehensive payroll processing capabilities including automatic generation, approval workflows, and payslip management.

**Schema Design**:
- `payroll_records` table: Core payroll records with employee association, pay period (month/year), working days tracking, salary calculations (gross pay, deductions, net pay), status workflow (pending/approved/rejected), approval metadata, and payslip publication status
- `payroll_items` table: Individual salary components (earnings/deductions) linked to CTC components for detailed payroll breakdowns

**API Endpoints**:
- `GET /api/payroll`: List all payroll records for company with filtering support
- `POST /api/payroll/generate`: Generate payroll for multiple employees for specified month/year
- `GET /api/payroll/:id`: Get specific payroll record details
- `PUT /api/payroll/:id/approve`: Approve pending payroll (requires company admin)
- `PUT /api/payroll/:id/reject`: Reject pending payroll with reason (requires company admin)
- `PUT /api/payroll/:id/publish`: Publish approved payslip to employee portal
- `GET /api/payroll/:id/items`: Get detailed salary breakdown for payroll record
- `DELETE /api/payroll/:id`: Delete pending or rejected payroll records

**Payroll Generation Logic**:
- Automatically calculates working days based on pay period
- Retrieves attendance records for accurate present/absent day tracking
- Integrates with employee CTC components for salary calculations
- Supports monthly frequency components (basic salary, allowances, etc.)
- Creates detailed payroll items for earnings and deductions
- Prevents duplicate payroll generation for same employee/period

**Approval Workflow**:
- Three-state status: Pending → Approved/Rejected
- Only approved payroll can be published to employees
- Rejection requires reason for audit trail
- Approval recorded with admin ID and timestamp
- Published payslips immutable (cannot be deleted or modified)

**Frontend Features**:
- Summary statistics dashboard (total employees, total payout, status breakdown)
- Multi-filter support (month, year, status, department)
- Bulk employee selection for payroll generation
- Visual payslip preview with professional formatting
- One-click approve/reject/publish actions
- Company logo and employee details display
- Detailed earnings and deductions breakdown
- Real-time status tracking and updates

**Security & Validation**:
- Company admin access required for all payroll operations
- Company scoping enforced at data and API levels
- Cannot delete approved or published payroll
- Validation prevents invalid status transitions
- Rejection reason mandatory for audit compliance