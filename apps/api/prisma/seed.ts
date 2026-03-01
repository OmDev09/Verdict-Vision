import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@verdictvision.in';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const existingAdmin = await prisma.user.findUnique({ where: { email } });

  if (!existingAdmin) {
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    await prisma.user.create({
      data: {
        name: 'Admin',
        email,
        passwordHash,
        role: 'ADMIN',
        credits: 9999,
      },
    });
    console.log('Created admin user:', email);
  } else {
    console.log('Admin user already exists:', email);
  }

  // Load sample cases
  console.log('Seeding sample cases...');
  try {
    const fs = require('fs');
    const path = require('path');
    const casesPath = path.join(__dirname, '../../../scripts/sample_cases.json');

    if (fs.existsSync(casesPath)) {
      const casesData = JSON.parse(fs.readFileSync(casesPath, 'utf8'));
      let inserted = 0;

      for (const c of casesData) {
        // Skip empty judgments
        if (!c.judgmentText || c.judgmentText.trim() === '') continue;

        // Check if case with same title and year exists to avoid duplicates
        const existingCase = await prisma.case.findFirst({
          where: { title: c.title, year: c.year }
        });

        if (!existingCase) {
          await prisma.case.create({
            data: {
              title: c.title,
              court: c.court,
              year: c.year,
              judgmentText: c.judgmentText,
            }
          });
          inserted++;
        }
      }
      console.log(`Successfully seeded ${inserted} new cases from sample_cases.json`);
    } else {
      console.log(`Sample cases file not found at ${casesPath}. Run scripts/fetch_sample_cases.py first.`);
    }
  } catch (err) {
    console.error('Error seeding cases:', err);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
