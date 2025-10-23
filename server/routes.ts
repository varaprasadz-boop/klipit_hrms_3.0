import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomUUID } from "crypto";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCompanySchema,
  updateCompanySettingsSchema,
  registerCompanySchema,
  insertPlanSchema,
  insertDepartmentSchema,
  insertDesignationSchema,
  insertRoleLevelSchema,
  insertCtcComponentSchema,
  insertEmployeeSchema,
  insertAttendanceRecordSchema,
  insertShiftSchema,
  insertHolidaySchema,
  insertLeaveTypeSchema,
  insertExpenseTypeSchema,
  insertExpenseClaimSchema,
  updateExpenseClaimSchema,
  insertExpenseClaimItemSchema,
  insertWorkflowSchema,
  updateWorkflowSchema,
  type ExpenseClaim,
  UserRole 
} from "@shared/schema";
import { 
  requireAuth, 
  requireSuperAdmin, 
  requireCompanyAdmin, 
  enforceCompanyScope,
  createSession,
  destroySession,
  getSession
} from "./middleware/auth";
import { hashPassword, verifyPassword } from "./utils/password";

// Database connection for registration endpoints
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password using bcrypt
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.status !== "active") {
        return res.status(403).json({ error: "Account is not active" });
      }

      // Get company status for company admins and employees
      let companyStatus = null;
      if (user.companyId) {
        const company = await storage.getCompany(user.companyId);
        companyStatus = company?.status || null;
      }

      const token = createSession(user.id, user.email, user.role, user.companyId);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          department: user.department,
          position: user.position,
        },
        companyStatus,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      const token = req.headers['authorization']?.replace('Bearer ', '');
      if (token) {
        destroySession(token);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const registrationData = registerCompanySchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(registrationData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const existingCompany = await storage.getCompanyByEmail(registrationData.email);
      if (existingCompany) {
        return res.status(400).json({ error: "Company already registered with this email" });
      }

      const { company, user } = await storage.registerCompany(registrationData);

      const token = createSession(user.id, user.email, user.role, user.companyId);

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          department: user.department,
          position: user.position,
        },
        company: {
          id: company.id,
          name: company.name,
          status: company.status,
        }
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid registration data", details: error.errors });
      }
      if (error.message && (error.message.includes("plan not found") || error.message.includes("plan is not active"))) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/companies", requireSuperAdmin, async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Get companies error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Super Admin Dashboard Statistics
  app.get("/api/superadmin/stats", requireSuperAdmin, async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      const users = await storage.getAllUsers();
      const plans = await storage.getAllPlans();
      
      // Calculate statistics
      const activeCompanies = companies.filter(c => c.status === "active");
      
      // Calculate monthly revenue from active companies
      let monthlyRevenue = 0;
      for (const company of activeCompanies) {
        const plan = plans.find(p => p.id === company.planId);
        if (plan) {
          monthlyRevenue += plan.price;
        }
      }
      
      res.json({
        totalCompanies: companies.length,
        activeCompanies: activeCompanies.length,
        totalUsers: users.length,
        monthlyRevenue,
      });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/companies/:id", requireAuth, enforceCompanyScope, async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      console.error("Get company error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/companies", requireSuperAdmin, async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      
      const existing = await storage.getCompanyByEmail(companyData.email);
      if (existing) {
        return res.status(400).json({ error: "Company email already exists" });
      }

      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      console.error("Create company error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/companies/:id", requireSuperAdmin, async (req, res) => {
    try {
      const { status, plan, maxEmployees } = req.body;
      
      const company = await storage.updateCompany(req.params.id, {
        ...(status && { status }),
        ...(plan && { plan }),
        ...(maxEmployees && { maxEmployees }),
      });

      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      console.error("Update company error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/payment-requests", requireSuperAdmin, async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      const users = await storage.getAllUsers();
      
      // Map companies to payment request format
      const requests = companies.map(company => {
        const admin = users.find(u => u.companyId === company.id && u.role === "COMPANY_ADMIN");
        
        // Extract initials from name
        let initials = company.name.substring(0, 2).toUpperCase();
        if (admin?.name) {
          const nameParts = admin.name.trim().split(/\s+/);
          if (nameParts.length >= 2) {
            initials = `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
          } else if (nameParts.length === 1 && nameParts[0].length >= 2) {
            initials = nameParts[0].substring(0, 2).toUpperCase();
          }
        }
        
        return {
          id: company.id,
          companyId: company.id,
          user: {
            name: admin?.name || company.name,
            email: admin?.email || company.email,
            initials: initials,
            avatarColor: "bg-cyan-400",
          },
          type: "Plan",
          plan: {
            name: company.plan || "Basic",
            duration: "1 months",
            includedUsers: 1,
          },
          additionalUsers: company.maxEmployees || 1,
          totalAmount: 0,
          orderId: company.status === "active" ? String(company.id) : null,
          status: company.status,
          paymentMethod: "offline",
        };
      });

      res.json(requests);
    } catch (error) {
      console.error("Get payment requests error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/payment-requests/:id/approve", requireSuperAdmin, async (req, res) => {
    try {
      const companyId = req.params.id;
      
      const company = await storage.updateCompany(companyId, { status: "active" });

      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      res.json({ success: true, company });
    } catch (error) {
      console.error("Approve payment request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/payment-requests/:id/reject", requireSuperAdmin, async (req, res) => {
    try {
      const companyId = req.params.id;
      
      const company = await storage.updateCompany(companyId, { status: "rejected" });

      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      res.json({ success: true, company });
    } catch (error) {
      console.error("Reject payment request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== PLANS ====================
  
  // Get active plans (public - for registration)
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getActivePlans();
      res.json(plans);
    } catch (error) {
      console.error("Get active plans error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get plan by ID (authenticated users)
  app.get("/api/plans/:id", requireAuth, async (req, res) => {
    try {
      const plan = await storage.getPlan(req.params.id);
      
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      res.json(plan);
    } catch (error) {
      console.error("Get plan by ID error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all plans (super admin only)
  app.get("/api/plans/all", requireSuperAdmin, async (req, res) => {
    try {
      const plans = await storage.getAllPlans();
      res.json(plans);
    } catch (error) {
      console.error("Get all plans error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create plan (super admin only)
  app.post("/api/plans", requireSuperAdmin, async (req, res) => {
    try {
      const planData = insertPlanSchema.parse(req.body);
      const plan = await storage.createPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      console.error("Create plan error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update plan (super admin only)
  app.patch("/api/plans/:id", requireSuperAdmin, async (req, res) => {
    try {
      const updates = req.body;
      const plan = await storage.updatePlan(req.params.id, updates);
      
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      res.json(plan);
    } catch (error) {
      console.error("Update plan error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete plan (super admin only)
  app.delete("/api/plans/:id", requireSuperAdmin, async (req, res) => {
    try {
      const success = await storage.deletePlan(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: "Plan not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete plan error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== MULTI-STEP REGISTRATION ====================
  
  // Step 1: Start registration - Create session with basic company info
  app.post("/api/registration/start", async (req, res) => {
    try {
      const registrationData = registerCompanySchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(registrationData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const existingCompany = await storage.getCompanyByEmail(registrationData.email);
      if (existingCompany) {
        return res.status(400).json({ error: "Company already registered with this email" });
      }

      // Hash password before storing in session
      const hashedPassword = await hashPassword(registrationData.password);

      // Create registration session with 24 hour expiry
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Store only non-sensitive data and hashed password
      const sessionData = {
        ...registrationData,
        password: hashedPassword, // Store only hashed password
      };

      const session = await storage.createRegistrationSession({
        status: "company_info",
        sessionData,
        expiresAt,
      });

      res.status(201).json({ sessionId: session.id });
    } catch (error: any) {
      console.error("Start registration error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Invalid registration data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Step 2: Select plan
  app.post("/api/registration/:sessionId/select-plan", async (req, res) => {
    try {
      const { planId } = req.body;
      const session = await storage.getRegistrationSession(req.params.sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Registration session not found" });
      }

      if (new Date() > session.expiresAt) {
        return res.status(410).json({ error: "Registration session expired" });
      }

      const plan = await storage.getPlan(planId);
      if (!plan || !plan.isActive) {
        return res.status(400).json({ error: "Invalid or inactive plan selected" });
      }

      const updatedSession = await storage.updateRegistrationSession(session.id, {
        status: "plan_selection",
        sessionData: { ...session.sessionData, planId },
      });

      res.json({ success: true, session: updatedSession });
    } catch (error) {
      console.error("Select plan error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Step 3: Add employee count (optional)
  app.post("/api/registration/:sessionId/add-employees", async (req, res) => {
    try {
      const { employees, employeeCount } = req.body;
      const session = await storage.getRegistrationSession(req.params.sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Registration session not found" });
      }

      if (new Date() > session.expiresAt) {
        return res.status(410).json({ error: "Registration session expired" });
      }

      // SECURITY: Sanitize employee data - remove any password fields
      // Passwords will be generated server-side during account creation
      const sanitizedEmployees = (employees || []).map((emp: any) => ({
        name: emp.name,
        email: emp.email,
        department: emp.department,
        position: emp.position,
        // Explicitly exclude password field for security
      }));

      const updatedSession = await storage.updateRegistrationSession(session.id, {
        status: "employees_setup",
        sessionData: { 
          ...session.sessionData, 
          additionalEmployees: sanitizedEmployees,
          employeeCount: employeeCount || sanitizedEmployees.length || 1,
        },
      });

      res.json({ success: true, session: updatedSession });
    } catch (error) {
      console.error("Add employees error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Step 4: Initiate payment (online - dummy form)
  app.post("/api/registration/:sessionId/pay-online", async (req, res) => {
    try {
      const { cardNumber, expiryMonth, expiryYear, cvv } = req.body;
      const session = await storage.getRegistrationSession(req.params.sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Registration session not found" });
      }

      if (new Date() > session.expiresAt) {
        return res.status(410).json({ error: "Registration session expired" });
      }

      const sessionData = session.sessionData as any;
      const plan = await storage.getPlan(sessionData.planId);
      if (!plan) {
        return res.status(400).json({ error: "Selected plan not found" });
      }

      // Dummy validation - just check fields are present
      if (!cardNumber || !expiryMonth || !expiryYear || !cvv) {
        return res.status(400).json({ error: "All card details are required" });
      }

      // Create company and admin user
      const companyId = randomUUID();
      const userId = randomUUID();

      const [company] = await db.insert(schema.companies).values({
        id: companyId,
        name: sessionData.companyName,
        email: sessionData.email,
        status: "pending",
        plan: plan.name,
        maxEmployees: plan.maxEmployees.toString(),
        phone: sessionData.phone,
        primaryColor: "#00C853",
        secondaryColor: "#000000",
      }).returning();

      // Note: sessionData.password is already hashed during Step 1
      const [user] = await db.insert(schema.users).values({
        id: userId,
        email: sessionData.email,
        password: sessionData.password, // Already hashed
        name: `${sessionData.adminFirstName} ${sessionData.adminLastName}`,
        role: "COMPANY_ADMIN",
        companyId: companyId,
        position: "Company Administrator",
        status: "active",
      }).returning();

      // Create additional employees if any
      // Note: Employee passwords are always server-generated (never sent from client)
      if (sessionData.additionalEmployees && sessionData.additionalEmployees.length > 0) {
        const defaultPasswordHash = await hashPassword("changeme123");
        for (const emp of sessionData.additionalEmployees) {
          await db.insert(schema.users).values({
            id: randomUUID(),
            email: emp.email,
            password: defaultPasswordHash, // Server-generated hashed password
            name: emp.name,
            role: "EMPLOYEE",
            companyId: companyId,
            department: emp.department,
            position: emp.position,
            status: "active",
          });
        }
      }

      // Create order record (pending approval)
      const order = await storage.createOrder({
        companyId: company.id,
        planId: plan.id,
        amount: plan.price,
        currency: "INR",
        status: "pending",
        paymentProvider: "dummy",
        paymentIntentId: `dummy_${Date.now()}`,
        metadata: { cardLast4: cardNumber.slice(-4) },
      });

      // Update session
      await storage.updateRegistrationSession(session.id, {
        status: "payment_pending",
        companyId: company.id,
        sessionData: { ...sessionData, orderId: order.id },
      });

      const token = createSession(user.id, user.email, user.role, user.companyId);

      res.json({ 
        success: true, 
        orderId: order.id,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
        },
        company: {
          id: company.id,
          name: company.name,
          status: company.status,
        }
      });
    } catch (error) {
      console.error("Pay online error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Step 4: Initiate payment (offline)
  app.post("/api/registration/:sessionId/pay-offline", async (req, res) => {
    try {
      const { notes } = req.body;
      const session = await storage.getRegistrationSession(req.params.sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Registration session not found" });
      }

      if (new Date() > session.expiresAt) {
        return res.status(410).json({ error: "Registration session expired" });
      }

      const sessionData = session.sessionData as any;
      const plan = await storage.getPlan(sessionData.planId);
      if (!plan) {
        return res.status(400).json({ error: "Selected plan not found" });
      }

      // Create company and admin user
      const companyId = randomUUID();
      const userId = randomUUID();

      const [company] = await db.insert(schema.companies).values({
        id: companyId,
        name: sessionData.companyName,
        email: sessionData.email,
        status: "pending",
        plan: plan.name,
        maxEmployees: plan.maxEmployees.toString(),
        phone: sessionData.phone,
        primaryColor: "#00C853",
        secondaryColor: "#000000",
      }).returning();

      // Note: sessionData.password is already hashed during Step 1
      const [user] = await db.insert(schema.users).values({
        id: userId,
        email: sessionData.email,
        password: sessionData.password, // Already hashed
        name: `${sessionData.adminFirstName} ${sessionData.adminLastName}`,
        role: "COMPANY_ADMIN",
        companyId: companyId,
        position: "Company Administrator",
        status: "active",
      }).returning();

      // Create additional employees if any
      // Note: Employee passwords are always server-generated (never sent from client)
      if (sessionData.additionalEmployees && sessionData.additionalEmployees.length > 0) {
        const defaultPasswordHash = await hashPassword("changeme123");
        for (const emp of sessionData.additionalEmployees) {
          await db.insert(schema.users).values({
            id: randomUUID(),
            email: emp.email,
            password: defaultPasswordHash, // Server-generated hashed password
            name: emp.name,
            role: "EMPLOYEE",
            companyId: companyId,
            department: emp.department,
            position: emp.position,
            status: "active",
          });
        }
      }

      // Create offline payment request (pending approval)
      const offlineRequest = await storage.createOfflinePaymentRequest({
        companyId: company.id,
        planId: plan.id,
        amount: plan.price,
        requestedBy: user.id,
        notes: notes || "",
        status: "pending",
      });

      // Update session
      await storage.updateRegistrationSession(session.id, {
        status: "payment_pending",
        companyId: company.id,
        sessionData: { ...sessionData, offlineRequestId: offlineRequest.id },
      });

      const token = createSession(user.id, user.email, user.role, user.companyId);

      res.json({ 
        success: true, 
        offlineRequestId: offlineRequest.id,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
        },
        company: {
          id: company.id,
          name: company.name,
          status: company.status,
        }
      });
    } catch (error) {
      console.error("Pay offline error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== SUPER ADMIN - ORDERS & OFFLINE REQUESTS ====================

  // Get all orders (online payments)
  app.get("/api/orders", requireSuperAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Approve order (online payment)
  app.post("/api/orders/:id/approve", requireSuperAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Update order status
      await storage.updateOrder(order.id, {
        status: "completed",
        approvedBy: session.userId,
        approvedAt: new Date(),
      });

      // Activate company
      await storage.updateCompany(order.companyId, { status: "active" });

      res.json({ success: true });
    } catch (error) {
      console.error("Approve order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all offline payment requests
  app.get("/api/offline-requests", requireSuperAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllOfflinePaymentRequests();
      res.json(requests);
    } catch (error) {
      console.error("Get offline requests error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Approve offline payment request
  app.post("/api/offline-requests/:id/approve", requireSuperAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const request = await storage.getOfflinePaymentRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Offline request not found" });
      }

      // Update request status
      await storage.updateOfflinePaymentRequest(request.id, {
        status: "approved",
        approvedBy: session.userId,
        approvedAt: new Date(),
      });

      // Activate company
      await storage.updateCompany(request.companyId, { status: "active" });

      res.json({ success: true });
    } catch (error) {
      console.error("Approve offline request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Reject offline payment request
  app.post("/api/offline-requests/:id/reject", requireSuperAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { reason } = req.body;
      const request = await storage.getOfflinePaymentRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Offline request not found" });
      }

      // Update request status
      await storage.updateOfflinePaymentRequest(request.id, {
        status: "rejected",
        approvedBy: session.userId,
        approvedAt: new Date(),
        rejectionReason: reason || "No reason provided",
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Reject offline request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/companies/:id/settings", requireCompanyAdmin, enforceCompanyScope, async (req, res) => {
    try {
      const settingsData = updateCompanySettingsSchema.parse(req.body);
      
      const company = await storage.updateCompany(req.params.id, settingsData);

      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      console.error("Update company settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/companies/:id/users", requireCompanyAdmin, enforceCompanyScope, async (req, res) => {
    try {
      const users = await storage.getUsersByCompany(req.params.id);
      res.json(users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        department: u.department,
        position: u.position,
        status: u.status,
      })));
    } catch (error) {
      console.error("Get company users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/users", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const userData = insertUserSchema.parse(req.body);
      
      // Only super admins can create SUPER_ADMIN or COMPANY_ADMIN users
      if (userData.role === UserRole.SUPER_ADMIN || userData.role === UserRole.COMPANY_ADMIN) {
        if (session.role !== UserRole.SUPER_ADMIN) {
          return res.status(403).json({ 
            error: "Only super admins can create admin users" 
          });
        }
      }
      
      // Company admins can only create users in their own company
      if (session.role === UserRole.COMPANY_ADMIN) {
        userData.companyId = session.companyId;
        // Company admins can only create EMPLOYEE users
        userData.role = UserRole.EMPLOYEE;
      }

      const existing = await storage.getUserByEmail(userData.email);
      if (existing) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      });
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== DEPARTMENTS ====================
  app.get("/api/departments", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      let departments;
      if (session.role === UserRole.SUPER_ADMIN) {
        // Super admin can see all departments across all companies
        const allCompanies = await storage.getAllCompanies();
        const allDepartments = await Promise.all(
          allCompanies.map(company => storage.getDepartmentsByCompany(company.id))
        );
        departments = allDepartments.flat();
      } else {
        // Regular users see only their company's departments
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        departments = await storage.getDepartmentsByCompany(session.companyId);
      }

      res.json(departments);
    } catch (error) {
      console.error("Get departments error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/departments", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const departmentData = insertDepartmentSchema.parse(req.body);
      
      // Set companyId from session if not super admin
      if (session.role !== UserRole.SUPER_ADMIN) {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        departmentData.companyId = session.companyId;
      }

      const department = await storage.createDepartment(departmentData);
      res.status(201).json(department);
    } catch (error) {
      console.error("Create department error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/departments/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getDepartment(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Department not found" });
      }

      // Verify ownership (unless super admin)
      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updates = req.body;
      const department = await storage.updateDepartment(req.params.id, updates);
      
      if (!department) {
        return res.status(404).json({ error: "Department not found" });
      }

      res.json(department);
    } catch (error) {
      console.error("Update department error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/departments/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getDepartment(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Department not found" });
      }

      // Verify ownership (unless super admin)
      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const success = await storage.deleteDepartment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Department not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete department error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== DESIGNATIONS ====================
  app.get("/api/designations", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      let designations;
      if (session.role === UserRole.SUPER_ADMIN) {
        const allCompanies = await storage.getAllCompanies();
        const allDesignations = await Promise.all(
          allCompanies.map(company => storage.getDesignationsByCompany(company.id))
        );
        designations = allDesignations.flat();
      } else {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        designations = await storage.getDesignationsByCompany(session.companyId);
      }

      res.json(designations);
    } catch (error) {
      console.error("Get designations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/designations", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const designationData = insertDesignationSchema.parse(req.body);
      
      if (session.role !== UserRole.SUPER_ADMIN) {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        designationData.companyId = session.companyId;
      }

      const designation = await storage.createDesignation(designationData);
      res.status(201).json(designation);
    } catch (error) {
      console.error("Create designation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/designations/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getDesignation(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Designation not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updates = req.body;
      const designation = await storage.updateDesignation(req.params.id, updates);
      
      if (!designation) {
        return res.status(404).json({ error: "Designation not found" });
      }

      res.json(designation);
    } catch (error) {
      console.error("Update designation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/designations/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getDesignation(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Designation not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const success = await storage.deleteDesignation(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Designation not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete designation error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== ROLES & LEVELS ====================
  app.get("/api/roles-levels", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      let rolesLevels;
      if (session.role === UserRole.SUPER_ADMIN) {
        const allCompanies = await storage.getAllCompanies();
        const allRolesLevels = await Promise.all(
          allCompanies.map(company => storage.getRoleLevelsByCompany(company.id))
        );
        rolesLevels = allRolesLevels.flat();
      } else {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        rolesLevels = await storage.getRoleLevelsByCompany(session.companyId);
      }

      res.json(rolesLevels);
    } catch (error) {
      console.error("Get roles-levels error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/roles-levels", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const roleLevelData = insertRoleLevelSchema.parse(req.body);
      
      if (session.role !== UserRole.SUPER_ADMIN) {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        roleLevelData.companyId = session.companyId;
      }

      const roleLevel = await storage.createRoleLevel(roleLevelData);
      res.status(201).json(roleLevel);
    } catch (error) {
      console.error("Create role-level error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/roles-levels/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getRoleLevel(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Role-level not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updates = req.body;
      const roleLevel = await storage.updateRoleLevel(req.params.id, updates);
      
      if (!roleLevel) {
        return res.status(404).json({ error: "Role-level not found" });
      }

      res.json(roleLevel);
    } catch (error) {
      console.error("Update role-level error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/roles-levels/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getRoleLevel(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Role-level not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const success = await storage.deleteRoleLevel(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Role-level not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete role-level error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== CTC COMPONENTS ====================
  app.get("/api/ctc-components", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      let components;
      if (session.role === UserRole.SUPER_ADMIN) {
        const allCompanies = await storage.getAllCompanies();
        const allComponents = await Promise.all(
          allCompanies.map(company => storage.getCtcComponentsByCompany(company.id))
        );
        components = allComponents.flat();
      } else {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        components = await storage.getCtcComponentsByCompany(session.companyId);
      }

      res.json(components);
    } catch (error) {
      console.error("Get CTC components error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/ctc-components", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const componentData = insertCtcComponentSchema.parse(req.body);
      
      if (session.role !== UserRole.SUPER_ADMIN) {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        componentData.companyId = session.companyId;
      }

      const component = await storage.createCtcComponent(componentData);
      res.status(201).json(component);
    } catch (error) {
      console.error("Create CTC component error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/ctc-components/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getCtcComponent(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "CTC component not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updates = req.body;
      const component = await storage.updateCtcComponent(req.params.id, updates);
      
      if (!component) {
        return res.status(404).json({ error: "CTC component not found" });
      }

      res.json(component);
    } catch (error) {
      console.error("Update CTC component error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/ctc-components/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getCtcComponent(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "CTC component not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const success = await storage.deleteCtcComponent(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "CTC component not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Delete CTC component error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== PAYROLL ====================
  app.get("/api/payroll", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!session.companyId) {
        return res.status(400).json({ error: "User not associated with a company" });
      }

      if (session.role === UserRole.EMPLOYEE) {
        // For employees, only return their own published payslips
        const employees = await storage.getEmployeesByCompany(session.companyId);
        const employee = employees.find(emp => emp.email === session.email);
        
        if (!employee) {
          return res.json([]); // No employee record yet
        }
        
        const allPayrolls = await storage.getPayrollRecordsByCompany(session.companyId);
        const employeePayrolls = allPayrolls.filter(p => 
          p.employeeId === employee.id && p.payslipPublished === true
        );
        return res.json(employeePayrolls);
      }

      // Only company admin and super admin can see all payroll records
      if (session.role !== UserRole.COMPANY_ADMIN && session.role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Company admin and super admin get all records
      const payrollRecords = await storage.getPayrollRecordsByCompany(session.companyId);
      res.json(payrollRecords);
    } catch (error) {
      console.error("Get payroll records error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/payroll/generate", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      if (!session.companyId) {
        return res.status(400).json({ error: "User not associated with a company" });
      }

      const { month, year, employeeIds } = req.body;

      if (!month || !year) {
        return res.status(400).json({ error: "Month and year are required" });
      }

      if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
        return res.status(400).json({ error: "Employee IDs are required" });
      }

      const generatedPayrolls = [];

      for (const employeeId of employeeIds) {
        const employee = await storage.getEmployee(employeeId);
        if (!employee || employee.companyId !== session.companyId) {
          continue;
        }

        const existing = await storage.getPayrollRecordByEmployeeAndPeriod(employeeId, month, year);
        if (existing) {
          continue;
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const attendanceRecords = await storage.getAttendanceRecordsByEmployee(employeeId);
        const monthAttendance = attendanceRecords.filter(record => {
          if (!record.date) return false;
          const recordDate = new Date(record.date);
          return recordDate >= startDate && recordDate <= endDate;
        });

        const workingDays = endDate.getDate();
        const presentDays = monthAttendance.filter(r => r.status === "present" || r.status === "approved").length;
        const absentDays = workingDays - presentDays;

        let grossPay = 0;
        let totalDeductions = 0;

        if (employee.ctc && Array.isArray(employee.ctc)) {
          for (const component of employee.ctc) {
            if (component.frequency === "monthly") {
              grossPay += component.amount;
            }
          }
        }

        const netPay = grossPay - totalDeductions;

        const payrollRecord = await storage.createPayrollRecord({
          companyId: session.companyId,
          employeeId,
          month,
          year,
          status: "pending",
          workingDays,
          presentDays,
          absentDays,
          paidLeaveDays: 0,
          overtimeHours: 0,
          grossPay,
          totalDeductions,
          netPay,
        });

        if (employee.ctc && Array.isArray(employee.ctc)) {
          for (const component of employee.ctc) {
            if (component.frequency === "monthly") {
              await storage.createPayrollItem({
                payrollId: payrollRecord.id,
                type: "earning",
                name: component.component,
                amount: component.amount,
              });
            }
          }
        }

        generatedPayrolls.push(payrollRecord);
      }

      res.status(201).json({ 
        message: `Generated ${generatedPayrolls.length} payroll records`,
        payrolls: generatedPayrolls
      });
    } catch (error) {
      console.error("Generate payroll error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/payroll/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const payroll = await storage.getPayrollRecord(req.params.id);
      if (!payroll) {
        return res.status(404).json({ error: "Payroll record not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && payroll.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(payroll);
    } catch (error) {
      console.error("Get payroll record error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/payroll/:id/approve", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const payroll = await storage.getPayrollRecord(req.params.id);
      if (!payroll) {
        return res.status(404).json({ error: "Payroll record not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && payroll.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (payroll.status === "approved") {
        return res.status(400).json({ error: "Payroll already approved" });
      }

      const updated = await storage.updatePayrollRecord(req.params.id, {
        status: "approved",
        approvedBy: session.userId,
        approvedAt: new Date(),
      });

      res.json(updated);
    } catch (error) {
      console.error("Approve payroll error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/payroll/:id/reject", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const payroll = await storage.getPayrollRecord(req.params.id);
      if (!payroll) {
        return res.status(404).json({ error: "Payroll record not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && payroll.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }

      const updated = await storage.updatePayrollRecord(req.params.id, {
        status: "rejected",
        rejectionReason: reason,
      });

      res.json(updated);
    } catch (error) {
      console.error("Reject payroll error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/payroll/:id/publish", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const payroll = await storage.getPayrollRecord(req.params.id);
      if (!payroll) {
        return res.status(404).json({ error: "Payroll record not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && payroll.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (payroll.status !== "approved") {
        return res.status(400).json({ error: "Only approved payroll can be published" });
      }

      const updated = await storage.updatePayrollRecord(req.params.id, {
        payslipPublished: true,
        payslipPublishedAt: new Date(),
      });

      res.json(updated);
    } catch (error) {
      console.error("Publish payslip error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/payroll/:id/items", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const payroll = await storage.getPayrollRecord(req.params.id);
      if (!payroll) {
        return res.status(404).json({ error: "Payroll record not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && payroll.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const items = await storage.getPayrollItemsByPayroll(req.params.id);
      res.json(items);
    } catch (error) {
      console.error("Get payroll items error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/payroll/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const payroll = await storage.getPayrollRecord(req.params.id);
      if (!payroll) {
        return res.status(404).json({ error: "Payroll record not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && payroll.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (payroll.status === "approved" || payroll.payslipPublished) {
        return res.status(400).json({ error: "Cannot delete approved or published payroll" });
      }

      const success = await storage.deletePayrollRecord(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Payroll record not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Delete payroll error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== EMPLOYEES ====================
  app.get("/api/employees", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      let employees;
      if (session.role === UserRole.SUPER_ADMIN) {
        const allCompanies = await storage.getAllCompanies();
        const allEmployees = await Promise.all(
          allCompanies.map(company => storage.getEmployeesByCompany(company.id))
        );
        employees = allEmployees.flat();
      } else {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        employees = await storage.getEmployeesByCompany(session.companyId);
      }

      res.json(employees);
    } catch (error) {
      console.error("Get employees error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/employees", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const employeeData = insertEmployeeSchema.parse(req.body);
      
      if (session.role !== UserRole.SUPER_ADMIN) {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        employeeData.companyId = session.companyId;
      }

      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Create employee error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/employees/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getEmployee(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Employee not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updates = req.body;
      const employee = await storage.updateEmployee(req.params.id, updates);
      
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      console.error("Update employee error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/employees/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getEmployee(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Employee not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const success = await storage.deleteEmployee(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Employee not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete employee error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== ATTENDANCE RECORDS ====================
  app.get("/api/attendance-records", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      let records;
      if (session.role === UserRole.SUPER_ADMIN) {
        const allCompanies = await storage.getAllCompanies();
        const allRecords = await Promise.all(
          allCompanies.map(company => storage.getAttendanceRecordsByCompany(company.id))
        );
        records = allRecords.flat();
      } else if (session.role === UserRole.EMPLOYEE) {
        // For employees, only return their own attendance records
        // Find employee by email (users and employees linked by email)
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        const employees = await storage.getEmployeesByCompany(session.companyId);
        const employee = employees.find(emp => emp.email === session.email);
        
        if (!employee) {
          return res.json([]); // No employee record yet
        }
        
        records = await storage.getAttendanceRecordsByEmployee(employee.id);
      } else {
        // Company admin gets all company records
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        records = await storage.getAttendanceRecordsByCompany(session.companyId);
      }

      res.json(records);
    } catch (error) {
      console.error("Get attendance records error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/attendance-records/employee/:employeeId", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Verify employee belongs to user's company (unless super admin)
      const employee = await storage.getEmployee(req.params.employeeId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && employee.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const records = await storage.getAttendanceRecordsByEmployee(req.params.employeeId);
      res.json(records);
    } catch (error) {
      console.error("Get employee attendance records error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/attendance-records", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const recordData = insertAttendanceRecordSchema.parse(req.body);
      
      if (session.role !== UserRole.SUPER_ADMIN) {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        recordData.companyId = session.companyId;
      }

      const record = await storage.createAttendanceRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      console.error("Create attendance record error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/attendance-records/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getAttendanceRecord(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Attendance record not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updates = req.body;
      const record = await storage.updateAttendanceRecord(req.params.id, updates);
      
      if (!record) {
        return res.status(404).json({ error: "Attendance record not found" });
      }

      res.json(record);
    } catch (error) {
      console.error("Update attendance record error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/attendance-records/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getAttendanceRecord(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Attendance record not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const success = await storage.deleteAttendanceRecord(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Attendance record not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete attendance record error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== SHIFTS ====================
  app.get("/api/shifts", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      let shifts;
      if (session.role === UserRole.SUPER_ADMIN) {
        const allCompanies = await storage.getAllCompanies();
        const allShifts = await Promise.all(
          allCompanies.map(company => storage.getShiftsByCompany(company.id))
        );
        shifts = allShifts.flat();
      } else {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        shifts = await storage.getShiftsByCompany(session.companyId);
      }

      res.json(shifts);
    } catch (error) {
      console.error("Get shifts error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/shifts", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const shiftData = insertShiftSchema.parse(req.body);
      
      if (session.role !== UserRole.SUPER_ADMIN) {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        shiftData.companyId = session.companyId;
      }

      const shift = await storage.createShift(shiftData);
      res.status(201).json(shift);
    } catch (error) {
      console.error("Create shift error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/shifts/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getShift(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Shift not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updates = req.body;
      const shift = await storage.updateShift(req.params.id, updates);
      
      if (!shift) {
        return res.status(404).json({ error: "Shift not found" });
      }

      res.json(shift);
    } catch (error) {
      console.error("Update shift error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/shifts/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getShift(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Shift not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const success = await storage.deleteShift(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Shift not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete shift error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== HOLIDAYS ====================
  app.get("/api/holidays", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      let holidays;
      if (session.role === UserRole.SUPER_ADMIN) {
        const allCompanies = await storage.getAllCompanies();
        const allHolidays = await Promise.all(
          allCompanies.map(company => storage.getHolidaysByCompany(company.id))
        );
        holidays = allHolidays.flat();
      } else {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        holidays = await storage.getHolidaysByCompany(session.companyId);
      }

      res.json(holidays);
    } catch (error) {
      console.error("Get holidays error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/holidays", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const holidayData = insertHolidaySchema.parse(req.body);
      
      if (session.role !== UserRole.SUPER_ADMIN) {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        holidayData.companyId = session.companyId;
      }

      const holiday = await storage.createHoliday(holidayData);
      res.status(201).json(holiday);
    } catch (error) {
      console.error("Create holiday error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/holidays/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getHoliday(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Holiday not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updates = req.body;
      const holiday = await storage.updateHoliday(req.params.id, updates);
      
      if (!holiday) {
        return res.status(404).json({ error: "Holiday not found" });
      }

      res.json(holiday);
    } catch (error) {
      console.error("Update holiday error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/holidays/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getHoliday(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Holiday not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const success = await storage.deleteHoliday(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Holiday not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete holiday error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== LEAVE TYPES ====================
  app.get("/api/leave-types", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      let leaveTypes;
      if (session.role === UserRole.SUPER_ADMIN) {
        const allCompanies = await storage.getAllCompanies();
        const allLeaveTypes = await Promise.all(
          allCompanies.map(company => storage.getLeaveTypesByCompany(company.id))
        );
        leaveTypes = allLeaveTypes.flat();
      } else {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        leaveTypes = await storage.getLeaveTypesByCompany(session.companyId);
      }

      res.json(leaveTypes);
    } catch (error) {
      console.error("Get leave types error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/leave-types", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const leaveTypeData = insertLeaveTypeSchema.parse(req.body);
      
      if (session.role !== UserRole.SUPER_ADMIN) {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        leaveTypeData.companyId = session.companyId;
      }

      const leaveType = await storage.createLeaveType(leaveTypeData);
      res.status(201).json(leaveType);
    } catch (error) {
      console.error("Create leave type error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/leave-types/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getLeaveType(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Leave type not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updates = req.body;
      const leaveType = await storage.updateLeaveType(req.params.id, updates);
      
      if (!leaveType) {
        return res.status(404).json({ error: "Leave type not found" });
      }

      res.json(leaveType);
    } catch (error) {
      console.error("Update leave type error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/leave-types/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getLeaveType(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Leave type not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const success = await storage.deleteLeaveType(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Leave type not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete leave type error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== EXPENSE TYPES ====================
  app.get("/api/expense-types", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      let expenseTypes;
      if (session.role === UserRole.SUPER_ADMIN) {
        const allCompanies = await storage.getAllCompanies();
        const allExpenseTypes = await Promise.all(
          allCompanies.map(company => storage.getExpenseTypesByCompany(company.id))
        );
        expenseTypes = allExpenseTypes.flat();
      } else {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        expenseTypes = await storage.getExpenseTypesByCompany(session.companyId);
      }

      res.json(expenseTypes);
    } catch (error) {
      console.error("Get expense types error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/expense-types", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const expenseTypeData = insertExpenseTypeSchema.parse(req.body);
      
      if (session.role !== UserRole.SUPER_ADMIN) {
        if (!session.companyId) {
          return res.status(400).json({ error: "User not associated with a company" });
        }
        expenseTypeData.companyId = session.companyId;
      }

      const expenseType = await storage.createExpenseType(expenseTypeData);
      res.status(201).json(expenseType);
    } catch (error) {
      console.error("Create expense type error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/expense-types/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getExpenseType(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Expense type not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updates = req.body;
      const expenseType = await storage.updateExpenseType(req.params.id, updates);
      
      if (!expenseType) {
        return res.status(404).json({ error: "Expense type not found" });
      }

      res.json(expenseType);
    } catch (error) {
      console.error("Update expense type error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/expense-types/:id", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const existing = await storage.getExpenseType(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Expense type not found" });
      }

      if (session.role !== UserRole.SUPER_ADMIN && existing.companyId !== session.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const success = await storage.deleteExpenseType(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Expense type not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete expense type error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== EXPENSE CLAIMS ====================
  app.get("/api/expense-claims", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session || !session.companyId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { employeeId, status, view } = req.query;
      
      let claims: ExpenseClaim[] = [];
      
      // Determine which claims to fetch based on user role and view parameter
      if (view === "manager") {
        // Manager view: Get claims of employees reporting to this user
        const user = await storage.getUser(session.userId);
        if (!user || !user.employeeId) {
          return res.status(400).json({ error: "User has no associated employee record" });
        }
        claims = await storage.getExpenseClaimsByManager(user.employeeId);
      } else if (view === "employee" || employeeId) {
        // Employee view: Get own claims only
        const user = await storage.getUser(session.userId);
        if (!user || !user.employeeId) {
          return res.status(400).json({ error: "User has no associated employee record" });
        }
        
        // Security: Only allow viewing own claims unless company admin
        const targetEmployeeId = employeeId as string;
        if (targetEmployeeId && targetEmployeeId !== user.employeeId && session.role !== "COMPANY_ADMIN") {
          return res.status(403).json({ error: "Not authorized to view other employees' claims" });
        }
        
        claims = await storage.getExpenseClaimsByEmployee(targetEmployeeId || user.employeeId);
      } else if (session.role === "COMPANY_ADMIN" || session.role === "SUPER_ADMIN") {
        // Admin view: Get all company claims
        claims = await storage.getExpenseClaimsByCompany(session.companyId);
      } else {
        // Default to own claims for regular employees
        const user = await storage.getUser(session.userId);
        if (!user || !user.employeeId) {
          return res.status(400).json({ error: "User has no associated employee record" });
        }
        claims = await storage.getExpenseClaimsByEmployee(user.employeeId);
      }

      // Security: Filter by company ID to prevent cross-company access
      claims = claims.filter(claim => claim.companyId === session.companyId);

      // Filter by status if provided
      if (status) {
        claims = claims.filter(claim => claim.status === status);
      }

      res.json(claims);
    } catch (error) {
      console.error("Get expense claims error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/expense-claims/:id", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session || !session.companyId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const claim = await storage.getExpenseClaim(req.params.id);
      if (!claim) {
        return res.status(404).json({ error: "Expense claim not found" });
      }

      // Security: Verify company scoping
      if (claim.companyId !== session.companyId) {
        return res.status(403).json({ error: "Not authorized to access this claim" });
      }

      // Security: Verify access rights (own claim, team member claim for manager, or admin)
      const user = await storage.getUser(session.userId);
      if (session.role !== "COMPANY_ADMIN" && session.role !== "SUPER_ADMIN") {
        if (!user || !user.employeeId) {
          return res.status(403).json({ error: "Not authorized to access this claim" });
        }
        
        // Check if it's own claim
        const isOwnClaim = claim.employeeId === user.employeeId;
        
        // Check if employee reports to this manager
        const employee = await storage.getEmployee(claim.employeeId);
        const isManagerOfEmployee = employee?.reportingManagerId === user.employeeId;
        
        if (!isOwnClaim && !isManagerOfEmployee) {
          return res.status(403).json({ error: "Not authorized to access this claim" });
        }
      }

      res.json(claim);
    } catch (error) {
      console.error("Get expense claim error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/expense-claims", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session || !session.companyId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = await storage.getUser(session.userId);
      if (!user || !user.employeeId) {
        return res.status(400).json({ error: "User has no associated employee record" });
      }

      // Validate request body using Zod schema
      const validation = insertExpenseClaimSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request data", details: validation.error.errors });
      }

      // Create claim with security-enforced fields
      const claimData = {
        ...validation.data,
        companyId: session.companyId,
        employeeId: validation.data.employeeId || user.employeeId,
        status: "draft",
      };

      // Security: Regular employees can only create claims for themselves
      if (session.role !== "COMPANY_ADMIN" && claimData.employeeId !== user.employeeId) {
        return res.status(403).json({ error: "Not authorized to create claims for other employees" });
      }

      const claim = await storage.createExpenseClaim(claimData);
      res.status(201).json(claim);
    } catch (error) {
      console.error("Create expense claim error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/expense-claims/:id", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session || !session.companyId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const claim = await storage.getExpenseClaim(req.params.id);
      if (!claim) {
        return res.status(404).json({ error: "Expense claim not found" });
      }

      // Security: Verify company scoping
      if (claim.companyId !== session.companyId) {
        return res.status(403).json({ error: "Not authorized to update this claim" });
      }

      // Security: Only claim owner or company admin can update
      const user = await storage.getUser(session.userId);
      const isOwner = user?.employeeId === claim.employeeId;
      const isAdmin = session.role === "COMPANY_ADMIN" || session.role === "SUPER_ADMIN";
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: "Not authorized to update this claim" });
      }

      // Employees can only update draft claims
      if (!isAdmin && claim.status !== "draft") {
        return res.status(400).json({ error: "Can only update draft claims" });
      }

      // Validate request body using whitelist schema to prevent mass assignment
      const validation = updateExpenseClaimSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request data", details: validation.error.errors });
      }

      // Only allow updating safe fields - prevents tampering with status, employeeId, companyId, audit fields
      const updated = await storage.updateExpenseClaim(req.params.id, validation.data);
      if (!updated) {
        return res.status(404).json({ error: "Expense claim not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Update expense claim error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/expense-claims/:id", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session || !session.companyId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const claim = await storage.getExpenseClaim(req.params.id);
      if (!claim) {
        return res.status(404).json({ error: "Expense claim not found" });
      }

      // Security: Verify company scoping
      if (claim.companyId !== session.companyId) {
        return res.status(403).json({ error: "Not authorized to delete this claim" });
      }

      // Security: Only claim owner can delete
      const user = await storage.getUser(session.userId);
      if (!user || !user.employeeId || user.employeeId !== claim.employeeId) {
        return res.status(403).json({ error: "Not authorized to delete this claim" });
      }

      // Can only delete draft claims
      if (claim.status !== "draft") {
        return res.status(400).json({ error: "Can only delete draft claims" });
      }

      const success = await storage.deleteExpenseClaim(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Expense claim not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Delete expense claim error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/expense-claims/:id/submit", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session || !session.companyId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const claim = await storage.getExpenseClaim(req.params.id);
      if (!claim) {
        return res.status(404).json({ error: "Expense claim not found" });
      }

      // Security: Verify company scoping
      if (claim.companyId !== session.companyId) {
        return res.status(403).json({ error: "Not authorized to submit this claim" });
      }

      // Security: Only claim owner can submit
      const user = await storage.getUser(session.userId);
      if (!user || !user.employeeId || user.employeeId !== claim.employeeId) {
        return res.status(403).json({ error: "Not authorized to submit this claim" });
      }

      // Status transition validation: Can only submit draft claims
      if (claim.status !== "draft") {
        return res.status(400).json({ error: "Can only submit draft claims" });
      }

      // Verify claim has at least one item
      const items = await storage.getExpenseClaimItemsByClaim(claim.id);
      if (items.length === 0) {
        return res.status(400).json({ error: "Cannot submit empty claim. Add expense items first." });
      }

      const updated = await storage.updateExpenseClaim(req.params.id, {
        status: "pending_approval",
        submittedAt: new Date(),
      });

      res.json(updated);
    } catch (error) {
      console.error("Submit expense claim error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/expense-claims/:id/approve", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session || !session.companyId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const claim = await storage.getExpenseClaim(req.params.id);
      if (!claim) {
        return res.status(404).json({ error: "Expense claim not found" });
      }

      // Security: Verify company scoping
      if (claim.companyId !== session.companyId) {
        return res.status(403).json({ error: "Not authorized to approve this claim" });
      }

      // Status transition validation: Can only approve pending claims
      if (claim.status !== "pending_approval") {
        return res.status(400).json({ error: "Can only approve claims that are pending approval" });
      }

      // Security: Only the employee's reporting manager can approve
      const user = await storage.getUser(session.userId);
      if (!user || !user.employeeId) {
        return res.status(403).json({ error: "User has no associated employee record" });
      }

      const employee = await storage.getEmployee(claim.employeeId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Verify that the current user is the employee's reporting manager
      if (employee.reportingManagerId !== user.employeeId) {
        return res.status(403).json({ error: "Only the reporting manager can approve this claim" });
      }
      
      const updated = await storage.updateExpenseClaim(req.params.id, {
        status: "approved",
        managerReviewedBy: user.employeeId,
        managerReviewedAt: new Date(),
        managerRemarks: req.body.remarks || null,
      });

      res.json(updated);
    } catch (error) {
      console.error("Approve expense claim error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/expense-claims/:id/reject", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session || !session.companyId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const claim = await storage.getExpenseClaim(req.params.id);
      if (!claim) {
        return res.status(404).json({ error: "Expense claim not found" });
      }

      // Security: Verify company scoping
      if (claim.companyId !== session.companyId) {
        return res.status(403).json({ error: "Not authorized to reject this claim" });
      }

      // Status transition validation: Can only reject pending claims
      if (claim.status !== "pending_approval") {
        return res.status(400).json({ error: "Can only reject claims that are pending approval" });
      }

      // Security: Only the employee's reporting manager can reject
      const user = await storage.getUser(session.userId);
      if (!user || !user.employeeId) {
        return res.status(403).json({ error: "User has no associated employee record" });
      }

      const employee = await storage.getEmployee(claim.employeeId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Verify that the current user is the employee's reporting manager
      if (employee.reportingManagerId !== user.employeeId) {
        return res.status(403).json({ error: "Only the reporting manager can reject this claim" });
      }

      const updated = await storage.updateExpenseClaim(req.params.id, {
        status: "rejected",
        managerReviewedBy: user.employeeId,
        managerReviewedAt: new Date(),
        managerRemarks: req.body.remarks || "Rejected by manager",
      });

      res.json(updated);
    } catch (error) {
      console.error("Reject expense claim error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/expense-claims/:id/disburse", requireCompanyAdmin, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session || !session.companyId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const claim = await storage.getExpenseClaim(req.params.id);
      if (!claim) {
        return res.status(404).json({ error: "Expense claim not found" });
      }

      // Security: Verify company scoping
      if (claim.companyId !== session.companyId) {
        return res.status(403).json({ error: "Not authorized to disburse this claim" });
      }

      // Status transition validation: Can only disburse approved claims
      if (claim.status !== "approved") {
        return res.status(400).json({ error: "Only approved claims can be disbursed" });
      }

      const updated = await storage.updateExpenseClaim(req.params.id, {
        status: "disbursed",
        adminDisbursedBy: session.userId,
        adminDisbursedAt: new Date(),
      });

      res.json(updated);
    } catch (error) {
      console.error("Disburse expense claim error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // ==================== EXPENSE CLAIM ITEMS ====================
  app.get("/api/expense-claims/:claimId/items", requireAuth, async (req, res) => {
    try {
      const items = await storage.getExpenseClaimItemsByClaim(req.params.claimId);
      res.json(items);
    } catch (error) {
      console.error("Get expense claim items error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/expense-claims/:claimId/items", requireAuth, async (req, res) => {
    try {
      const itemData = {
        ...req.body,
        claimId: req.params.claimId,
      };

      const item = await storage.createExpenseClaimItem(itemData);
      
      // Update total amount on claim
      const claim = await storage.getExpenseClaim(req.params.claimId);
      if (claim) {
        const items = await storage.getExpenseClaimItemsByClaim(req.params.claimId);
        const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
        await storage.updateExpenseClaim(req.params.claimId, { totalAmount });
      }

      res.status(201).json(item);
    } catch (error) {
      console.error("Create expense claim item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/expense-claim-items/:id", requireAuth, async (req, res) => {
    try {
      const item = await storage.getExpenseClaimItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Expense claim item not found" });
      }

      const updated = await storage.updateExpenseClaimItem(req.params.id, req.body);
      
      // Update total amount on claim
      const items = await storage.getExpenseClaimItemsByClaim(item.claimId);
      const totalAmount = items.reduce((sum, i) => sum + (i.id === req.params.id ? (req.body.amount || i.amount) : i.amount), 0);
      await storage.updateExpenseClaim(item.claimId, { totalAmount });

      res.json(updated);
    } catch (error) {
      console.error("Update expense claim item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/expense-claim-items/:id", requireAuth, async (req, res) => {
    try {
      const item = await storage.getExpenseClaimItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Expense claim item not found" });
      }

      const success = await storage.deleteExpenseClaimItem(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Expense claim item not found" });
      }

      // Update total amount on claim
      const items = await storage.getExpenseClaimItemsByClaim(item.claimId);
      const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
      await storage.updateExpenseClaim(item.claimId, { totalAmount });

      res.json({ success: true });
    } catch (error) {
      console.error("Delete expense claim item error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Workflow Routes
  app.get("/api/workflows", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      let workflows;
      if (session.role === UserRole.SUPER_ADMIN || session.role === UserRole.COMPANY_ADMIN) {
        // Admins can see all workflows in their company
        workflows = await storage.getWorkflowsByCompany(session.companyId!);
      } else {
        // CRITICAL: Employees can ONLY see workflows assigned to them
        // This prevents data exposure through the API
        workflows = await storage.getWorkflowsByEmployee(session.userId);
      }

      res.json(workflows);
    } catch (error) {
      console.error("Get workflows error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/workflows/:id", requireAuth, async (req, res) => {
    try {
      const workflow = await storage.getWorkflow(req.params.id);
      
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      const session = getSession(req);
      if (session?.companyId !== workflow.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(workflow);
    } catch (error) {
      console.error("Get workflow error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/workflows", requireAuth, async (req, res) => {
    try {
      const session = getSession(req);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Only Company Admin or managers can create workflows
      if (session.role !== UserRole.COMPANY_ADMIN && session.role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({ error: "Only admins and managers can create workflows" });
      }

      const workflowData = insertWorkflowSchema.parse(req.body);
      
      const workflow = await storage.createWorkflow({
        ...workflowData,
        companyId: session.companyId!,
        assignedBy: session.userId,
      });

      res.status(201).json(workflow);
    } catch (error) {
      console.error("Create workflow error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/workflows/:id", requireAuth, async (req, res) => {
    try {
      const workflow = await storage.getWorkflow(req.params.id);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      const session = getSession(req);
      if (session?.companyId !== workflow.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // CRITICAL: Employees can only update their own workflows
      // Admins can update any workflow in their company
      if (session.role === UserRole.EMPLOYEE && workflow.assignedTo !== session.userId) {
        return res.status(403).json({ error: "You can only update your own workflows" });
      }

      const updates = updateWorkflowSchema.parse(req.body);
      
      // CRITICAL: Employees can only update progress and notes, not assignment or other fields
      if (session.role === UserRole.EMPLOYEE) {
        const allowedUpdates: Partial<typeof updates> = {};
        if (updates.progress !== undefined) allowedUpdates.progress = updates.progress;
        if (updates.status !== undefined) allowedUpdates.status = updates.status;
        if (updates.notes !== undefined) allowedUpdates.notes = updates.notes;
        
        const updated = await storage.updateWorkflow(req.params.id, allowedUpdates);
        return res.json(updated);
      }

      // Admins can update all fields
      const updated = await storage.updateWorkflow(req.params.id, updates);
      res.json(updated);
    } catch (error) {
      console.error("Update workflow error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/workflows/:id", requireAuth, async (req, res) => {
    try {
      const workflow = await storage.getWorkflow(req.params.id);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      const session = getSession(req);
      if (session?.companyId !== workflow.companyId) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Only creator or admin can delete
      if (workflow.assignedBy !== session.userId && session.role !== UserRole.COMPANY_ADMIN) {
        return res.status(403).json({ error: "Only workflow creator or admin can delete" });
      }

      const success = await storage.deleteWorkflow(req.params.id);
      res.json({ success });
    } catch (error) {
      console.error("Delete workflow error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
