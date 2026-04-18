const { PrismaClient } = require('./node_modules/@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();
  try {
    const admin = await prisma.admin.findFirst();
    console.log('Admin:', admin);
    
    const user = await prisma.user.findFirst();
    console.log('User:', user);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();