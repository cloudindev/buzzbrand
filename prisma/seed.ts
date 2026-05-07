import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // 1. Create a demo user
  const passwordHash = await bcrypt.hash('password123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'demo@buzzbrand.es' },
    update: {},
    create: {
      email: 'demo@buzzbrand.es',
      name: 'Demo User',
      passwordHash,
    },
  })
  console.log({ user })

  // 2. Create demo organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'demo-org' },
    update: {},
    create: {
      name: 'Demo Organization',
      slug: 'demo-org',
    },
  })
  console.log({ organization })

  // 3. Create membership (OWNER)
  const membership = await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: organization.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      organizationId: organization.id,
      role: 'OWNER',
    },
  })
  console.log({ membership })

  // 4. Create demo project
  const project = await prisma.project.create({
    data: {
      organizationId: organization.id,
      name: 'Demo Project - Vercel',
      description: 'Monitoring mentions of Vercel and Next.js',
    },
  })
  console.log({ project })

  // 5. Add 3 keywords
  await prisma.keyword.createMany({
    data: [
      { projectId: project.id, term: 'Vercel', matchType: 'contains' },
      { projectId: project.id, term: 'Next.js', matchType: 'exact_match' },
      { projectId: project.id, term: 'Server Actions', matchType: 'phrase' },
    ],
  })

  // 6. Add 3 sources
  await prisma.sourceSite.createMany({
    data: [
      { projectId: project.id, name: 'Hacker News', baseUrl: 'https://news.ycombinator.com', mode: 'html' },
      { projectId: project.id, name: 'Dev.to Next.js', baseUrl: 'https://dev.to/t/nextjs', mode: 'auto' },
      { projectId: project.id, name: 'TechCrunch', baseUrl: 'https://techcrunch.com', rssUrl: 'https://techcrunch.com/feed/', mode: 'rss' },
    ],
  })

  // 7. Add 2 recipients
  await prisma.emailRecipient.createMany({
    data: [
      { projectId: project.id, email: 'demo@buzzbrand.es', name: 'Demo User' },
      { projectId: project.id, email: 'alerts@buzzbrand.es', name: 'Alerts Team' },
    ],
  })

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
