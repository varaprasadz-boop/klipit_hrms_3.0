import type { Request, Response, NextFunction } from "express";
import { UserRole } from "@shared/schema";

interface SessionData {
  userId: string;
  email: string;
  role: string;
  companyId: string | null;
}

const sessions = new Map<string, SessionData>();

export function getSession(req: Request): SessionData | undefined {
  const token = req.headers['authorization']?.replace('Bearer ', '');
  if (!token) return undefined;
  return sessions.get(token);
}

export function createSession(userId: string, email: string, role: string, companyId: string | null): string {
  const token = `session_${Date.now()}_${Math.random().toString(36)}`;
  sessions.set(token, { userId, email, role, companyId });
  return token;
}

export function destroySession(token: string) {
  sessions.delete(token);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  (req as any).session = session;
  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (session.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ error: "Super admin access required" });
  }
  
  (req as any).session = session;
  next();
}

export function requireCompanyAdmin(req: Request, res: Response, next: NextFunction) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (session.role !== UserRole.COMPANY_ADMIN && session.role !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  (req as any).session = session;
  next();
}

export function enforceCompanyScope(req: Request, res: Response, next: NextFunction) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (session.role === UserRole.SUPER_ADMIN) {
    (req as any).session = session;
    return next();
  }
  
  const companyId = req.params.companyId || req.params.id;
  
  if (session.companyId !== companyId) {
    return res.status(403).json({ error: "Access to this company is not allowed" });
  }
  
  (req as any).session = session;
  next();
}
