import { useLocation } from "wouter";
import LoginForm from "@/components/LoginForm";

export default function CompanyLogin() {
  const [, setLocation] = useLocation();

  const handleLogin = (username: string, password: string) => {
    console.log("Company login:", { username, password });
    setLocation("/dashboard/admin");
  };

  return <LoginForm type="company" onLogin={handleLogin} />;
}
