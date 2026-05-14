import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const sampleDataPath = path.join(__dirname, '../../../scripts/sample_cases.json');
  if (!fs.existsSync(sampleDataPath)) {
    console.error('sample_cases.json not found. Please run fetch_sample_cases.py first.');
    process.exit(1);
  }

  const rawData = fs.readFileSync(sampleDataPath, 'utf8');
  const cases = JSON.parse(rawData);

  console.log(`Found ${cases.length} cases. Ingesting into Postgres...`);

  let count = 0;
  for (const c of cases) {
    await prisma.case.create({
      data: {
        title: c.title.substring(0, 500),
        court: c.court || 'Supreme Court of India',
        year: c.year || 2023,
        judgmentText: c.judgmentText,
      }
    });
    count++;
  }

  console.log(`Successfully ingested ${count} cases into the database!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
