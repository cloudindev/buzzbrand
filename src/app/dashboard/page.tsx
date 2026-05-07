import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getProjects } from "@/app/actions/projects"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export default async function DashboardPage() {
  const projects = await getProjects()
  const session = await auth()
  const organizationId = (session?.user as any)?.organizationId

  // Fetch some stats
  const totalKeywords = await prisma.keyword.count({
    where: { project: { organizationId } }
  })
  
  const totalSites = await prisma.sourceSite.count({
    where: { project: { organizationId } }
  })

  const recentMentions = await prisma.mention.count({
    where: { 
      organizationId,
      detectedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold">Resumen</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-mono">Proyectos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-mono">Sitios Vigialdos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSites}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-mono">Términos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalKeywords}</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary font-mono">Menciones (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{recentMentions}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-md">
            No hay menciones recientes. Añade palabras clave y ejecuta un escaneo.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
