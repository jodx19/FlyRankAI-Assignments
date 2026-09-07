import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  // 1. Create Plans
  const freePlan = await prisma.plan.upsert({
    where: { name: 'Free' },
    update: {},
    create: {
      name: 'Free',
      apiLimit: parseInt(process.env.FREE_API_LIMIT || '1000'),
      tokenLimit: parseInt(process.env.FREE_TOKEN_LIMIT || '100000'),
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: 'Pro' },
    update: {},
    create: {
      name: 'Pro',
      apiLimit: parseInt(process.env.PRO_API_LIMIT || '10000'),
      tokenLimit: parseInt(process.env.PRO_TOKEN_LIMIT || '1000000'),
    },
  });

  console.log('Plans seeded:', { freePlan, proPlan });

  // 2. Create a dummy tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Corp',
    },
  });

  console.log('Tenant seeded:', tenant);

  // 3. Create Subscription for Tenant (Free plan initially)
  const subscription = await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      planId: freePlan.id,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)), // 1 month from now
    }
  });

  console.log('Subscription seeded:', subscription);
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
