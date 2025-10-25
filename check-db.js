/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log("🔍 Checking database connection...");
    
    const count = await prisma.joke.count();
    console.log(`✅ Found ${count} jokes in database`);
    
    if (count > 0) {
      const sample = await prisma.joke.findFirst();
      console.log("\n📝 Sample joke:");
      console.log(`   ID: ${sample.id}`);
      console.log(`   Content: ${sample.content.substring(0, 100)}...`);
      console.log(`   Upvotes: ${sample.upvotes}, Downvotes: ${sample.downvotes}`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
