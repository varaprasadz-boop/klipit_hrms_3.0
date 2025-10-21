import { 
  type User, type InsertUser, type Company, type InsertCompany, UserRole,
  type Department, type InsertDepartment,
  type Designation, type InsertDesignation,
  type RoleLevel, type InsertRoleLevel,
  type CtcComponent, type InsertCtcComponent,
  type Employee, type InsertEmployee,
  type AttendanceRecord, type InsertAttendanceRecord,
  type Shift, type InsertShift,
  type Holiday, type InsertHoliday,
  type LeaveType, type InsertLeaveType,
  type ExpenseType, type InsertExpenseType,
  type PayrollRecord, type InsertPayrollRecord,
  type PayrollItem, type InsertPayrollItem
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByCompany(companyId: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Companies
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByEmail(email: string): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, updates: Partial<Company>): Promise<Company | undefined>;

  // Departments
  getDepartment(id: string): Promise<Department | undefined>;
  getDepartmentsByCompany(companyId: string): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined>;
  deleteDepartment(id: string): Promise<boolean>;

  // Designations
  getDesignation(id: string): Promise<Designation | undefined>;
  getDesignationsByCompany(companyId: string): Promise<Designation[]>;
  createDesignation(designation: InsertDesignation): Promise<Designation>;
  updateDesignation(id: string, updates: Partial<Designation>): Promise<Designation | undefined>;
  deleteDesignation(id: string): Promise<boolean>;

  // Roles & Levels
  getRoleLevel(id: string): Promise<RoleLevel | undefined>;
  getRoleLevelsByCompany(companyId: string): Promise<RoleLevel[]>;
  createRoleLevel(roleLevel: InsertRoleLevel): Promise<RoleLevel>;
  updateRoleLevel(id: string, updates: Partial<RoleLevel>): Promise<RoleLevel | undefined>;
  deleteRoleLevel(id: string): Promise<boolean>;

  // CTC Components
  getCtcComponent(id: string): Promise<CtcComponent | undefined>;
  getCtcComponentsByCompany(companyId: string): Promise<CtcComponent[]>;
  createCtcComponent(component: InsertCtcComponent): Promise<CtcComponent>;
  updateCtcComponent(id: string, updates: Partial<CtcComponent>): Promise<CtcComponent | undefined>;
  deleteCtcComponent(id: string): Promise<boolean>;

  // Employees
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeesByCompany(companyId: string): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;

  // Attendance Records
  getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined>;
  getAttendanceRecordsByCompany(companyId: string): Promise<AttendanceRecord[]>;
  getAttendanceRecordsByEmployee(employeeId: string): Promise<AttendanceRecord[]>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined>;
  deleteAttendanceRecord(id: string): Promise<boolean>;

  // Shifts
  getShift(id: string): Promise<Shift | undefined>;
  getShiftsByCompany(companyId: string): Promise<Shift[]>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: string, updates: Partial<Shift>): Promise<Shift | undefined>;
  deleteShift(id: string): Promise<boolean>;

  // Holidays
  getHoliday(id: string): Promise<Holiday | undefined>;
  getHolidaysByCompany(companyId: string): Promise<Holiday[]>;
  createHoliday(holiday: InsertHoliday): Promise<Holiday>;
  updateHoliday(id: string, updates: Partial<Holiday>): Promise<Holiday | undefined>;
  deleteHoliday(id: string): Promise<boolean>;

  // Leave Types
  getLeaveType(id: string): Promise<LeaveType | undefined>;
  getLeaveTypesByCompany(companyId: string): Promise<LeaveType[]>;
  createLeaveType(leaveType: InsertLeaveType): Promise<LeaveType>;
  updateLeaveType(id: string, updates: Partial<LeaveType>): Promise<LeaveType | undefined>;
  deleteLeaveType(id: string): Promise<boolean>;

  // Expense Types
  getExpenseType(id: string): Promise<ExpenseType | undefined>;
  getExpenseTypesByCompany(companyId: string): Promise<ExpenseType[]>;
  createExpenseType(expenseType: InsertExpenseType): Promise<ExpenseType>;
  updateExpenseType(id: string, updates: Partial<ExpenseType>): Promise<ExpenseType | undefined>;
  deleteExpenseType(id: string): Promise<boolean>;

  // Payroll Records
  getPayrollRecord(id: string): Promise<PayrollRecord | undefined>;
  getPayrollRecordsByCompany(companyId: string): Promise<PayrollRecord[]>;
  getPayrollRecordsByEmployee(employeeId: string): Promise<PayrollRecord[]>;
  getPayrollRecordByEmployeeAndPeriod(employeeId: string, month: number, year: number): Promise<PayrollRecord | undefined>;
  createPayrollRecord(record: InsertPayrollRecord): Promise<PayrollRecord>;
  updatePayrollRecord(id: string, updates: Partial<PayrollRecord>): Promise<PayrollRecord | undefined>;
  deletePayrollRecord(id: string): Promise<boolean>;

  // Payroll Items
  getPayrollItem(id: string): Promise<PayrollItem | undefined>;
  getPayrollItemsByPayroll(payrollId: string): Promise<PayrollItem[]>;
  createPayrollItem(item: InsertPayrollItem): Promise<PayrollItem>;
  updatePayrollItem(id: string, updates: Partial<PayrollItem>): Promise<PayrollItem | undefined>;
  deletePayrollItem(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private companies: Map<string, Company>;
  private departments: Map<string, Department>;
  private designations: Map<string, Designation>;
  private rolesLevels: Map<string, RoleLevel>;
  private ctcComponents: Map<string, CtcComponent>;
  private employees: Map<string, Employee>;
  private attendanceRecords: Map<string, AttendanceRecord>;
  private shifts: Map<string, Shift>;
  private holidays: Map<string, Holiday>;
  private leaveTypes: Map<string, LeaveType>;
  private expenseTypes: Map<string, ExpenseType>;
  private payrollRecords: Map<string, PayrollRecord>;
  private payrollItems: Map<string, PayrollItem>;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.departments = new Map();
    this.designations = new Map();
    this.rolesLevels = new Map();
    this.ctcComponents = new Map();
    this.employees = new Map();
    this.attendanceRecords = new Map();
    this.payrollRecords = new Map();
    this.payrollItems = new Map();
    this.shifts = new Map();
    this.holidays = new Map();
    this.leaveTypes = new Map();
    this.expenseTypes = new Map();
    this.seedSuperAdmin();
    this.seedDemoData();
  }

  private seedSuperAdmin() {
    const superAdminId = randomUUID();
    const superAdmin: User = {
      id: superAdminId,
      email: "superadmin@hrmsworld.com",
      password: "123456",
      name: "Super Administrator",
      role: UserRole.SUPER_ADMIN,
      companyId: null,
      department: null,
      position: "System Administrator",
      status: "active",
      createdAt: new Date(),
    };
    this.users.set(superAdminId, superAdmin);
  }

  private seedDemoData() {
    const company1Id = randomUUID();
    const company1: Company = {
      id: company1Id,
      name: "Tech Solutions Inc",
      email: "admin@techsolutions.com",
      status: "active",
      plan: "premium",
      maxEmployees: "100",
      createdAt: new Date(),
    };
    this.companies.set(company1Id, company1);

    const admin1Id = randomUUID();
    const admin1: User = {
      id: admin1Id,
      email: "admin@techsolutions.com",
      password: "123456",
      name: "John Admin",
      role: UserRole.COMPANY_ADMIN,
      companyId: company1Id,
      department: "Management",
      position: "HR Manager",
      status: "active",
      createdAt: new Date(),
    };
    this.users.set(admin1Id, admin1);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async getUsersByCompany(companyId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter((user) => user.companyId === companyId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      id,
      status: insertUser.status || "active",
      companyId: insertUser.companyId || null,
      department: insertUser.department || null,
      position: insertUser.position || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  // Company methods
  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getCompanyByEmail(email: string): Promise<Company | undefined> {
    return Array.from(this.companies.values()).find((company) => company.email === email);
  }

  async getAllCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = randomUUID();
    const company: Company = { 
      ...insertCompany,
      id,
      status: insertCompany.status || "active",
      plan: insertCompany.plan || "basic",
      maxEmployees: insertCompany.maxEmployees || "50",
      createdAt: new Date(),
    };
    this.companies.set(id, company);
    return company;
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    const updated = { ...company, ...updates };
    this.companies.set(id, updated);
    return updated;
  }

  // Department methods
  async getDepartment(id: string): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async getDepartmentsByCompany(companyId: string): Promise<Department[]> {
    return Array.from(this.departments.values()).filter((dept) => dept.companyId === companyId);
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const id = randomUUID();
    const department: Department = { 
      ...insertDepartment,
      id,
      description: insertDepartment.description || null,
      createdAt: new Date(),
    };
    this.departments.set(id, department);
    return department;
  }

  async updateDepartment(id: string, updates: Partial<Department>): Promise<Department | undefined> {
    const department = this.departments.get(id);
    if (!department) return undefined;
    const updated = { ...department, ...updates };
    this.departments.set(id, updated);
    return updated;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    return this.departments.delete(id);
  }

  // Designation methods
  async getDesignation(id: string): Promise<Designation | undefined> {
    return this.designations.get(id);
  }

  async getDesignationsByCompany(companyId: string): Promise<Designation[]> {
    return Array.from(this.designations.values()).filter((desig) => desig.companyId === companyId);
  }

  async createDesignation(insertDesignation: InsertDesignation): Promise<Designation> {
    const id = randomUUID();
    const designation: Designation = { 
      ...insertDesignation,
      id,
      description: insertDesignation.description || null,
      createdAt: new Date(),
    };
    this.designations.set(id, designation);
    return designation;
  }

  async updateDesignation(id: string, updates: Partial<Designation>): Promise<Designation | undefined> {
    const designation = this.designations.get(id);
    if (!designation) return undefined;
    const updated = { ...designation, ...updates };
    this.designations.set(id, updated);
    return updated;
  }

  async deleteDesignation(id: string): Promise<boolean> {
    return this.designations.delete(id);
  }

  // RoleLevel methods
  async getRoleLevel(id: string): Promise<RoleLevel | undefined> {
    return this.rolesLevels.get(id);
  }

  async getRoleLevelsByCompany(companyId: string): Promise<RoleLevel[]> {
    return Array.from(this.rolesLevels.values()).filter((rl) => rl.companyId === companyId);
  }

  async createRoleLevel(insertRoleLevel: InsertRoleLevel): Promise<RoleLevel> {
    const id = randomUUID();
    const roleLevel: RoleLevel = { 
      ...insertRoleLevel,
      id,
      createdAt: new Date(),
    };
    this.rolesLevels.set(id, roleLevel);
    return roleLevel;
  }

  async updateRoleLevel(id: string, updates: Partial<RoleLevel>): Promise<RoleLevel | undefined> {
    const roleLevel = this.rolesLevels.get(id);
    if (!roleLevel) return undefined;
    const updated = { ...roleLevel, ...updates };
    this.rolesLevels.set(id, updated);
    return updated;
  }

  async deleteRoleLevel(id: string): Promise<boolean> {
    return this.rolesLevels.delete(id);
  }

  // CTC Component methods
  async getCtcComponent(id: string): Promise<CtcComponent | undefined> {
    return this.ctcComponents.get(id);
  }

  async getCtcComponentsByCompany(companyId: string): Promise<CtcComponent[]> {
    return Array.from(this.ctcComponents.values()).filter((comp) => comp.companyId === companyId);
  }

  async createCtcComponent(insertComponent: InsertCtcComponent): Promise<CtcComponent> {
    const id = randomUUID();
    const component: CtcComponent = { 
      ...insertComponent,
      id,
      isStandard: insertComponent.isStandard || false,
      createdAt: new Date(),
    };
    this.ctcComponents.set(id, component);
    return component;
  }

  async updateCtcComponent(id: string, updates: Partial<CtcComponent>): Promise<CtcComponent | undefined> {
    const component = this.ctcComponents.get(id);
    if (!component) return undefined;
    const updated = { ...component, ...updates };
    this.ctcComponents.set(id, updated);
    return updated;
  }

  async deleteCtcComponent(id: string): Promise<boolean> {
    return this.ctcComponents.delete(id);
  }

  // Employee methods
  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeesByCompany(companyId: string): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter((emp) => emp.companyId === companyId);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = { 
      ...insertEmployee,
      id,
      status: insertEmployee.status || "active",
      departmentId: insertEmployee.departmentId || null,
      designationId: insertEmployee.designationId || null,
      roleLevelId: insertEmployee.roleLevelId || null,
      exitDate: insertEmployee.exitDate || null,
      attendanceType: insertEmployee.attendanceType || "regular",
      education: insertEmployee.education || [],
      experience: insertEmployee.experience || [],
      documents: insertEmployee.documents || [],
      ctc: insertEmployee.ctc || [],
      assets: insertEmployee.assets || [],
      bank: insertEmployee.bank || null,
      insurance: insertEmployee.insurance || null,
      statutory: insertEmployee.statutory || null,
      createdAt: new Date(),
    };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    const updated = { ...employee, ...updates };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    return this.employees.delete(id);
  }

  // AttendanceRecord methods
  async getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined> {
    return this.attendanceRecords.get(id);
  }

  async getAttendanceRecordsByCompany(companyId: string): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values()).filter((record) => record.companyId === companyId);
  }

  async getAttendanceRecordsByEmployee(employeeId: string): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values()).filter((record) => record.employeeId === employeeId);
  }

  async createAttendanceRecord(insertRecord: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const id = randomUUID();
    const record: AttendanceRecord = { 
      ...insertRecord,
      id,
      status: insertRecord.status || "pending",
      checkIn: insertRecord.checkIn || null,
      checkOut: insertRecord.checkOut || null,
      shiftId: insertRecord.shiftId || null,
      duration: insertRecord.duration || null,
      location: insertRecord.location || null,
      notes: insertRecord.notes || null,
      createdAt: new Date(),
    };
    this.attendanceRecords.set(id, record);
    return record;
  }

  async updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined> {
    const record = this.attendanceRecords.get(id);
    if (!record) return undefined;
    const updated = { ...record, ...updates };
    this.attendanceRecords.set(id, updated);
    return updated;
  }

  async deleteAttendanceRecord(id: string): Promise<boolean> {
    return this.attendanceRecords.delete(id);
  }

  // Shift methods
  async getShift(id: string): Promise<Shift | undefined> {
    return this.shifts.get(id);
  }

  async getShiftsByCompany(companyId: string): Promise<Shift[]> {
    return Array.from(this.shifts.values()).filter((shift) => shift.companyId === companyId);
  }

  async createShift(insertShift: InsertShift): Promise<Shift> {
    const id = randomUUID();
    const shift: Shift = { 
      ...insertShift,
      id,
      weeklyOffs: insertShift.weeklyOffs || [],
      createdAt: new Date(),
    };
    this.shifts.set(id, shift);
    return shift;
  }

  async updateShift(id: string, updates: Partial<Shift>): Promise<Shift | undefined> {
    const shift = this.shifts.get(id);
    if (!shift) return undefined;
    const updated = { ...shift, ...updates };
    this.shifts.set(id, updated);
    return updated;
  }

  async deleteShift(id: string): Promise<boolean> {
    return this.shifts.delete(id);
  }

  // Holiday methods
  async getHoliday(id: string): Promise<Holiday | undefined> {
    return this.holidays.get(id);
  }

  async getHolidaysByCompany(companyId: string): Promise<Holiday[]> {
    return Array.from(this.holidays.values()).filter((holiday) => holiday.companyId === companyId);
  }

  async createHoliday(insertHoliday: InsertHoliday): Promise<Holiday> {
    const id = randomUUID();
    const holiday: Holiday = { 
      ...insertHoliday,
      id,
      description: insertHoliday.description || null,
      departmentIds: insertHoliday.departmentIds || null,
      createdAt: new Date(),
    };
    this.holidays.set(id, holiday);
    return holiday;
  }

  async updateHoliday(id: string, updates: Partial<Holiday>): Promise<Holiday | undefined> {
    const holiday = this.holidays.get(id);
    if (!holiday) return undefined;
    const updated = { ...holiday, ...updates };
    this.holidays.set(id, updated);
    return updated;
  }

  async deleteHoliday(id: string): Promise<boolean> {
    return this.holidays.delete(id);
  }

  // LeaveType methods
  async getLeaveType(id: string): Promise<LeaveType | undefined> {
    return this.leaveTypes.get(id);
  }

  async getLeaveTypesByCompany(companyId: string): Promise<LeaveType[]> {
    return Array.from(this.leaveTypes.values()).filter((lt) => lt.companyId === companyId);
  }

  async createLeaveType(insertLeaveType: InsertLeaveType): Promise<LeaveType> {
    const id = randomUUID();
    const leaveType: LeaveType = { 
      ...insertLeaveType,
      id,
      maxDays: insertLeaveType.maxDays || null,
      carryForward: insertLeaveType.carryForward || false,
      createdAt: new Date(),
    };
    this.leaveTypes.set(id, leaveType);
    return leaveType;
  }

  async updateLeaveType(id: string, updates: Partial<LeaveType>): Promise<LeaveType | undefined> {
    const leaveType = this.leaveTypes.get(id);
    if (!leaveType) return undefined;
    const updated = { ...leaveType, ...updates };
    this.leaveTypes.set(id, updated);
    return updated;
  }

  async deleteLeaveType(id: string): Promise<boolean> {
    return this.leaveTypes.delete(id);
  }

  // ExpenseType methods
  async getExpenseType(id: string): Promise<ExpenseType | undefined> {
    return this.expenseTypes.get(id);
  }

  async getExpenseTypesByCompany(companyId: string): Promise<ExpenseType[]> {
    return Array.from(this.expenseTypes.values()).filter((et) => et.companyId === companyId);
  }

  async createExpenseType(insertExpenseType: InsertExpenseType): Promise<ExpenseType> {
    const id = randomUUID();
    const expenseType: ExpenseType = { 
      ...insertExpenseType,
      id,
      requiresReceipt: insertExpenseType.requiresReceipt || false,
      createdAt: new Date(),
    };
    this.expenseTypes.set(id, expenseType);
    return expenseType;
  }

  async updateExpenseType(id: string, updates: Partial<ExpenseType>): Promise<ExpenseType | undefined> {
    const expenseType = this.expenseTypes.get(id);
    if (!expenseType) return undefined;
    const updated = { ...expenseType, ...updates };
    this.expenseTypes.set(id, updated);
    return updated;
  }

  async deleteExpenseType(id: string): Promise<boolean> {
    return this.expenseTypes.delete(id);
  }

  // PayrollRecord methods
  async getPayrollRecord(id: string): Promise<PayrollRecord | undefined> {
    return this.payrollRecords.get(id);
  }

  async getPayrollRecordsByCompany(companyId: string): Promise<PayrollRecord[]> {
    return Array.from(this.payrollRecords.values()).filter((pr) => pr.companyId === companyId);
  }

  async getPayrollRecordsByEmployee(employeeId: string): Promise<PayrollRecord[]> {
    return Array.from(this.payrollRecords.values()).filter((pr) => pr.employeeId === employeeId);
  }

  async getPayrollRecordByEmployeeAndPeriod(
    employeeId: string, 
    month: number, 
    year: number
  ): Promise<PayrollRecord | undefined> {
    return Array.from(this.payrollRecords.values()).find(
      (pr) => pr.employeeId === employeeId && pr.month === month && pr.year === year
    );
  }

  async createPayrollRecord(insertPayrollRecord: InsertPayrollRecord): Promise<PayrollRecord> {
    const id = randomUUID();
    const payrollRecord: PayrollRecord = { 
      ...insertPayrollRecord,
      id,
      approvedBy: insertPayrollRecord.approvedBy || null,
      approvedAt: insertPayrollRecord.approvedAt || null,
      rejectionReason: insertPayrollRecord.rejectionReason || null,
      payslipPublished: insertPayrollRecord.payslipPublished || false,
      payslipPublishedAt: insertPayrollRecord.payslipPublishedAt || null,
      paidLeaveDays: insertPayrollRecord.paidLeaveDays || 0,
      overtimeHours: insertPayrollRecord.overtimeHours || 0,
      createdAt: new Date(),
    };
    this.payrollRecords.set(id, payrollRecord);
    return payrollRecord;
  }

  async updatePayrollRecord(id: string, updates: Partial<PayrollRecord>): Promise<PayrollRecord | undefined> {
    const payrollRecord = this.payrollRecords.get(id);
    if (!payrollRecord) return undefined;
    const updated = { ...payrollRecord, ...updates };
    this.payrollRecords.set(id, updated);
    return updated;
  }

  async deletePayrollRecord(id: string): Promise<boolean> {
    return this.payrollRecords.delete(id);
  }

  // PayrollItem methods
  async getPayrollItem(id: string): Promise<PayrollItem | undefined> {
    return this.payrollItems.get(id);
  }

  async getPayrollItemsByPayroll(payrollId: string): Promise<PayrollItem[]> {
    return Array.from(this.payrollItems.values()).filter((pi) => pi.payrollId === payrollId);
  }

  async createPayrollItem(insertPayrollItem: InsertPayrollItem): Promise<PayrollItem> {
    const id = randomUUID();
    const payrollItem: PayrollItem = { 
      ...insertPayrollItem,
      id,
      ctcComponentId: insertPayrollItem.ctcComponentId || null,
      description: insertPayrollItem.description || null,
      createdAt: new Date(),
    };
    this.payrollItems.set(id, payrollItem);
    return payrollItem;
  }

  async updatePayrollItem(id: string, updates: Partial<PayrollItem>): Promise<PayrollItem | undefined> {
    const payrollItem = this.payrollItems.get(id);
    if (!payrollItem) return undefined;
    const updated = { ...payrollItem, ...updates };
    this.payrollItems.set(id, updated);
    return updated;
  }

  async deletePayrollItem(id: string): Promise<boolean> {
    return this.payrollItems.delete(id);
  }
}

export const storage = new MemStorage();
