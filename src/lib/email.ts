import nodemailer from "nodemailer"
import prisma from "@/lib/prisma"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendClippingEmail(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      emailRecipients: { where: { isActive: true } },
      organization: true
    }
  })

  if (!project || project.emailRecipients.length === 0) return { success: false, error: "No project or recipients" }

  // Get unsent mentions
  const mentions = await prisma.mention.findMany({
    where: { projectId, sentAt: null },
    include: { sourceSite: true, keyword: true },
    orderBy: { detectedAt: "desc" }
  })

  if (mentions.length === 0 && !project.sendEmptyReports) {
    return { success: true, message: "No new mentions and sendEmptyReports is false" }
  }

  const subject = `[Buzzbrand] Clipping Diario: ${project.name} - ${mentions.length} menciones`

  // Build HTML
  let html = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #000;">
      <h1 style="border-bottom: 2px solid #000; padding-bottom: 10px;">${project.name}</h1>
      <p style="color: #6B6B64;">Resumen diario de menciones extraídas por Buzzbrand.</p>
  `

  if (mentions.length === 0) {
    html += `<p>No se han detectado nuevas menciones hoy.</p>`
  } else {
    // Group by sourceSite
    const grouped = mentions.reduce((acc, m) => {
      const siteName = m.sourceSite.name
      if (!acc[siteName]) acc[siteName] = []
      acc[siteName].push(m)
      return acc
    }, {} as Record<string, typeof mentions>)

    for (const [site, siteMentions] of Object.entries(grouped)) {
      html += `
        <h2 style="background-color: #F7F7F2; padding: 10px; margin-top: 30px;">📰 ${site}</h2>
      `
      for (const m of siteMentions) {
        html += `
          <div style="margin-bottom: 20px; border-left: 4px solid #C5F23F; padding-left: 15px;">
            <h3 style="margin-bottom: 5px;"><a href="${m.url}" style="color: #000; text-decoration: none;">${m.title}</a></h3>
            <p style="margin: 0; color: #6B6B64; font-size: 14px;">Término: <strong>${m.keyword.term}</strong></p>
            <p style="margin-top: 5px; font-style: italic;">"${m.snippet}"</p>
          </div>
        `
      }
    }
  }

  html += `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E5E0; font-size: 12px; color: #6B6B64;">
        Enviado por Buzzbrand. Organización: ${project.organization.name}
      </div>
    </div>
  `

  const to = project.emailRecipients.map(r => r.email).join(", ")

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Buzzbrand" <hello@buzzbrand.es>',
      to,
      subject,
      html,
    })

    // Create Report Record
    const report = await prisma.emailReport.create({
      data: {
        projectId,
        subject,
        recipientEmails: project.emailRecipients.map(r => r.email),
        status: "sent",
        sentAt: new Date(),
        mentionsCount: mentions.length
      }
    })

    // Mark as sent
    if (mentions.length > 0) {
      const mentionIds = mentions.map(m => m.id)
      await prisma.mention.updateMany({
        where: { id: { in: mentionIds } },
        data: { sentAt: new Date() }
      })
      
      // Link to report
      await prisma.emailReportMention.createMany({
        data: mentionIds.map(mentionId => ({ emailReportId: report.id, mentionId }))
      })
    }

    return { success: true }
  } catch (error: any) {
    console.error("Email error:", error)
    await prisma.emailReport.create({
      data: {
        projectId,
        subject,
        recipientEmails: project.emailRecipients.map(r => r.email),
        status: "failed",
        error: error.message,
        mentionsCount: mentions.length
      }
    })
    return { success: false, error: error.message }
  }
}
