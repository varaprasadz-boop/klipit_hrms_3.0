import { DbStorage } from "./db-storage";
import { UserRole } from "@shared/schema";

const storage = new DbStorage();

async function seed() {
  console.log("Seeding database...");

  try {
    // Create super admin user (only essential data for production)
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

    console.log("✅ Database seeding completed successfully");
    console.log("ℹ️  No demo data created - system ready for production use");
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
