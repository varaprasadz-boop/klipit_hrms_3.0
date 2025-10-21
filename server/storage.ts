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
  type PayrollItem, type InsertPayrollItem,
  type ExpenseClaim, type InsertExpenseClaim,
  type ExpenseClaimItem, type InsertExpenseClaimItem,
  type Workflow, type InsertWorkflow
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

  // Expense Claims
  getExpenseClaim(id: string): Promise<ExpenseClaim | undefined>;
  getExpenseClaimsByCompany(companyId: string): Promise<ExpenseClaim[]>;
  getExpenseClaimsByEmployee(employeeId: string): Promise<ExpenseClaim[]>;
  getExpenseClaimsByManager(managerId: string): Promise<ExpenseClaim[]>;
  createExpenseClaim(claim: InsertExpenseClaim): Promise<ExpenseClaim>;
  updateExpenseClaim(id: string, updates: Partial<ExpenseClaim>): Promise<ExpenseClaim | undefined>;
  deleteExpenseClaim(id: string): Promise<boolean>;

  // Expense Claim Items
  getExpenseClaimItem(id: string): Promise<ExpenseClaimItem | undefined>;
  getExpenseClaimItemsByClaim(claimId: string): Promise<ExpenseClaimItem[]>;
  createExpenseClaimItem(item: InsertExpenseClaimItem): Promise<ExpenseClaimItem>;
  updateExpenseClaimItem(id: string, updates: Partial<ExpenseClaimItem>): Promise<ExpenseClaimItem | undefined>;
  deleteExpenseClaimItem(id: string): Promise<boolean>;

  // Workflows
  getWorkflow(id: string): Promise<Workflow | undefined>;
  getWorkflowsByCompany(companyId: string): Promise<Workflow[]>;
  getWorkflowsByEmployee(employeeId: string): Promise<Workflow[]>;
  getWorkflowsByAssigner(assignerId: string): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: string): Promise<boolean>;
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
  private expenseClaims: Map<string, ExpenseClaim>;
  private expenseClaimItems: Map<string, ExpenseClaimItem>;
  private workflows: Map<string, Workflow>;

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
    this.expenseClaims = new Map();
    this.expenseClaimItems = new Map();
    this.workflows = new Map();
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

    // Create Employee User Accounts
    const user1Id = randomUUID();
    const user1: User = {
      id: user1Id,
      email: "sarah.johnson@techsolutions.com",
      password: "123456",
      name: "Sarah Johnson",
      role: UserRole.EMPLOYEE,
      companyId: company1Id,
      department: "Engineering",
      position: "Senior Engineer",
      status: "active",
      createdAt: new Date(),
    };
    this.users.set(user1Id, user1);

    const user2Id = randomUUID();
    const user2: User = {
      id: user2Id,
      email: "michael.chen@techsolutions.com",
      password: "123456",
      name: "Michael Chen",
      role: UserRole.EMPLOYEE,
      companyId: company1Id,
      department: "Engineering",
      position: "Engineer",
      status: "active",
      createdAt: new Date(),
    };
    this.users.set(user2Id, user2);

    const user3Id = randomUUID();
    const user3: User = {
      id: user3Id,
      email: "emily.rodriguez@techsolutions.com",
      password: "123456",
      name: "Emily Rodriguez",
      role: UserRole.EMPLOYEE,
      companyId: company1Id,
      department: "Sales",
      position: "Sales Manager",
      status: "active",
      createdAt: new Date(),
    };
    this.users.set(user3Id, user3);

    const user4Id = randomUUID();
    const user4: User = {
      id: user4Id,
      email: "david.kumar@techsolutions.com",
      password: "123456",
      name: "David Kumar",
      role: UserRole.EMPLOYEE,
      companyId: company1Id,
      department: "Human Resources",
      position: "HR Coordinator",
      status: "active",
      createdAt: new Date(),
    };
    this.users.set(user4Id, user4);

    // Create Departments
    const deptEngId = randomUUID();
    const deptEng: Department = {
      id: deptEngId,
      companyId: company1Id,
      name: "Engineering",
      description: "Software Development Team",
      createdAt: new Date(),
    };
    this.departments.set(deptEngId, deptEng);

    const deptHRId = randomUUID();
    const deptHR: Department = {
      id: deptHRId,
      companyId: company1Id,
      name: "Human Resources",
      description: "HR Department",
      createdAt: new Date(),
    };
    this.departments.set(deptHRId, deptHR);

    const deptSalesId = randomUUID();
    const deptSales: Department = {
      id: deptSalesId,
      companyId: company1Id,
      name: "Sales",
      description: "Sales and Marketing",
      createdAt: new Date(),
    };
    this.departments.set(deptSalesId, deptSales);

    // Create role levels for expense management
    const roleJrMgrId = randomUUID();
    const roleJrMgr: RoleLevel = {
      id: roleJrMgrId,
      companyId: company1Id,
      role: "Manager",
      level: "Junior",
      createdAt: new Date(),
    };
    this.rolesLevels.set(roleJrMgrId, roleJrMgr);

    const roleSrMgrId = randomUUID();
    const roleSrMgr: RoleLevel = {
      id: roleSrMgrId,
      companyId: company1Id,
      role: "Manager",
      level: "Senior",
      createdAt: new Date(),
    };
    this.rolesLevels.set(roleSrMgrId, roleSrMgr);

    const roleTopMgmtId = randomUUID();
    const roleTopMgmt: RoleLevel = {
      id: roleTopMgmtId,
      companyId: company1Id,
      role: "Leadership",
      level: "Top Management",
      createdAt: new Date(),
    };
    this.rolesLevels.set(roleTopMgmtId, roleTopMgmt);

    // Create Demo Employees with CTC and reporting structure
    const emp1Id = randomUUID();
    const emp1: Employee = {
      id: emp1Id,
      companyId: company1Id,
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@techsolutions.com",
      phone: "+1-555-0101",
      departmentId: deptEngId,
      designationId: null,
      roleLevelId: roleSrMgrId,
      reportingManagerId: null,
      status: "active",
      joinDate: "2022-01-15",
      exitDate: null,
      attendanceType: "regular",
      education: [],
      experience: [],
      documents: [],
      ctc: [
        { component: "Basic Salary", amount: 50000, frequency: "monthly", type: "payable" },
        { component: "HRA", amount: 20000, frequency: "monthly", type: "payable" },
        { component: "Transport Allowance", amount: 5000, frequency: "monthly", type: "payable" },
        { component: "Provident Fund", amount: 6000, frequency: "monthly", type: "deductable" },
        { component: "Professional Tax", amount: 200, frequency: "monthly", type: "deductable" },
      ],
      assets: [],
      bank: null,
      insurance: null,
      statutory: null,
      createdAt: new Date(),
    };
    this.employees.set(emp1Id, emp1);

    const emp2Id = randomUUID();
    const emp2: Employee = {
      id: emp2Id,
      companyId: company1Id,
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@techsolutions.com",
      phone: "+1-555-0102",
      departmentId: deptEngId,
      designationId: null,
      roleLevelId: roleJrMgrId,
      reportingManagerId: emp1Id,
      status: "active",
      joinDate: "2021-06-01",
      exitDate: null,
      attendanceType: "regular",
      education: [],
      experience: [],
      documents: [],
      ctc: [
        { component: "Basic Salary", amount: 40000, frequency: "monthly", type: "payable" },
        { component: "HRA", amount: 16000, frequency: "monthly", type: "payable" },
        { component: "Transport Allowance", amount: 4000, frequency: "monthly", type: "payable" },
        { component: "Provident Fund", amount: 4800, frequency: "monthly", type: "deductable" },
        { component: "Professional Tax", amount: 200, frequency: "monthly", type: "deductable" },
      ],
      assets: [],
      bank: null,
      insurance: null,
      statutory: null,
      createdAt: new Date(),
    };
    this.employees.set(emp2Id, emp2);

    const emp3Id = randomUUID();
    const emp3: Employee = {
      id: emp3Id,
      companyId: company1Id,
      firstName: "Emily",
      lastName: "Rodriguez",
      email: "emily.rodriguez@techsolutions.com",
      phone: "+1-555-0103",
      departmentId: deptSalesId,
      designationId: null,
      roleLevelId: roleTopMgmtId,
      reportingManagerId: null,
      status: "active",
      joinDate: "2020-09-15",
      exitDate: null,
      attendanceType: "regular",
      education: [],
      experience: [],
      documents: [],
      ctc: [
        { component: "Basic Salary", amount: 45000, frequency: "monthly", type: "payable" },
        { component: "HRA", amount: 18000, frequency: "monthly", type: "payable" },
        { component: "Sales Incentive", amount: 10000, frequency: "monthly", type: "payable" },
        { component: "Transport Allowance", amount: 4500, frequency: "monthly", type: "payable" },
        { component: "Provident Fund", amount: 5400, frequency: "monthly", type: "deductable" },
        { component: "Professional Tax", amount: 200, frequency: "monthly", type: "deductable" },
      ],
      assets: [],
      bank: null,
      insurance: null,
      statutory: null,
      createdAt: new Date(),
    };
    this.employees.set(emp3Id, emp3);

    const emp4Id = randomUUID();
    const emp4: Employee = {
      id: emp4Id,
      companyId: company1Id,
      firstName: "David",
      lastName: "Kumar",
      email: "david.kumar@techsolutions.com",
      phone: "+1-555-0104",
      departmentId: deptHRId,
      designationId: null,
      roleLevelId: roleJrMgrId,
      reportingManagerId: emp1Id,
      status: "active",
      joinDate: "2023-02-01",
      exitDate: null,
      attendanceType: "regular",
      education: [],
      experience: [],
      documents: [],
      ctc: [
        { component: "Basic Salary", amount: 35000, frequency: "monthly", type: "payable" },
        { component: "HRA", amount: 14000, frequency: "monthly", type: "payable" },
        { component: "Transport Allowance", amount: 3500, frequency: "monthly", type: "payable" },
        { component: "Provident Fund", amount: 4200, frequency: "monthly", type: "deductable" },
        { component: "Professional Tax", amount: 200, frequency: "monthly", type: "deductable" },
      ],
      assets: [],
      bank: null,
      insurance: null,
      statutory: null,
      createdAt: new Date(),
    };
    this.employees.set(emp4Id, emp4);

    // Get current date and calculate previous 2 months
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();
    
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    const twoMonthsAgo = lastMonth === 1 ? 12 : lastMonth - 1;
    const twoMonthsAgoYear = lastMonth === 1 ? lastMonthYear - 1 : lastMonthYear;

    // Create attendance records for past 2 months
    const employees = [emp1Id, emp2Id, emp3Id, emp4Id];
    const workingDays = 22;

    employees.forEach((empId, index) => {
      // Month -2 attendance (20-22 present days)
      const presentDaysMonth2 = 20 + index;
      for (let day = 1; day <= presentDaysMonth2; day++) {
        const attId = randomUUID();
        const dateStr = `${twoMonthsAgoYear}-${String(twoMonthsAgo).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const att: AttendanceRecord = {
          id: attId,
          companyId: company1Id,
          employeeId: empId,
          date: dateStr,
          status: "present",
          checkIn: new Date(twoMonthsAgoYear, twoMonthsAgo - 1, day, 9, 0),
          checkOut: new Date(twoMonthsAgoYear, twoMonthsAgo - 1, day, 18, 0),
          duration: null,
          shiftId: null,
          location: null,
          notes: null,
          createdAt: new Date(),
        };
        this.attendanceRecords.set(attId, att);
      }

      // Month -1 attendance (19-22 present days)
      const presentDaysMonth1 = 19 + index;
      for (let day = 1; day <= presentDaysMonth1; day++) {
        const attId = randomUUID();
        const dateStr = `${lastMonthYear}-${String(lastMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const att: AttendanceRecord = {
          id: attId,
          companyId: company1Id,
          employeeId: empId,
          date: dateStr,
          status: "present",
          checkIn: new Date(lastMonthYear, lastMonth - 1, day, 9, 0),
          checkOut: new Date(lastMonthYear, lastMonth - 1, day, 18, 0),
          duration: null,
          shiftId: null,
          location: null,
          notes: null,
          createdAt: new Date(),
        };
        this.attendanceRecords.set(attId, att);
      }
    });

    // Create Payroll Records for past 2 months
    // Month -2 Payrolls (All approved and published)
    [
      { empId: emp1Id, gross: 75000, deductions: 6200, net: 68800, present: 20 },
      { empId: emp2Id, gross: 60000, deductions: 5000, net: 55000, present: 21 },
      { empId: emp3Id, gross: 77500, deductions: 5600, net: 71900, present: 22 },
      { empId: emp4Id, gross: 52500, deductions: 4400, net: 48100, present: 23 },
    ].forEach((data, idx) => {
      const payrollId = randomUUID();
      const payroll: PayrollRecord = {
        id: payrollId,
        companyId: company1Id,
        employeeId: data.empId,
        month: twoMonthsAgo,
        year: twoMonthsAgoYear,
        status: "approved",
        workingDays: workingDays,
        presentDays: data.present,
        absentDays: workingDays - data.present,
        paidLeaveDays: 0,
        overtimeHours: 0,
        grossPay: data.gross,
        totalDeductions: data.deductions,
        netPay: data.net,
        approvedBy: admin1Id,
        approvedAt: new Date(twoMonthsAgoYear, twoMonthsAgo - 1, 28),
        rejectionReason: null,
        payslipPublished: true,
        payslipPublishedAt: new Date(twoMonthsAgoYear, twoMonthsAgo - 1, 29),
        createdAt: new Date(twoMonthsAgoYear, twoMonthsAgo - 1, 25),
      };
      this.payrollRecords.set(payrollId, payroll);

      // Create payroll items based on employee CTC
      const employee = this.employees.get(data.empId);
      if (employee?.ctc) {
        employee.ctc.forEach(ctcComp => {
          const itemId = randomUUID();
          const item: PayrollItem = {
            id: itemId,
            payrollId: payrollId,
            ctcComponentId: null,
            type: ctcComp.type === "payable" ? "earning" : "deduction",
            name: ctcComp.component,
            amount: ctcComp.amount,
            description: null,
            createdAt: new Date(),
          };
          this.payrollItems.set(itemId, item);
        });
      }
    });

    // Month -1 Payrolls (Mix of statuses)
    [
      { empId: emp1Id, gross: 75000, deductions: 6200, net: 68800, present: 19, status: "approved", published: true },
      { empId: emp2Id, gross: 60000, deductions: 5000, net: 55000, present: 20, status: "approved", published: false },
      { empId: emp3Id, gross: 77500, deductions: 5600, net: 71900, present: 21, status: "pending", published: false },
      { empId: emp4Id, gross: 52500, deductions: 4400, net: 48100, present: 22, status: "rejected", published: false },
    ].forEach((data, idx) => {
      const payrollId = randomUUID();
      const payroll: PayrollRecord = {
        id: payrollId,
        companyId: company1Id,
        employeeId: data.empId,
        month: lastMonth,
        year: lastMonthYear,
        status: data.status as "pending" | "approved" | "rejected",
        workingDays: workingDays,
        presentDays: data.present,
        absentDays: workingDays - data.present,
        paidLeaveDays: 0,
        overtimeHours: 0,
        grossPay: data.gross,
        totalDeductions: data.deductions,
        netPay: data.net,
        approvedBy: data.status === "approved" ? admin1Id : null,
        approvedAt: data.status === "approved" ? new Date(lastMonthYear, lastMonth - 1, 28) : null,
        rejectionReason: data.status === "rejected" ? "Attendance discrepancy - requires verification" : null,
        payslipPublished: data.published,
        payslipPublishedAt: data.published ? new Date(lastMonthYear, lastMonth - 1, 29) : null,
        createdAt: new Date(lastMonthYear, lastMonth - 1, 25),
      };
      this.payrollRecords.set(payrollId, payroll);

      // Create payroll items
      const employee = this.employees.get(data.empId);
      if (employee?.ctc) {
        employee.ctc.forEach(ctcComp => {
          const itemId = randomUUID();
          const item: PayrollItem = {
            id: itemId,
            payrollId: payrollId,
            ctcComponentId: null,
            type: ctcComp.type === "payable" ? "earning" : "deduction",
            name: ctcComp.component,
            amount: ctcComp.amount,
            description: null,
            createdAt: new Date(),
          };
          this.payrollItems.set(itemId, item);
        });
      }
    });

    // Create Expense Types with role-level limits
    const expTypeTravel = randomUUID();
    const travelExpense: ExpenseType = {
      id: expTypeTravel,
      companyId: company1Id,
      code: "TRAVEL",
      name: "Travel Expense",
      roleLevelLimits: [
        { roleLevelId: roleJrMgrId, roleName: "Junior Manager", limitAmount: 10, limitUnit: "per_km" },
        { roleLevelId: roleSrMgrId, roleName: "Senior Manager", limitAmount: 20, limitUnit: "per_km" },
        { roleLevelId: roleTopMgmtId, roleName: "Top Management", limitAmount: 30, limitUnit: "per_km" },
      ],
      enableGoogleMaps: true,
      billMandatory: false,
      approvalRequired: true,
      createdAt: new Date(),
    };
    this.expenseTypes.set(expTypeTravel, travelExpense);

    const expTypeFood = randomUUID();
    const foodExpense: ExpenseType = {
      id: expTypeFood,
      companyId: company1Id,
      code: "FOOD",
      name: "Food & Meals",
      roleLevelLimits: [
        { roleLevelId: roleJrMgrId, roleName: "Junior Manager", limitAmount: 500, limitUnit: "per_day" },
        { roleLevelId: roleSrMgrId, roleName: "Senior Manager", limitAmount: 1000, limitUnit: "per_day" },
        { roleLevelId: roleTopMgmtId, roleName: "Top Management", limitAmount: 2000, limitUnit: "per_day" },
      ],
      enableGoogleMaps: false,
      billMandatory: true,
      approvalRequired: true,
      createdAt: new Date(),
    };
    this.expenseTypes.set(expTypeFood, foodExpense);

    const expTypeAccom = randomUUID();
    const accomExpense: ExpenseType = {
      id: expTypeAccom,
      companyId: company1Id,
      code: "ACCOMMODATION",
      name: "Accommodation",
      roleLevelLimits: [
        { roleLevelId: roleJrMgrId, roleName: "Junior Manager", limitAmount: 3000, limitUnit: "per_day" },
        { roleLevelId: roleSrMgrId, roleName: "Senior Manager", limitAmount: 5000, limitUnit: "per_day" },
        { roleLevelId: roleTopMgmtId, roleName: "Top Management", limitAmount: 10000, limitUnit: "per_day" },
      ],
      enableGoogleMaps: false,
      billMandatory: true,
      approvalRequired: true,
      createdAt: new Date(),
    };
    this.expenseTypes.set(expTypeAccom, accomExpense);

    // Create sample expense claims
    const claim1Id = randomUUID();
    const claim1: ExpenseClaim = {
      id: claim1Id,
      companyId: company1Id,
      employeeId: emp2Id,
      claimNumber: "EXP-2025-001",
      month: currentMonth - 1,
      year: currentYear,
      totalAmount: 8500,
      status: "pending_approval",
      submittedAt: new Date(),
      managerReviewedBy: null,
      managerReviewedAt: null,
      managerRemarks: null,
      adminDisbursedBy: null,
      adminDisbursedAt: null,
      createdAt: new Date(),
    };
    this.expenseClaims.set(claim1Id, claim1);

    const claim1Item1 = randomUUID();
    const claim1I1: ExpenseClaimItem = {
      id: claim1Item1,
      claimId: claim1Id,
      expenseTypeId: expTypeTravel,
      date: "2025-10-15",
      amount: 2500,
      description: "Client meeting in Mumbai - Office to Client Site",
      billUrl: null,
      startLocation: "Tech Solutions Office, Bangalore",
      endLocation: "ABC Corp, Mumbai",
      distanceKm: 250,
      createdAt: new Date(),
    };
    this.expenseClaimItems.set(claim1Item1, claim1I1);

    const claim1Item2 = randomUUID();
    const claim1I2: ExpenseClaimItem = {
      id: claim1Item2,
      claimId: claim1Id,
      expenseTypeId: expTypeFood,
      date: "2025-10-15",
      amount: 1500,
      description: "Team lunch with client",
      billUrl: "/uploads/bill-001.pdf",
      startLocation: null,
      endLocation: null,
      distanceKm: null,
      createdAt: new Date(),
    };
    this.expenseClaimItems.set(claim1Item2, claim1I2);

    const claim1Item3 = randomUUID();
    const claim1I3: ExpenseClaimItem = {
      id: claim1Item3,
      claimId: claim1Id,
      expenseTypeId: expTypeAccom,
      date: "2025-10-15",
      amount: 4500,
      description: "Hotel stay for client meeting",
      billUrl: "/uploads/bill-002.pdf",
      startLocation: null,
      endLocation: null,
      distanceKm: null,
      createdAt: new Date(),
    };
    this.expenseClaimItems.set(claim1Item3, claim1I3);

    const claim2Id = randomUUID();
    const claim2: ExpenseClaim = {
      id: claim2Id,
      companyId: company1Id,
      employeeId: emp4Id,
      claimNumber: "EXP-2025-002",
      month: currentMonth - 1,
      year: currentYear,
      totalAmount: 1200,
      status: "approved",
      submittedAt: new Date(currentYear, currentMonth - 2, 20),
      managerReviewedBy: emp1Id,
      managerReviewedAt: new Date(currentYear, currentMonth - 2, 22),
      managerRemarks: "Approved",
      adminDisbursedBy: null,
      adminDisbursedAt: null,
      createdAt: new Date(),
    };
    this.expenseClaims.set(claim2Id, claim2);

    const claim2Item1 = randomUUID();
    const claim2I1: ExpenseClaimItem = {
      id: claim2Item1,
      claimId: claim2Id,
      expenseTypeId: expTypeFood,
      date: "2025-10-10",
      amount: 1200,
      description: "Recruitment interviews - Candidate lunch",
      billUrl: "/uploads/bill-003.pdf",
      startLocation: null,
      endLocation: null,
      distanceKm: null,
      createdAt: new Date(),
    };
    this.expenseClaimItems.set(claim2Item1, claim2I1);

    const claim3Id = randomUUID();
    const claim3: ExpenseClaim = {
      id: claim3Id,
      companyId: company1Id,
      employeeId: emp3Id,
      claimNumber: "EXP-2025-003",
      month: currentMonth - 1,
      year: currentYear,
      totalAmount: 15000,
      status: "disbursed",
      submittedAt: new Date(currentYear, currentMonth - 2, 10),
      managerReviewedBy: null,
      managerReviewedAt: new Date(currentYear, currentMonth - 2, 11),
      managerRemarks: "Auto-approved for Top Management",
      adminDisbursedBy: admin1Id,
      adminDisbursedAt: new Date(currentYear, currentMonth - 2, 15),
      createdAt: new Date(),
    };
    this.expenseClaims.set(claim3Id, claim3);

    const claim3Item1 = randomUUID();
    const claim3I1: ExpenseClaimItem = {
      id: claim3Item1,
      claimId: claim3Id,
      expenseTypeId: expTypeTravel,
      date: "2025-10-05",
      amount: 9000,
      description: "Sales team offsite - Goa",
      billUrl: null,
      startLocation: "Bangalore Office",
      endLocation: "Goa Resort",
      distanceKm: 300,
      createdAt: new Date(),
    };
    this.expenseClaimItems.set(claim3Item1, claim3I1);

    const claim3Item2 = randomUUID();
    const claim3I2: ExpenseClaimItem = {
      id: claim3Item2,
      claimId: claim3Id,
      expenseTypeId: expTypeAccom,
      date: "2025-10-05",
      amount: 6000,
      description: "Hotel for sales team offsite - 2 nights",
      billUrl: "/uploads/bill-004.pdf",
      startLocation: null,
      endLocation: null,
      distanceKm: null,
      createdAt: new Date(),
    };
    this.expenseClaimItems.set(claim3Item2, claim3I2);
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

  // ExpenseClaim methods
  async getExpenseClaim(id: string): Promise<ExpenseClaim | undefined> {
    return this.expenseClaims.get(id);
  }

  async getExpenseClaimsByCompany(companyId: string): Promise<ExpenseClaim[]> {
    return Array.from(this.expenseClaims.values()).filter((claim) => claim.companyId === companyId);
  }

  async getExpenseClaimsByEmployee(employeeId: string): Promise<ExpenseClaim[]> {
    return Array.from(this.expenseClaims.values()).filter((claim) => claim.employeeId === employeeId);
  }

  async getExpenseClaimsByManager(managerId: string): Promise<ExpenseClaim[]> {
    const employees = await this.getEmployeesByCompany("");
    const teamMemberIds = employees
      .filter((emp) => emp.reportingManagerId === managerId)
      .map((emp) => emp.id);
    
    return Array.from(this.expenseClaims.values()).filter(
      (claim) => teamMemberIds.includes(claim.employeeId) && claim.status === "pending_approval"
    );
  }

  async createExpenseClaim(insertClaim: InsertExpenseClaim): Promise<ExpenseClaim> {
    const id = randomUUID();
    const claim: ExpenseClaim = { 
      ...insertClaim,
      id,
      status: insertClaim.status || "draft",
      totalAmount: insertClaim.totalAmount || 0,
      submittedAt: insertClaim.submittedAt || null,
      managerReviewedBy: insertClaim.managerReviewedBy || null,
      managerReviewedAt: insertClaim.managerReviewedAt || null,
      managerRemarks: insertClaim.managerRemarks || null,
      adminDisbursedBy: insertClaim.adminDisbursedBy || null,
      adminDisbursedAt: insertClaim.adminDisbursedAt || null,
      createdAt: new Date(),
    };
    this.expenseClaims.set(id, claim);
    return claim;
  }

  async updateExpenseClaim(id: string, updates: Partial<ExpenseClaim>): Promise<ExpenseClaim | undefined> {
    const claim = this.expenseClaims.get(id);
    if (!claim) return undefined;
    const updated = { ...claim, ...updates };
    this.expenseClaims.set(id, updated);
    return updated;
  }

  async deleteExpenseClaim(id: string): Promise<boolean> {
    const items = await this.getExpenseClaimItemsByClaim(id);
    items.forEach((item) => this.expenseClaimItems.delete(item.id));
    return this.expenseClaims.delete(id);
  }

  // ExpenseClaimItem methods
  async getExpenseClaimItem(id: string): Promise<ExpenseClaimItem | undefined> {
    return this.expenseClaimItems.get(id);
  }

  async getExpenseClaimItemsByClaim(claimId: string): Promise<ExpenseClaimItem[]> {
    return Array.from(this.expenseClaimItems.values()).filter((item) => item.claimId === claimId);
  }

  async createExpenseClaimItem(insertItem: InsertExpenseClaimItem): Promise<ExpenseClaimItem> {
    const id = randomUUID();
    const item: ExpenseClaimItem = { 
      ...insertItem,
      id,
      description: insertItem.description || null,
      billUrl: insertItem.billUrl || null,
      startLocation: insertItem.startLocation || null,
      endLocation: insertItem.endLocation || null,
      distanceKm: insertItem.distanceKm || null,
      createdAt: new Date(),
    };
    this.expenseClaimItems.set(id, item);
    return item;
  }

  async updateExpenseClaimItem(id: string, updates: Partial<ExpenseClaimItem>): Promise<ExpenseClaimItem | undefined> {
    const item = this.expenseClaimItems.get(id);
    if (!item) return undefined;
    const updated = { ...item, ...updates };
    this.expenseClaimItems.set(id, updated);
    return updated;
  }

  async deleteExpenseClaimItem(id: string): Promise<boolean> {
    return this.expenseClaimItems.delete(id);
  }

  // Workflow methods
  async getWorkflow(id: string): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async getWorkflowsByCompany(companyId: string): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter((w) => w.companyId === companyId);
  }

  async getWorkflowsByEmployee(employeeId: string): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter((w) => w.assignedTo === employeeId);
  }

  async getWorkflowsByAssigner(assignerId: string): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter((w) => w.assignedBy === assignerId);
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = randomUUID();
    const workflow: Workflow = {
      ...insertWorkflow,
      id,
      priority: insertWorkflow.priority || "medium",
      status: insertWorkflow.status || "pending",
      progress: insertWorkflow.progress || 0,
      notes: insertWorkflow.notes || null,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);
    if (!workflow) return undefined;
    const updated = { 
      ...workflow, 
      ...updates,
      updatedAt: new Date(),
      completedAt: updates.status === "completed" ? new Date() : workflow.completedAt,
    };
    this.workflows.set(id, updated);
    return updated;
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    return this.workflows.delete(id);
  }
}

export const storage = new MemStorage();
