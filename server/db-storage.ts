import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, desc } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User, InsertUser, Company, InsertCompany, RegisterCompany, UserRole,
  Plan, InsertPlan,
  RegistrationSession, InsertRegistrationSession,
  Order, InsertOrder,
  OfflinePaymentRequest, InsertOfflinePaymentRequest,
  Department, InsertDepartment,
  Designation, InsertDesignation,
  RoleLevel, InsertRoleLevel,
  CtcComponent, InsertCtcComponent,
  Employee, InsertEmployee,
  AttendanceRecord, InsertAttendanceRecord,
  Shift, InsertShift,
  Holiday, InsertHoliday,
  LeaveType, InsertLeaveType,
  ExpenseType, InsertExpenseType,
  PayrollRecord, InsertPayrollRecord,
  PayrollItem, InsertPayrollItem,
  ExpenseClaim, InsertExpenseClaim,
  ExpenseClaimItem, InsertExpenseClaimItem,
  Workflow, InsertWorkflow,
  Notice, InsertNotice,
  LeaveRequest, InsertLeaveRequest,
  LeaveBalance, InsertLeaveBalance,
  SupportTicket, InsertSupportTicket,
  AuditLog, InsertAuditLog
} from "@shared/schema";
import type { IStorage } from "./storage";
import { randomUUID } from "crypto";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users);
  }

  async getUsersByCompany(companyId: string): Promise<User[]> {
    return await db.select().from(schema.users).where(eq(schema.users.companyId, companyId));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(schema.users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(schema.users).set(updates).where(eq(schema.users.id, id)).returning();
    return user;
  }

  // Company methods
  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, id));
    return company;
  }

  async getCompanyByEmail(email: string): Promise<Company | undefined> {
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.email, email));
    return company;
  }

  async getCompanyByPhone(phone: string): Promise<Company | undefined> {
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.phone, phone));
    return company;
  }

  async getCompanyBySubdomain(subdomain: string): Promise<Company | undefined> {
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.subdomain, subdomain));
    return company;
  }

  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(schema.companies);
  }

  async getCompaniesBySubdomainStatus(status: string): Promise<Company[]> {
    return await db.select().from(schema.companies).where(eq(schema.companies.subdomainStatus, status));
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(schema.companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company | undefined> {
    const [company] = await db.update(schema.companies).set(updates).where(eq(schema.companies.id, id)).returning();
    return company;
  }

  // Registration is now multi-step, so this method is deprecated
  // Kept for backwards compatibility but will be replaced by registration session flow
  async registerCompany(data: RegisterCompany): Promise<{ company: Company; user: User }> {
    const companyId = randomUUID();
    const userId = randomUUID();

    const [company] = await db.insert(schema.companies).values({
      id: companyId,
      name: data.companyName,
      email: data.email,
      status: "pending",
      plan: "basic", // Temporary default, will be set after plan selection
      maxEmployees: "50", // Temporary default
      phone: data.phone,
      primaryColor: "#00C853",
      secondaryColor: "#000000",
    }).returning();

    const [user] = await db.insert(schema.users).values({
      id: userId,
      email: data.email,
      password: data.password,
      name: `${data.adminFirstName} ${data.adminLastName}`,
      role: "COMPANY_ADMIN",
      companyId: companyId,
      position: "Company Administrator",
      status: "active",
    }).returning();

    return { company, user };
  }

  // Plan methods
  async getPlan(id: string): Promise<Plan | undefined> {
    const [plan] = await db.select().from(schema.plans).where(eq(schema.plans.id, id));
    return plan;
  }

  async getAllPlans(): Promise<Plan[]> {
    return await db.select().from(schema.plans);
  }

  async getActivePlans(): Promise<Plan[]> {
    return await db.select().from(schema.plans).where(eq(schema.plans.isActive, true));
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const [plan] = await db.insert(schema.plans).values(insertPlan).returning();
    return plan;
  }

  async updatePlan(id: string, updates: Partial<Plan>): Promise<Plan | undefined> {
    const [plan] = await db.update(schema.plans).set(updates).where(eq(schema.plans.id, id)).returning();
    return plan;
  }

  async deletePlan(id: string): Promise<boolean> {
    const result = await db.delete(schema.plans).where(eq(schema.plans.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Registration Session methods
  async getRegistrationSession(id: string): Promise<RegistrationSession | undefined> {
    const [session] = await db.select().from(schema.registrationSessions).where(eq(schema.registrationSessions.id, id));
    return session;
  }

  async createRegistrationSession(data: InsertRegistrationSession): Promise<RegistrationSession> {
    const [session] = await db.insert(schema.registrationSessions).values(data).returning();
    return session;
  }

  async updateRegistrationSession(id: string, updates: Partial<RegistrationSession>): Promise<RegistrationSession | undefined> {
    const [session] = await db.update(schema.registrationSessions).set(updates).where(eq(schema.registrationSessions.id, id)).returning();
    return session;
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
    return order;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(schema.orders);
  }

  async getPendingOrders(): Promise<Order[]> {
    return await db.select().from(schema.orders).where(eq(schema.orders.status, "pending"));
  }

  async createOrder(data: InsertOrder): Promise<Order> {
    const [order] = await db.insert(schema.orders).values(data).returning();
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const [order] = await db.update(schema.orders).set(updates).where(eq(schema.orders.id, id)).returning();
    return order;
  }

  // Offline Payment Request methods
  async getOfflinePaymentRequest(id: string): Promise<OfflinePaymentRequest | undefined> {
    const [request] = await db.select().from(schema.offlinePaymentRequests).where(eq(schema.offlinePaymentRequests.id, id));
    return request;
  }

  async getAllOfflinePaymentRequests(): Promise<OfflinePaymentRequest[]> {
    return await db.select().from(schema.offlinePaymentRequests);
  }

  async getPendingOfflinePaymentRequests(): Promise<OfflinePaymentRequest[]> {
    return await db.select().from(schema.offlinePaymentRequests).where(eq(schema.offlinePaymentRequests.status, "pending"));
  }

  async createOfflinePaymentRequest(data: InsertOfflinePaymentRequest): Promise<OfflinePaymentRequest> {
    const [request] = await db.insert(schema.offlinePaymentRequests).values(data).returning();
    return request;
  }

  async updateOfflinePaymentRequest(id: string, updates: Partial<OfflinePaymentRequest>): Promise<OfflinePaymentRequest | undefined> {
    const [request] = await db.update(schema.offlinePaymentRequests).set(updates).where(eq(schema.offlinePaymentRequests.id, id)).returning();
    return request;
  }

  // Department methods
  async getDepartment(id: string): Promise<Department | undefined> {
    const [dept] = await db.select().from(schema.departments).where(eq(schema.departments.id, id));
    return dept;
  }

  async getDepartmentsByCompany(companyId: string): Promise<Department[]> {
    return await db.select().from(schema.departments).where(eq(schema.departments.companyId, companyId));
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const [dept] = await db.insert(schema.departments).values(insertDepartment).returning();
    return dept;
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined> {
    const [dept] = await db.update(schema.departments).set(updates).where(eq(schema.departments.id, id)).returning();
    return dept;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    const result = await db.delete(schema.departments).where(eq(schema.departments.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Designation methods
  async getDesignation(id: string): Promise<Designation | undefined> {
    const [designation] = await db.select().from(schema.designations).where(eq(schema.designations.id, id));
    return designation;
  }

  async getDesignationsByCompany(companyId: string): Promise<Designation[]> {
    return await db.select().from(schema.designations).where(eq(schema.designations.companyId, companyId));
  }

  async createDesignation(insertDesignation: InsertDesignation): Promise<Designation> {
    const [designation] = await db.insert(schema.designations).values(insertDesignation).returning();
    return designation;
  }

  async updateDesignation(id: string, updates: Partial<Designation>): Promise<Designation | undefined> {
    const [designation] = await db.update(schema.designations).set(updates).where(eq(schema.designations.id, id)).returning();
    return designation;
  }

  async deleteDesignation(id: string): Promise<boolean> {
    const result = await db.delete(schema.designations).where(eq(schema.designations.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // RoleLevel methods
  async getRoleLevel(id: string): Promise<RoleLevel | undefined> {
    const [roleLevel] = await db.select().from(schema.rolesLevels).where(eq(schema.rolesLevels.id, id));
    return roleLevel;
  }

  async getRoleLevelsByCompany(companyId: string): Promise<RoleLevel[]> {
    return await db.select().from(schema.rolesLevels).where(eq(schema.rolesLevels.companyId, companyId));
  }

  async createRoleLevel(insertRoleLevel: InsertRoleLevel): Promise<RoleLevel> {
    const [roleLevel] = await db.insert(schema.rolesLevels).values(insertRoleLevel).returning();
    return roleLevel;
  }

  async updateRoleLevel(id: string, updates: Partial<RoleLevel>): Promise<RoleLevel | undefined> {
    const [roleLevel] = await db.update(schema.rolesLevels).set(updates).where(eq(schema.rolesLevels.id, id)).returning();
    return roleLevel;
  }

  async deleteRoleLevel(id: string): Promise<boolean> {
    const result = await db.delete(schema.rolesLevels).where(eq(schema.rolesLevels.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // CTC Component methods
  async getCtcComponent(id: string): Promise<CtcComponent | undefined> {
    const [component] = await db.select().from(schema.ctcComponents).where(eq(schema.ctcComponents.id, id));
    return component;
  }

  async getCtcComponentsByCompany(companyId: string): Promise<CtcComponent[]> {
    return await db.select().from(schema.ctcComponents).where(eq(schema.ctcComponents.companyId, companyId));
  }

  async createCtcComponent(insertComponent: InsertCtcComponent): Promise<CtcComponent> {
    const [component] = await db.insert(schema.ctcComponents).values(insertComponent).returning();
    return component;
  }

  async updateCtcComponent(id: string, updates: Partial<CtcComponent>): Promise<CtcComponent | undefined> {
    const [component] = await db.update(schema.ctcComponents).set(updates).where(eq(schema.ctcComponents.id, id)).returning();
    return component;
  }

  async deleteCtcComponent(id: string): Promise<boolean> {
    const result = await db.delete(schema.ctcComponents).where(eq(schema.ctcComponents.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Employee methods
  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(schema.employees).where(eq(schema.employees.id, id));
    return employee;
  }

  async getEmployeesByCompany(companyId: string): Promise<Employee[]> {
    return await db.select().from(schema.employees).where(eq(schema.employees.companyId, companyId));
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db.insert(schema.employees).values(insertEmployee).returning();
    return employee;
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined> {
    const [employee] = await db.update(schema.employees).set(updates).where(eq(schema.employees.id, id)).returning();
    return employee;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const result = await db.delete(schema.employees).where(eq(schema.employees.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Attendance Record methods
  async getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined> {
    const [record] = await db.select().from(schema.attendanceRecords).where(eq(schema.attendanceRecords.id, id));
    return record;
  }

  async getAttendanceRecordsByCompany(companyId: string): Promise<AttendanceRecord[]> {
    return await db.select().from(schema.attendanceRecords).where(eq(schema.attendanceRecords.companyId, companyId));
  }

  async getAttendanceRecordsByEmployee(employeeId: string): Promise<AttendanceRecord[]> {
    return await db.select().from(schema.attendanceRecords).where(eq(schema.attendanceRecords.employeeId, employeeId));
  }

  async createAttendanceRecord(insertRecord: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const [record] = await db.insert(schema.attendanceRecords).values(insertRecord).returning();
    return record;
  }

  async updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined> {
    const [record] = await db.update(schema.attendanceRecords).set(updates).where(eq(schema.attendanceRecords.id, id)).returning();
    return record;
  }

  async deleteAttendanceRecord(id: string): Promise<boolean> {
    const result = await db.delete(schema.attendanceRecords).where(eq(schema.attendanceRecords.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Shift methods
  async getShift(id: string): Promise<Shift | undefined> {
    const [shift] = await db.select().from(schema.shifts).where(eq(schema.shifts.id, id));
    return shift;
  }

  async getShiftsByCompany(companyId: string): Promise<Shift[]> {
    return await db.select().from(schema.shifts).where(eq(schema.shifts.companyId, companyId));
  }

  async createShift(insertShift: InsertShift): Promise<Shift> {
    const [shift] = await db.insert(schema.shifts).values(insertShift).returning();
    return shift;
  }

  async updateShift(id: string, updates: Partial<Shift>): Promise<Shift | undefined> {
    const [shift] = await db.update(schema.shifts).set(updates).where(eq(schema.shifts.id, id)).returning();
    return shift;
  }

  async deleteShift(id: string): Promise<boolean> {
    const result = await db.delete(schema.shifts).where(eq(schema.shifts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Holiday methods
  async getHoliday(id: string): Promise<Holiday | undefined> {
    const [holiday] = await db.select().from(schema.holidays).where(eq(schema.holidays.id, id));
    return holiday;
  }

  async getHolidaysByCompany(companyId: string): Promise<Holiday[]> {
    return await db.select().from(schema.holidays).where(eq(schema.holidays.companyId, companyId));
  }

  async createHoliday(insertHoliday: InsertHoliday): Promise<Holiday> {
    const [holiday] = await db.insert(schema.holidays).values(insertHoliday).returning();
    return holiday;
  }

  async updateHoliday(id: string, updates: Partial<Holiday>): Promise<Holiday | undefined> {
    const [holiday] = await db.update(schema.holidays).set(updates).where(eq(schema.holidays.id, id)).returning();
    return holiday;
  }

  async deleteHoliday(id: string): Promise<boolean> {
    const result = await db.delete(schema.holidays).where(eq(schema.holidays.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // LeaveType methods
  async getLeaveType(id: string): Promise<LeaveType | undefined> {
    const [leaveType] = await db.select().from(schema.leaveTypes).where(eq(schema.leaveTypes.id, id));
    return leaveType;
  }

  async getLeaveTypesByCompany(companyId: string): Promise<LeaveType[]> {
    return await db.select().from(schema.leaveTypes).where(eq(schema.leaveTypes.companyId, companyId));
  }

  async createLeaveType(insertLeaveType: InsertLeaveType): Promise<LeaveType> {
    const [leaveType] = await db.insert(schema.leaveTypes).values(insertLeaveType).returning();
    return leaveType;
  }

  async updateLeaveType(id: string, updates: Partial<LeaveType>): Promise<LeaveType | undefined> {
    const [leaveType] = await db.update(schema.leaveTypes).set(updates).where(eq(schema.leaveTypes.id, id)).returning();
    return leaveType;
  }

  async deleteLeaveType(id: string): Promise<boolean> {
    const result = await db.delete(schema.leaveTypes).where(eq(schema.leaveTypes.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ExpenseType methods
  async getExpenseType(id: string): Promise<ExpenseType | undefined> {
    const [expenseType] = await db.select().from(schema.expenseTypes).where(eq(schema.expenseTypes.id, id));
    return expenseType;
  }

  async getExpenseTypesByCompany(companyId: string): Promise<ExpenseType[]> {
    return await db.select().from(schema.expenseTypes).where(eq(schema.expenseTypes.companyId, companyId));
  }

  async createExpenseType(insertExpenseType: InsertExpenseType): Promise<ExpenseType> {
    const [expenseType] = await db.insert(schema.expenseTypes).values(insertExpenseType).returning();
    return expenseType;
  }

  async updateExpenseType(id: string, updates: Partial<ExpenseType>): Promise<ExpenseType | undefined> {
    const [expenseType] = await db.update(schema.expenseTypes).set(updates).where(eq(schema.expenseTypes.id, id)).returning();
    return expenseType;
  }

  async deleteExpenseType(id: string): Promise<boolean> {
    const result = await db.delete(schema.expenseTypes).where(eq(schema.expenseTypes.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // PayrollRecord methods
  async getPayrollRecord(id: string): Promise<PayrollRecord | undefined> {
    const [record] = await db.select().from(schema.payrollRecords).where(eq(schema.payrollRecords.id, id));
    return record;
  }

  async getPayrollRecordsByCompany(companyId: string): Promise<PayrollRecord[]> {
    return await db.select().from(schema.payrollRecords).where(eq(schema.payrollRecords.companyId, companyId));
  }

  async getPayrollRecordsByEmployee(employeeId: string): Promise<PayrollRecord[]> {
    return await db.select().from(schema.payrollRecords).where(eq(schema.payrollRecords.employeeId, employeeId));
  }

  async getPayrollRecordByEmployeeAndPeriod(employeeId: string, month: number, year: number): Promise<PayrollRecord | undefined> {
    const [record] = await db.select().from(schema.payrollRecords).where(
      and(
        eq(schema.payrollRecords.employeeId, employeeId),
        eq(schema.payrollRecords.month, month),
        eq(schema.payrollRecords.year, year)
      )
    );
    return record;
  }

  async createPayrollRecord(insertRecord: InsertPayrollRecord): Promise<PayrollRecord> {
    const [record] = await db.insert(schema.payrollRecords).values(insertRecord).returning();
    return record;
  }

  async updatePayrollRecord(id: string, updates: Partial<PayrollRecord>): Promise<PayrollRecord | undefined> {
    const [record] = await db.update(schema.payrollRecords).set(updates).where(eq(schema.payrollRecords.id, id)).returning();
    return record;
  }

  async deletePayrollRecord(id: string): Promise<boolean> {
    const result = await db.delete(schema.payrollRecords).where(eq(schema.payrollRecords.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // PayrollItem methods
  async getPayrollItem(id: string): Promise<PayrollItem | undefined> {
    const [item] = await db.select().from(schema.payrollItems).where(eq(schema.payrollItems.id, id));
    return item;
  }

  async getPayrollItemsByPayroll(payrollId: string): Promise<PayrollItem[]> {
    return await db.select().from(schema.payrollItems).where(eq(schema.payrollItems.payrollId, payrollId));
  }

  async createPayrollItem(insertItem: InsertPayrollItem): Promise<PayrollItem> {
    const [item] = await db.insert(schema.payrollItems).values(insertItem).returning();
    return item;
  }

  async updatePayrollItem(id: string, updates: Partial<PayrollItem>): Promise<PayrollItem | undefined> {
    const [item] = await db.update(schema.payrollItems).set(updates).where(eq(schema.payrollItems.id, id)).returning();
    return item;
  }

  async deletePayrollItem(id: string): Promise<boolean> {
    const result = await db.delete(schema.payrollItems).where(eq(schema.payrollItems.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ExpenseClaim methods
  async getExpenseClaim(id: string): Promise<ExpenseClaim | undefined> {
    const [claim] = await db.select().from(schema.expenseClaims).where(eq(schema.expenseClaims.id, id));
    return claim;
  }

  async getExpenseClaimsByCompany(companyId: string): Promise<ExpenseClaim[]> {
    return await db.select().from(schema.expenseClaims).where(eq(schema.expenseClaims.companyId, companyId));
  }

  async getExpenseClaimsByEmployee(employeeId: string): Promise<ExpenseClaim[]> {
    return await db.select().from(schema.expenseClaims).where(eq(schema.expenseClaims.employeeId, employeeId));
  }

  async getExpenseClaimsByManager(managerId: string): Promise<ExpenseClaim[]> {
    return await db.select().from(schema.expenseClaims).where(eq(schema.expenseClaims.managerReviewedBy, managerId));
  }

  async createExpenseClaim(insertClaim: InsertExpenseClaim): Promise<ExpenseClaim> {
    const [claim] = await db.insert(schema.expenseClaims).values(insertClaim).returning();
    return claim;
  }

  async updateExpenseClaim(id: string, updates: Partial<ExpenseClaim>): Promise<ExpenseClaim | undefined> {
    const [claim] = await db.update(schema.expenseClaims).set(updates).where(eq(schema.expenseClaims.id, id)).returning();
    return claim;
  }

  async deleteExpenseClaim(id: string): Promise<boolean> {
    const result = await db.delete(schema.expenseClaims).where(eq(schema.expenseClaims.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // ExpenseClaimItem methods
  async getExpenseClaimItem(id: string): Promise<ExpenseClaimItem | undefined> {
    const [item] = await db.select().from(schema.expenseClaimItems).where(eq(schema.expenseClaimItems.id, id));
    return item;
  }

  async getExpenseClaimItemsByClaim(claimId: string): Promise<ExpenseClaimItem[]> {
    return await db.select().from(schema.expenseClaimItems).where(eq(schema.expenseClaimItems.claimId, claimId));
  }

  async createExpenseClaimItem(insertItem: InsertExpenseClaimItem): Promise<ExpenseClaimItem> {
    const [item] = await db.insert(schema.expenseClaimItems).values(insertItem).returning();
    return item;
  }

  async updateExpenseClaimItem(id: string, updates: Partial<ExpenseClaimItem>): Promise<ExpenseClaimItem | undefined> {
    const [item] = await db.update(schema.expenseClaimItems).set(updates).where(eq(schema.expenseClaimItems.id, id)).returning();
    return item;
  }

  async deleteExpenseClaimItem(id: string): Promise<boolean> {
    const result = await db.delete(schema.expenseClaimItems).where(eq(schema.expenseClaimItems.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Workflow methods
  async getWorkflow(id: string): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(schema.workflows).where(eq(schema.workflows.id, id));
    return workflow;
  }

  async getWorkflowsByCompany(companyId: string): Promise<Workflow[]> {
    return await db.select().from(schema.workflows).where(eq(schema.workflows.companyId, companyId));
  }

  async getWorkflowsByEmployee(employeeId: string): Promise<Workflow[]> {
    return await db.select().from(schema.workflows).where(eq(schema.workflows.assignedTo, employeeId));
  }

  async getWorkflowsByAssigner(assignerId: string): Promise<Workflow[]> {
    return await db.select().from(schema.workflows).where(eq(schema.workflows.assignedBy, assignerId));
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const [workflow] = await db.insert(schema.workflows).values(insertWorkflow).returning();
    return workflow;
  }

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow | undefined> {
    const [workflow] = await db.update(schema.workflows).set(updates).where(eq(schema.workflows.id, id)).returning();
    return workflow;
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    const result = await db.delete(schema.workflows).where(eq(schema.workflows.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Notice methods
  async getNotice(id: string): Promise<Notice | undefined> {
    const [notice] = await db.select().from(schema.notices).where(eq(schema.notices.id, id));
    return notice;
  }

  async getNoticesByCompany(companyId: string): Promise<Notice[]> {
    return await db.select().from(schema.notices).where(eq(schema.notices.companyId, companyId)).orderBy(desc(schema.notices.pinned), desc(schema.notices.createdAt));
  }

  async createNotice(insertNotice: InsertNotice): Promise<Notice> {
    const [notice] = await db.insert(schema.notices).values(insertNotice).returning();
    return notice;
  }

  async updateNotice(id: string, updates: Partial<Notice>): Promise<Notice | undefined> {
    const [notice] = await db.update(schema.notices).set(updates).where(eq(schema.notices.id, id)).returning();
    return notice;
  }

  async deleteNotice(id: string): Promise<boolean> {
    const result = await db.delete(schema.notices).where(eq(schema.notices.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Leave Request methods
  async getLeaveRequest(id: string): Promise<LeaveRequest | undefined> {
    const [request] = await db.select().from(schema.leaveRequests).where(eq(schema.leaveRequests.id, id));
    return request;
  }

  async getLeaveRequestsByCompany(companyId: string): Promise<LeaveRequest[]> {
    return await db.select().from(schema.leaveRequests).where(eq(schema.leaveRequests.companyId, companyId)).orderBy(desc(schema.leaveRequests.appliedOn));
  }

  async getLeaveRequestsByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    return await db.select().from(schema.leaveRequests).where(eq(schema.leaveRequests.employeeId, employeeId)).orderBy(desc(schema.leaveRequests.appliedOn));
  }

  async createLeaveRequest(insertLeaveRequest: InsertLeaveRequest): Promise<LeaveRequest> {
    const [request] = await db.insert(schema.leaveRequests).values(insertLeaveRequest).returning();
    return request;
  }

  async updateLeaveRequest(id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest | undefined> {
    const [request] = await db.update(schema.leaveRequests).set(updates).where(eq(schema.leaveRequests.id, id)).returning();
    return request;
  }

  async deleteLeaveRequest(id: string): Promise<boolean> {
    const result = await db.delete(schema.leaveRequests).where(eq(schema.leaveRequests.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Leave Balance methods
  async getLeaveBalance(id: string): Promise<LeaveBalance | undefined> {
    const [balance] = await db.select().from(schema.leaveBalances).where(eq(schema.leaveBalances.id, id));
    return balance;
  }

  async getLeaveBalancesByEmployee(employeeId: string, year: number): Promise<LeaveBalance[]> {
    return await db.select().from(schema.leaveBalances).where(and(eq(schema.leaveBalances.employeeId, employeeId), eq(schema.leaveBalances.year, year)));
  }

  async getLeaveBalancesByCompany(companyId: string, year: number): Promise<LeaveBalance[]> {
    return await db.select().from(schema.leaveBalances).where(and(eq(schema.leaveBalances.companyId, companyId), eq(schema.leaveBalances.year, year)));
  }

  async createLeaveBalance(insertLeaveBalance: InsertLeaveBalance): Promise<LeaveBalance> {
    const [balance] = await db.insert(schema.leaveBalances).values(insertLeaveBalance).returning();
    return balance;
  }

  async updateLeaveBalance(id: string, updates: Partial<LeaveBalance>): Promise<LeaveBalance | undefined> {
    const [balance] = await db.update(schema.leaveBalances).set(updates).where(eq(schema.leaveBalances.id, id)).returning();
    return balance;
  }

  async deleteLeaveBalance(id: string): Promise<boolean> {
    const result = await db.delete(schema.leaveBalances).where(eq(schema.leaveBalances.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Support Ticket methods
  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(schema.supportTickets).where(eq(schema.supportTickets.id, id));
    return ticket;
  }

  async getSupportTicketsByCompany(companyId: string): Promise<SupportTicket[]> {
    return await db.select().from(schema.supportTickets).where(eq(schema.supportTickets.companyId, companyId)).orderBy(desc(schema.supportTickets.createdAt));
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return await db.select().from(schema.supportTickets).orderBy(desc(schema.supportTickets.createdAt));
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const [ticket] = await db.insert(schema.supportTickets).values(insertTicket).returning();
    return ticket;
  }

  async updateSupportTicket(id: string, updates: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [ticket] = await db.update(schema.supportTickets).set({ ...updates, updatedAt: new Date() }).where(eq(schema.supportTickets.id, id)).returning();
    return ticket;
  }

  async deleteSupportTicket(id: string): Promise<boolean> {
    const result = await db.delete(schema.supportTickets).where(eq(schema.supportTickets.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Audit Log methods
  async getAuditLog(id: string): Promise<AuditLog | undefined> {
    const [log] = await db.select().from(schema.auditLogs).where(eq(schema.auditLogs.id, id));
    return log;
  }

  async getAllAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return await db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.createdAt)).limit(limit);
  }

  async getAuditLogsByCompany(companyId: string, limit: number = 100): Promise<AuditLog[]> {
    return await db.select().from(schema.auditLogs).where(eq(schema.auditLogs.companyId, companyId)).orderBy(desc(schema.auditLogs.createdAt)).limit(limit);
  }

  async getAuditLogsByUser(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return await db.select().from(schema.auditLogs).where(eq(schema.auditLogs.userId, userId)).orderBy(desc(schema.auditLogs.createdAt)).limit(limit);
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(schema.auditLogs).values(insertLog).returning();
    return log;
  }
}
