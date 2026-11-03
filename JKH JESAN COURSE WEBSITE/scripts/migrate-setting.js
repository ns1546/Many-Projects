const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  console.log("Migrating Setting table...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Setting" 
    ADD COLUMN IF NOT EXISTS "bkashNumber" text DEFAULT '01700000000',
    ADD COLUMN IF NOT EXISTS "nagadNumber" text DEFAULT '01700000000',
    ADD COLUMN IF NOT EXISTS "rocketNumber" text,
    ADD COLUMN IF NOT EXISTS "whatsappNumber" text DEFAULT '01700000000',
    ADD COLUMN IF NOT EXISTS "supportEmail" text DEFAULT 'support@jkhjesan.com',
    ADD COLUMN IF NOT EXISTS "noticeText" text;
  `);

  // Ensure default global setting exists
  const existing = await prisma.setting.findUnique({ where: { id: "global" } });
  if (!existing) {
    await prisma.setting.create({
      data: {
        id: "global",
        bkashNumber: "01700000000",
        nagadNumber: "01700000000",
        whatsappNumber: "01700000000",
        supportEmail: "support@jkhjesan.com",
        updatedAt: new Date()
      }
    });
    console.log("Created initial default global setting!");
  } else {
    console.log("Existing global setting found:", existing);
  }

  console.log("Setting table migration successful!");
  await prisma.$disconnect();
}

run().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
