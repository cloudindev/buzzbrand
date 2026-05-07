import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { runScrapeJob } from "@/lib/orchestrator"
import { sendClippingEmail } from "@/lib/email"

export const maxDuration = 300 // 5 minutes max for Vercel/NextJS if deployed there

export async function GET(request: Request) {
  // Simple auth for cron
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET || "buzzbrand-cron"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Find all active projects
  const projects = await prisma.project.findMany({
    where: { status: "active" }
  })

  const results = []

  for (const project of projects) {
    // 1. Run Scraping
    const scrapeResult = await runScrapeJob(project.id)
    
    // 2. Send Emails if scraping succeeded
    let emailResult = null
    if (scrapeResult.success) {
      emailResult = await sendClippingEmail(project.id)
    }

    results.push({
      projectId: project.id,
      scrape: scrapeResult,
      email: emailResult
    })
  }

  return NextResponse.json({ success: true, executed: projects.length, results })
}
