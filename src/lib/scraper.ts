import * as cheerio from "cheerio"
import Parser from "rss-parser"
import crypto from "crypto"
import prisma from "@/lib/prisma"

const parser = new Parser()
const USER_AGENT = process.env.SCRAPER_USER_AGENT || "Mozilla/5.0 (compatible; BuzzbrandBot/1.0; +http://buzzbrand.es)"

export async function fetchHtml(url: string) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(10000)
    })
    
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`)
    }
    
    const html = await res.text()
    return { html, status: res.status }
  } catch (error) {
    console.error(`Error fetching ${url}:`, error)
    return { html: null, status: 500 }
  }
}

export async function extractLinksFromHtml(html: string, baseUrl: string) {
  const $ = cheerio.load(html)
  const links = new Set<string>()
  
  $("a[href]").each((_, el) => {
    let href = $(el).attr("href")
    if (!href) return
    
    // Clean and resolve URL
    try {
      const urlObj = new URL(href, baseUrl)
      // Remove hash and tracking params
      urlObj.hash = ""
      urlObj.searchParams.delete("utm_source")
      urlObj.searchParams.delete("utm_medium")
      urlObj.searchParams.delete("utm_campaign")
      
      // Only keep http/https and same origin or relevant domain
      // For now, keep anything on the same host
      const baseObj = new URL(baseUrl)
      if (urlObj.hostname === baseObj.hostname || urlObj.hostname.endsWith(`.${baseObj.hostname}`)) {
        links.add(urlObj.toString())
      }
    } catch (e) {
      // Invalid URL, ignore
    }
  })
  
  return Array.from(links)
}

export async function extractArticleContent(html: string) {
  const $ = cheerio.load(html)
  
  // Remove scripts, styles, nav, footer
  $("script, style, nav, footer, header, aside, .ad, .advertisement").remove()
  
  const title = $("h1").first().text().trim() || $("title").text().trim()
  const text = $("body").text().replace(/\s+/g, " ").trim()
  
  return { title, text }
}

export async function processRss(rssUrl: string, siteId: string) {
  try {
    const feed = await parser.parseURL(rssUrl)
    const items = feed.items.slice(0, 50) // Max 50 items
    
    for (const item of items) {
      if (!item.link) continue
      
      const urlHash = crypto.createHash('sha256').update(item.link).digest('hex')
      const contentStr = `${item.title} ${item.contentSnippet || ""}`
      const contentHash = crypto.createHash('sha256').update(contentStr).digest('hex')
      
      await prisma.crawledUrl.upsert({
        where: { sourceSiteId_urlHash: { sourceSiteId: siteId, urlHash } },
        update: { lastSeenAt: new Date(), title: item.title, contentHash },
        create: {
          sourceSiteId: siteId,
          url: item.link,
          urlHash,
          title: item.title,
          contentHash,
          httpStatus: 200,
        }
      })
    }
    return items.length
  } catch (error) {
    console.error(`RSS parsing error for ${rssUrl}:`, error)
    return 0
  }
}
