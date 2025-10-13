import { useLocation } from "wouter";
import LoginForm from "@/components/LoginForm";

export default function EmployeeLogin() {
  const [, setLocation] = useLocation();

  const handleLogin = (username: string, password: string) => {
    console.log("Employee login:", { username, password });
    setLocation("/dashboard/employee");
  };

  return <LoginForm type="employee" onLogin={handleLogin} />;
}
