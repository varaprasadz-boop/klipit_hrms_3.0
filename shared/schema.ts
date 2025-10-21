import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, date, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  status: text("status").notNull().default("active"),
  plan: text("plan").notNull().default("basic"),
  maxEmployees: text("max_employees").default("50"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

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

// Expense Types
export const expenseTypes = pgTable("expense_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  code: text("code").notNull(),
  name: text("name").notNull(),
  requiresReceipt: boolean("requires_receipt").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExpenseTypeSchema = createInsertSchema(expenseTypes).omit({
  id: true,
  createdAt: true,
});

export type InsertExpenseType = z.infer<typeof insertExpenseTypeSchema>;
export type ExpenseType = typeof expenseTypes.$inferSelect;
