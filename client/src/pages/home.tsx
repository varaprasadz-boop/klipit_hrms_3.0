import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CostCalculator from "@/components/CostCalculator";
import { 
  Clock, Umbrella, Workflow, Receipt, Megaphone, 
  FileText, Users, Shield, Smartphone 
} from "lucide-react";
import { Link } from "wouter";
import klipitLogo from "@assets/Klipit By Bova_1761061110237.png";

const features = [
  { icon: Clock, title: "Attendance", desc: "Track clock-in/out with geo-fencing" },
  { icon: Umbrella, title: "Leave Management", desc: "Easy leave requests and approvals" },
  { icon: Workflow, title: "Workflows", desc: "Streamlined approval processes" },
  { icon: Receipt, title: "Expenses", desc: "Travel & reimbursement claims" },
  { icon: Megaphone, title: "Noticeboard", desc: "Company announcements" },
  { icon: FileText, title: "Payslips", desc: "Digital payslip access" },
  { icon: Users, title: "Employee Directory", desc: "Complete employee database" },
  { icon: Shield, title: "Roles & Permissions", desc: "Access control management" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src={klipitLogo} alt="Klipit by Bova" className="h-12 w-auto" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/login/company">
              <Button variant="outline" data-testid="link-company-login">Company Login</Button>
            </Link>
            <Link href="/login/employee">
              <Button data-testid="link-employee-login">Employee Login</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Modern HR Management System
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Streamline your HR operations with Klipit by Bova - a simple, professional platform 
          for attendance, leave, payroll, and employee lifecycle management
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" data-testid="button-get-started">
            Get Started
          </Button>
          <Button size="lg" variant="outline" data-testid="button-watch-demo">
            Watch Demo
          </Button>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-12">Core HRMS Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="hover-elevate">
                <CardContent className="pt-6">
                  <feature.icon className="h-8 w-8 text-primary mb-3" />
                  <h4 className="font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Calculate Your Cost</h3>
          <CostCalculator />
        </div>
      </section>

      <section className="bg-primary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Smartphone className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Mobile Apps Available</h3>
            <p className="text-muted-foreground mb-6">
              Access Klipit on the go with our Android and iOS mobile applications
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" data-testid="button-app-android">
                Download for Android
              </Button>
              <Button variant="outline" data-testid="button-app-ios">
                Download for iOS
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Klipit by Bova - All rights reserved</p>
          <div className="mt-4">
            <Link href="/login/superadmin">
              <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="link-superadmin">
                Super Admin Access
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
