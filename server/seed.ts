import { DbStorage } from "./db-storage";
import { UserRole } from "@shared/schema";

const storage = new DbStorage();

async function seed() {
  console.log("Seeding database...");

  try {
    // Create super admin user
    const superAdmin = await storage.getUserByEmail("superadmin@hrmsworld.com");
    if (!superAdmin) {
      await storage.createUser({
        email: "superadmin@hrmsworld.com",
        password: "123456",
        name: "Super Admin",
        role: UserRole.SUPER_ADMIN,
        status: "active",
      });
      console.log("✓ Super admin created");
    } else {
      console.log("✓ Super admin already exists");
    }

    // Create demo company
    const demoCompany = await storage.getCompanyByEmail("admin@techsolutions.com");
    if (!demoCompany) {
      const { company, user } = await storage.registerCompany({
        companyName: "Tech Solutions Inc",
        adminFirstName: "Admin",
        adminLastName: "User",
        email: "admin@techsolutions.com",
        password: "123456",
        phone: "9876543210",
        gender: "male",
      });

      // Activate the company
      await storage.updateCompany(company.id, { status: "active" });
      console.log("✓ Demo company created and activated");

      // Create demo departments
      const engineeringDept = await storage.createDepartment({
        companyId: company.id,
        name: "Engineering",
        description: "Software Development Team",
      });

      const salesDept = await storage.createDepartment({
        companyId: company.id,
        name: "Sales",
        description: "Sales and Business Development",
      });

      const hrDept = await storage.createDepartment({
        companyId: company.id,
        name: "Human Resources",
        description: "HR and People Operations",
      });
      console.log("✓ Demo departments created");

      // Create demo employees
      const employees = [
        {
          email: "sarah.johnson@techsolutions.com",
          name: "Sarah Johnson",
          department: "Engineering",
          position: "Senior Engineer",
        },
        {
          email: "michael.chen@techsolutions.com",
          name: "Michael Chen",
          department: "Engineering",
          position: "Engineer",
        },
        {
          email: "emily.rodriguez@techsolutions.com",
          name: "Emily Rodriguez",
          department: "Sales",
          position: "Sales Manager",
        },
        {
          email: "david.kumar@techsolutions.com",
          name: "David Kumar",
          department: "Human Resources",
          position: "HR Coordinator",
        },
      ];

      for (const emp of employees) {
        await storage.createUser({
          email: emp.email,
          password: "123456",
          name: emp.name,
          role: UserRole.EMPLOYEE,
          companyId: company.id,
          department: emp.department,
          position: emp.position,
          status: "active",
        });
      }
      console.log("✓ Demo employees created");
    } else {
      console.log("✓ Demo company already exists");
    }

    console.log("✅ Database seeding completed successfully");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
