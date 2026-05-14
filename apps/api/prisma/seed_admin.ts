import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@verdictvision.in';
  const password = 'Admin@123';
  const hashedPassword = await argon2.hash(password);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hashedPassword,
      role: 'ADMIN',
      credits: 9999
    },
    create: {
      email,
      name: 'Super Admin',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      credits: 9999
    },
  });

  console.log(`Admin user created: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
