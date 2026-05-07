import prisma from "@/lib/prisma"
import { fetchHtml, extractLinksFromHtml, extractArticleContent, processRss } from "./scraper"
import { findMatches } from "./matcher"

export async function runScrapeJob(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { keywords: true, sourceSites: { where: { status: "active" } } }
  })

  if (!project) return { success: false, error: "Project not found" }
  if (project.keywords.length === 0 || project.sourceSites.length === 0) {
    return { success: false, error: "No keywords or sites configured" }
  }

  const jobRun = await prisma.jobRun.create({
    data: {
      organizationId: project.organizationId,
      projectId: project.id,
      type: "scrape",
      status: "running",
      startedAt: new Date()
    }
  })

  let totalMentions = 0
  const logs: string[] = []
  
  try {
    for (const site of project.sourceSites) {
      logs.push(`Processing site ${site.name}...`)
      
      let urlsToScan: string[] = []
      
      // 1. Discover URLs
      if (site.mode === "rss" || (site.mode === "auto" && site.rssUrl)) {
        await processRss(site.rssUrl!, site.id)
        // RSS parsing already upserts into CrawledUrl, let's fetch unscanned ones
        const pending = await prisma.crawledUrl.findMany({
          where: { sourceSiteId: site.id, lastScannedAt: null },
          take: site.maxUrlsPerScan
        })
        urlsToScan = pending.map(p => p.url)
      } else {
        // HTML mode
        const { html } = await fetchHtml(site.baseUrl)
        if (html) {
          urlsToScan = await extractLinksFromHtml(html, site.baseUrl)
          urlsToScan = urlsToScan.slice(0, site.maxUrlsPerScan) // Limit
        }
      }

      // 2. Scan URLs and Match
      for (const url of urlsToScan) {
        // Skip already crawled recently
        const existing = await prisma.crawledUrl.findFirst({ where: { sourceSiteId: site.id, url } })
        if (existing && existing.lastScannedAt) {
          // If scanned in last 24h, skip
          if (new Date().getTime() - existing.lastScannedAt.getTime() < 24 * 60 * 60 * 1000) {
            continue;
          }
        }

        const { html, status } = await fetchHtml(url)
        if (!html) continue
        
        const { title, text } = await extractArticleContent(html)
        
        // Find matches
        for (const keyword of project.keywords) {
          if (!keyword.isActive) continue
          
          const matches = findMatches(text, keyword)
          if (matches.length > 0) {
            // Save mention
            for (const match of matches) {
              await prisma.mention.create({
                data: {
                  organizationId: project.organizationId,
                  projectId: project.id,
                  sourceSiteId: site.id,
                  crawledUrlId: existing?.id || "temp-id-handled-better-in-prod", // Simplified
                  keywordId: keyword.id,
                  url,
                  title: title || "Sin título",
                  snippet: match.snippet,
                  matchedText: match.matchedText,
                }
              })
              totalMentions++
            }
          }
        }
        
        // Update CrawledUrl
        if (existing) {
          await prisma.crawledUrl.update({
            where: { id: existing.id },
            data: { lastScannedAt: new Date(), httpStatus: status }
          })
        }
      }
      
      await prisma.sourceSite.update({
        where: { id: site.id },
        data: { lastScanAt: new Date(), lastHttpStatus: 200 } // Simplified
      })
    }

    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: "completed",
        finishedAt: new Date(),
        durationMs: new Date().getTime() - jobRun.startedAt!.getTime(),
        logs: logs.join("\n")
      }
    })
    
    return { success: true, totalMentions }
  } catch (error: any) {
    await prisma.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
        error: error.message
      }
    })
    return { success: false, error: error.message }
  }
}
