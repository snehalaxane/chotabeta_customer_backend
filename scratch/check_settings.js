const prisma = require("../src/config/database");

async function check() {
  try {
    const columns = await prisma.$queryRaw`SHOW COLUMNS FROM settings;`;
    console.log("Settings Table Columns:", columns);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
