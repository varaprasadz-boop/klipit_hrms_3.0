import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCompanySchema, UserRole } from "@shared/schema";
import { 
  requireAuth, 
  requireSuperAdmin, 
  requireCompanyAdmin, 
  enforceCompanyScope,
  createSession,
  destroySession,
  getSession
} from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      
      // NOTE: In production, passwords should be hashed using bcrypt or similar
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.status !== "active") {
        return res.status(403).json({ error: "Account is not active" });
      }

      const token = createSession(user.id, user.role, user.companyId);

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
        }
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

  app.get("/api/companies", requireSuperAdmin, async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Get companies error:", error);
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

  const httpServer = createServer(app);
  return httpServer;
}
