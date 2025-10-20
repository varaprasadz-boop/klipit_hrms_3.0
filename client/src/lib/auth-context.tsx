import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string | null;
  department: string | null;
  position: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("hrms_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("hrms_token");
  });

  useEffect(() => {
    if (user && token) {
      localStorage.setItem("hrms_user", JSON.stringify(user));
      localStorage.setItem("hrms_token", token);
    } else {
      localStorage.removeItem("hrms_user");
      localStorage.removeItem("hrms_token");
    }
  }, [user, token]);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isCompanyAdmin = user?.role === "COMPANY_ADMIN";
  const isEmployee = user?.role === "EMPLOYEE";

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isSuperAdmin, isCompanyAdmin, isEmployee }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function getAuthToken(): string | null {
  return localStorage.getItem("hrms_token");
}
