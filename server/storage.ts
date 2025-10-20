import { type User, type InsertUser, type Company, type InsertCompany, UserRole } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByCompany(companyId: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByEmail(email: string): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, updates: Partial<Company>): Promise<Company | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private companies: Map<string, Company>;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
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

    const company2Id = randomUUID();
    const company2: Company = {
      id: company2Id,
      name: "Marketing Pro Ltd",
      email: "admin@marketingpro.com",
      status: "active",
      plan: "basic",
      maxEmployees: "50",
      createdAt: new Date(),
    };
    this.companies.set(company2Id, company2);

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

    const employee1Id = randomUUID();
    const employee1: User = {
      id: employee1Id,
      email: "employee@techsolutions.com",
      password: "123456",
      name: "Jane Employee",
      role: UserRole.EMPLOYEE,
      companyId: company1Id,
      department: "Engineering",
      position: "Software Developer",
      status: "active",
      createdAt: new Date(),
    };
    this.users.set(employee1Id, employee1);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUsersByCompany(companyId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.companyId === companyId,
    );
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

  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getCompanyByEmail(email: string): Promise<Company | undefined> {
    return Array.from(this.companies.values()).find(
      (company) => company.email === email,
    );
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
}

export const storage = new MemStorage();
