const { PrismaClient } = require('./node_modules/@prisma/client');
const bcrypt = require('./node_modules/bcrypt');

async function fixPassword() {
  const prisma = new PrismaClient();
  try {
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    
    await prisma.admin.update({
      where: { username: 'admin' },
      data: { passwordHash: adminPassword }
    });
    
    console.log('✅ Admin password has been forcefully reset to Admin@123');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

fixPassword();