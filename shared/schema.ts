import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, date, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const CompanyStatus = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  REJECTED: "rejected",
} as const;

export type CompanyStatusType = typeof CompanyStatus[keyof typeof CompanyStatus];

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  status: text("status").notNull().default("pending"),
  plan: text("plan").notNull().default("basic"),
  maxEmployees: text("max_employees").default("50"),
  logoUrl: text("logo_url"),
  address: text("address"),
  phone: text("phone"),
  website: text("website"),
  primaryColor: text("primary_color").default("#00C853"),
  secondaryColor: text("secondary_color").default("#000000"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

// Step 1: Company basic info (multi-step registration)
export const registerCompanySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  adminFirstName: z.string().min(1, "First name is required"),
  adminLastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  gender: z.string().min(1, "Gender is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterCompany = z.infer<typeof registerCompanySchema>;

export const updateCompanySettingsSchema = z.object({
  name: z.string().optional(),
  logoUrl: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type UpdateCompanySettings = z.infer<typeof updateCompanySettingsSchema>;
export type Company = typeof companies.$inferSelect;

// Plans/Packages
export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(), // internal name like "basic", "premium"
  displayName: text("display_name").notNull(), // display name like "Basic Plan"
  duration: integer("duration").notNull().default(1), // duration in months
  price: integer("price").notNull().default(0), // base price in rupees per month
  maxEmployees: integer("max_employees").notNull().default(50), // maximum allowed employees
  employeesIncluded: integer("employees_included").notNull().default(10), // employees included in base price
  pricePerAdditionalEmployee: integer("price_per_additional_employee").notNull().default(0), // cost per employee beyond included count
  features: jsonb("features").notNull().default([]), // array of feature strings
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  createdAt: true,
});

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;

// Registration Sessions - Multi-step registration tracking
export const RegistrationStatus = {
  COMPANY_INFO: "company_info",
  PLAN_SELECTION: "plan_selection",
  EMPLOYEES_SETUP: "employees_setup",
  PAYMENT_PENDING: "payment_pending",
  COMPLETED: "completed",
} as const;

export type RegistrationStatusType = typeof RegistrationStatus[keyof typeof RegistrationStatus];

export const registrationSessions = pgTable("registration_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  status: text("status").notNull().default("company_info"),
  sessionData: jsonb("session_data").notNull().default({}), // Stores company info, plan selection, additional employees
  companyId: varchar("company_id"), // Set after company creation
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRegistrationSessionSchema = createInsertSchema(registrationSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRegistrationSession = z.infer<typeof insertRegistrationSessionSchema>;
export type RegistrationSession = typeof registrationSessions.$inferSelect;

// Orders - Online payment tracking
export const OrderStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus];

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  planId: varchar("plan_id").notNull().references(() => plans.id),
  amount: integer("amount").notNull(), // Amount in rupees
  currency: text("currency").notNull().default("INR"),
  status: text("status").notNull().default("pending"),
  paymentProvider: text("payment_provider").default("stripe"), // stripe, razorpay, etc
  paymentIntentId: text("payment_intent_id"), // External payment ID from provider
  metadata: jsonb("metadata").default({}), // Additional payment metadata
  approvedBy: varchar("approved_by"), // Super admin who approved
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Offline Payment Requests
export const OfflinePaymentStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type OfflinePaymentStatusType = typeof OfflinePaymentStatus[keyof typeof OfflinePaymentStatus];

export const offlinePaymentRequests = pgTable("offline_payment_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull(),
  planId: varchar("plan_id").notNull().references(() => plans.id),
  amount: integer("amount").notNull(), // Amount in rupees
  requestedBy: varchar("requested_by").notNull(), // User who requested
  notes: text("notes"), // User's notes/details about offline payment
  status: text("status").notNull().default("pending"),
  attachmentUrls: jsonb("attachment_urls").default([]), // Payment proof attachments
  approvedBy: varchar("approved_by"), // Super admin who approved/rejected
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOfflinePaymentRequestSchema = createInsertSchema(offlinePaymentRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOfflinePaymentRequest = z.infer<typeof insertOfflinePaymentRequestSchema>;
export type OfflinePaymentRequest = typeof offlinePaymentRequests.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  companyId: varchar("company_id").references(() => companies.id),
  department: text("department"),
  position: text("position"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  COMPANY_ADMIN: "COMPANY_ADMIN",
  EMPLOYEE: "EMPLOYEE",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Departments
export const departments = pgTable("departments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
});

export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;

// Designations
export const designations = pgTable("designations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDesignationSchema = createInsertSchema(designations).omit({
  id: true,
  createdAt: true,
});

export type InsertDesignation = z.infer<typeof insertDesignationSchema>;
export type Designation = typeof designations.$inferSelect;

// Roles & Levels
export const rolesLevels = pgTable("roles_levels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  role: text("role").notNull(),
  level: text("level").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRoleLevelSchema = createInsertSchema(rolesLevels).omit({
  id: true,
  createdAt: true,
});

export type InsertRoleLevel = z.infer<typeof insertRoleLevelSchema>;
export type RoleLevel = typeof rolesLevels.$inferSelect;

// CTC Components (Payables and Deductables)
export const ctcComponents = pgTable("ctc_components", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'payable' or 'deductable'
  isStandard: boolean("is_standard").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCtcComponentSchema = createInsertSchema(ctcComponents)
  .omit({
    id: true,
    companyId: true,
    createdAt: true,
  })
  .extend({
    type: z.enum(["payable", "deductable"]),
  });

export type InsertCtcComponent = z.infer<typeof insertCtcComponentSchema>;
export type CtcComponent = typeof ctcComponents.$inferSelect;

// Payroll
export const payrollRecords = pgTable("payroll_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  workingDays: integer("working_days").notNull(),
  presentDays: integer("present_days").notNull(),
  absentDays: integer("absent_days").notNull(),
  paidLeaveDays: integer("paid_leave_days").default(0),
  overtimeHours: integer("overtime_hours").default(0),
  grossPay: integer("gross_pay").notNull(),
  totalDeductions: integer("total_deductions").notNull(),
  netPay: integer("net_pay").notNull(),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  payslipPublished: boolean("payslip_published").default(false),
  payslipPublishedAt: timestamp("payslip_published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPayrollRecordSchema = createInsertSchema(payrollRecords).omit({
  id: true,
  companyId: true,
  createdAt: true,
}).extend({
  status: z.enum(["pending", "approved", "rejected"]).default("pending"),
});

export type InsertPayrollRecord = z.infer<typeof insertPayrollRecordSchema>;
export type PayrollRecord = typeof payrollRecords.$inferSelect;

// Payroll Items (individual salary components in a payroll)
export const payrollItems = pgTable("payroll_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  payrollId: varchar("payroll_id").notNull().references(() => payrollRecords.id, { onDelete: "cascade" }),
  ctcComponentId: varchar("ctc_component_id").references(() => ctcComponents.id),
  type: text("type").notNull(), // 'earning' or 'deduction'
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPayrollItemSchema = createInsertSchema(payrollItems).omit({
  id: true,
  createdAt: true,
}).extend({
  type: z.enum(["earning", "deduction"]),
});

export type InsertPayrollItem = z.infer<typeof insertPayrollItemSchema>;
export type PayrollItem = typeof payrollItems.$inferSelect;

// Education, Experience, Documents, CTC, Assets, Bank, Insurance, Statutory schemas
export const educationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.string(),
  grade: z.string().optional(),
});

export const experienceSchema = z.object({
  company: z.string(),
  position: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

export const documentSchema = z.object({
  name: z.string(),
  type: z.string(),
  size: z.number(),
  url: z.string(),
  uploadedAt: z.string(),
});

export const ctcComponentSchema = z.object({
  component: z.string(),
  amount: z.number(),
  frequency: z.string(),
  type: z.string(),
});

export const assetSchema = z.object({
  name: z.string(),
  type: z.string(),
  serialNumber: z.string().optional(),
  assignedDate: z.string(),
  returnDate: z.string().optional(),
});

export const bankInfoSchema = z.object({
  accountNumber: z.string(),
  bankName: z.string(),
  ifscCode: z.string(),
  accountHolderName: z.string(),
});

export const insuranceInfoSchema = z.object({
  provider: z.string(),
  policyNumber: z.string(),
  coverageAmount: z.number(),
  startDate: z.string(),
  endDate: z.string(),
});

export const statutoryInfoSchema = z.object({
  panNumber: z.string().optional(),
  aadharNumber: z.string().optional(),
  pfNumber: z.string().optional(),
  esiNumber: z.string().optional(),
  uanNumber: z.string().optional(),
});

// Employees
export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  departmentId: varchar("department_id").references(() => departments.id),
  designationId: varchar("designation_id").references(() => designations.id),
  roleLevelId: varchar("role_level_id").references(() => rolesLevels.id),
  reportingManagerId: varchar("reporting_manager_id").references((): any => employees.id),
  status: text("status").notNull().default("active"),
  joinDate: date("join_date").notNull(),
  exitDate: date("exit_date"),
  attendanceType: text("attendance_type").default("regular"),
  education: jsonb("education").$type<z.infer<typeof educationSchema>[]>().default([]),
  experience: jsonb("experience").$type<z.infer<typeof experienceSchema>[]>().default([]),
  documents: jsonb("documents").$type<z.infer<typeof documentSchema>[]>().default([]),
  ctc: jsonb("ctc").$type<z.infer<typeof ctcComponentSchema>[]>().default([]),
  assets: jsonb("assets").$type<z.infer<typeof assetSchema>[]>().default([]),
  bank: jsonb("bank").$type<z.infer<typeof bankInfoSchema>>(),
  insurance: jsonb("insurance").$type<z.infer<typeof insuranceInfoSchema>>(),
  statutory: jsonb("statutory").$type<z.infer<typeof statutoryInfoSchema>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
}).extend({
  education: z.array(educationSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  documents: z.array(documentSchema).optional(),
  ctc: z.array(ctcComponentSchema).optional(),
  assets: z.array(assetSchema).optional(),
  bank: bankInfoSchema.optional(),
  insurance: insuranceInfoSchema.optional(),
  statutory: statutoryInfoSchema.optional(),
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

// Shifts
export const shifts = pgTable("shifts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  name: text("name").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  weeklyOffs: jsonb("weekly_offs").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  createdAt: true,
}).extend({
  weeklyOffs: z.array(z.string()).optional(),
});

export type InsertShift = z.infer<typeof insertShiftSchema>;
export type Shift = typeof shifts.$inferSelect;

// Attendance Records
export const attendanceRecords = pgTable("attendance_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  date: date("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  shiftId: varchar("shift_id").references(() => shifts.id),
  status: text("status").notNull().default("pending"),
  duration: integer("duration"),
  location: text("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
  createdAt: true,
});

export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;

// Holidays
export const holidays = pgTable("holidays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  date: date("date").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  departmentIds: jsonb("department_ids").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHolidaySchema = createInsertSchema(holidays).omit({
  id: true,
  createdAt: true,
}).extend({
  departmentIds: z.array(z.string()).optional(),
});

export type InsertHoliday = z.infer<typeof insertHolidaySchema>;
export type Holiday = typeof holidays.$inferSelect;

// Leave Types
export const leaveTypes = pgTable("leave_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  maxDays: integer("max_days"),
  carryForward: boolean("carry_forward").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeaveTypeSchema = createInsertSchema(leaveTypes).omit({
  id: true,
  createdAt: true,
});

export type InsertLeaveType = z.infer<typeof insertLeaveTypeSchema>;
export type LeaveType = typeof leaveTypes.$inferSelect;

// Role-Level Limits for Expense Types
export const roleLevelLimitSchema = z.object({
  roleLevelId: z.string(),
  roleName: z.string(),
  limitAmount: z.number(),
  limitUnit: z.enum(["fixed", "per_km", "per_day"]),
});

// Expense Types
export const expenseTypes = pgTable("expense_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  roleLevelLimits: jsonb("role_level_limits").$type<z.infer<typeof roleLevelLimitSchema>[]>().default([]),
  enableGoogleMaps: boolean("enable_google_maps").default(false),
  billMandatory: boolean("bill_mandatory").default(false),
  approvalRequired: boolean("approval_required").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExpenseTypeSchema = createInsertSchema(expenseTypes).omit({
  id: true,
  createdAt: true,
  companyId: true,
}).extend({
  roleLevelLimits: z.array(roleLevelLimitSchema).optional(),
  enableGoogleMaps: z.boolean().optional(),
  billMandatory: z.boolean().optional(),
  approvalRequired: z.boolean().optional(),
});

export type InsertExpenseType = z.infer<typeof insertExpenseTypeSchema>;
export type ExpenseType = typeof expenseTypes.$inferSelect;

// Expense Claims
export const expenseClaims = pgTable("expense_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  employeeId: varchar("employee_id").notNull().references(() => employees.id),
  claimNumber: text("claim_number").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  totalAmount: integer("total_amount").notNull().default(0),
  status: text("status").notNull().default("draft"), // draft, pending_approval, approved, rejected, disbursed
  submittedAt: timestamp("submitted_at"),
  managerReviewedBy: varchar("manager_reviewed_by").references(() => employees.id),
  managerReviewedAt: timestamp("manager_reviewed_at"),
  managerRemarks: text("manager_remarks"),
  adminDisbursedBy: varchar("admin_disbursed_by"),
  adminDisbursedAt: timestamp("admin_disbursed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExpenseClaimSchema = createInsertSchema(expenseClaims).omit({
  id: true,
  createdAt: true,
  companyId: true,
}).extend({
  status: z.enum(["draft", "pending_approval", "approved", "rejected", "disbursed"]).optional(),
});

// Schema for updating draft expense claims (whitelist safe fields only)
export const updateExpenseClaimSchema = z.object({
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2000).max(2100).optional(),
  claimNumber: z.string().optional(),
  totalAmount: z.number().nonnegative().optional(),
});

export type InsertExpenseClaim = z.infer<typeof insertExpenseClaimSchema>;
export type UpdateExpenseClaim = z.infer<typeof updateExpenseClaimSchema>;
export type ExpenseClaim = typeof expenseClaims.$inferSelect;

// Expense Claim Items
export const expenseClaimItems = pgTable("expense_claim_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimId: varchar("claim_id").notNull().references(() => expenseClaims.id),
  expenseTypeId: varchar("expense_type_id").notNull().references(() => expenseTypes.id),
  date: date("date").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  billUrl: text("bill_url"),
  startLocation: text("start_location"),
  endLocation: text("end_location"),
  distanceKm: integer("distance_km"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExpenseClaimItemSchema = createInsertSchema(expenseClaimItems).omit({
  id: true,
  createdAt: true,
  claimId: true,
}).extend({
  amount: z.number().positive(),
});

export type InsertExpenseClaimItem = z.infer<typeof insertExpenseClaimItemSchema>;
export type ExpenseClaimItem = typeof expenseClaimItems.$inferSelect;

// Workflows (Task/Target Assignment)
export const workflows = pgTable("workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'task' or 'target'
  departmentId: varchar("department_id").references(() => departments.id),
  assignedTo: varchar("assigned_to").notNull().references(() => users.id),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  deadline: date("deadline").notNull(),
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  status: text("status").notNull().default("pending"), // 'pending', 'in_progress', 'completed', 'cancelled'
  progress: integer("progress").notNull().default(0), // 0-100
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  companyId: true,
  assignedBy: true,
}).extend({
  type: z.enum(["task", "target"]),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  progress: z.number().min(0).max(100).optional(),
});

export const updateWorkflowSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["task", "target"]).optional(),
  departmentId: z.string().optional(),
  assignedTo: z.string().optional(),
  deadline: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type UpdateWorkflow = z.infer<typeof updateWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

export const notices = pgTable("notices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  title: text("title").notNull(),
  content: text("content"),
  category: text("category").notNull().default("General"),
  pinned: boolean("pinned").notNull().default(false),
  postedBy: varchar("posted_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNoticeSchema = createInsertSchema(notices).omit({
  id: true,
  createdAt: true,
  companyId: true,
  postedBy: true,
}).extend({
  category: z.string().optional(),
  pinned: z.boolean().optional(),
});

export const updateNoticeSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  pinned: z.boolean().optional(),
});

export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type UpdateNotice = z.infer<typeof updateNoticeSchema>;
export type Notice = typeof notices.$inferSelect;

export const leaveRequests = pgTable("leave_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  employeeId: varchar("employee_id").notNull().references(() => users.id),
  leaveTypeId: varchar("leave_type_id").notNull().references(() => leaveTypes.id),
  fromDate: date("from_date").notNull(),
  toDate: date("to_date").notNull(),
  days: integer("days").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, cancelled
  appliedOn: timestamp("applied_on").defaultNow().notNull(),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedOn: timestamp("approved_on"),
  rejectedBy: varchar("rejected_by").references(() => users.id),
  rejectedOn: timestamp("rejected_on"),
  rejectionReason: text("rejection_reason"),
});

export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({
  id: true,
  companyId: true,
  employeeId: true,
  appliedOn: true,
  approvedBy: true,
  approvedOn: true,
  rejectedBy: true,
  rejectedOn: true,
}).extend({
  status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
});

export const updateLeaveRequestSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
  rejectionReason: z.string().optional(),
});

export type InsertLeaveRequest = z.infer<typeof insertLeaveRequestSchema>;
export type UpdateLeaveRequest = z.infer<typeof updateLeaveRequestSchema>;
export type LeaveRequest = typeof leaveRequests.$inferSelect;

export const leaveBalances = pgTable("leave_balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  employeeId: varchar("employee_id").notNull().references(() => users.id),
  leaveTypeId: varchar("leave_type_id").notNull().references(() => leaveTypes.id),
  year: integer("year").notNull(),
  totalDays: integer("total_days").notNull().default(0),
  usedDays: integer("used_days").notNull().default(0),
  remainingDays: integer("remaining_days").notNull().default(0),
});

export const insertLeaveBalanceSchema = createInsertSchema(leaveBalances).omit({
  id: true,
  companyId: true,
});

export const updateLeaveBalanceSchema = z.object({
  totalDays: z.number().optional(),
  usedDays: z.number().optional(),
  remainingDays: z.number().optional(),
});

export type InsertLeaveBalance = z.infer<typeof insertLeaveBalanceSchema>;
export type UpdateLeaveBalance = z.infer<typeof updateLeaveBalanceSchema>;
export type LeaveBalance = typeof leaveBalances.$inferSelect;
