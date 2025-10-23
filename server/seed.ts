import { DbStorage } from "./db-storage";
import { UserRole } from "@shared/schema";
import { hashPassword } from "./utils/password";

const storage = new DbStorage();

async function seed() {
  console.log("Seeding database...");

  try {
    // Create super admin user (only essential data for production)
    const superAdmin = await storage.getUserByEmail("superadmin@hrmsworld.com");
    if (!superAdmin) {
      const hashedPassword = await hashPassword("123456");
      await storage.createUser({
        email: "superadmin@hrmsworld.com",
        password: hashedPassword,
        name: "Super Admin",
        role: UserRole.SUPER_ADMIN,
        status: "active",
      });
      console.log("✓ Super admin created");
    } else {
      console.log("✓ Super admin already exists");
    }

    // Create default plans (these are managed by super admin)
    const allPlans = await storage.getAllPlans();
    if (allPlans.length === 0) {
      await storage.createPlan({
        name: "basic",
        displayName: "Basic Plan",
        duration: 1,
        price: 5000,
        maxEmployees: 50,
        features: ["50 Employees", "Basic Features", "Email Support"],
        isActive: true,
      });

      await storage.createPlan({
        name: "standard",
        displayName: "Standard Plan",
        duration: 1,
        price: 10000,
        maxEmployees: 100,
        features: ["100 Employees", "Advanced Features", "Priority Support", "Payroll Management"],
        isActive: true,
      });

      await storage.createPlan({
        name: "premium",
        displayName: "Premium Plan",
        duration: 1,
        price: 20000,
        maxEmployees: 500,
        features: ["500 Employees", "All Features", "24/7 Support", "Custom Integrations", "Dedicated Account Manager"],
        isActive: true,
      });

      console.log("✓ Default plans created");
    } else {
      console.log("✓ Plans already exist");
    }

    console.log("✅ Database seeding completed successfully");
    console.log("ℹ️  System ready for production use");
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
