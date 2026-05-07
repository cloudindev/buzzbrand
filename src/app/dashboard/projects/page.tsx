import { getProjects } from "@/app/actions/projects"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-heading text-3xl font-bold">Proyectos</h1>
        <Link href="/dashboard/projects/new" className={buttonVariants()}>Nuevo Proyecto</Link>
      </div>

      {projects.length === 0 ? (
        <Card className="bg-background border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="font-heading text-lg font-bold mb-2">No tienes proyectos</h3>
            <p className="text-muted-foreground mb-6">Crea tu primer proyecto de monitorización.</p>
            <Link href="/dashboard/projects/new" className={buttonVariants()}>Crear Proyecto</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={project.status === "active" ? "default" : "secondary"}>
                    {project.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">{project.createdAt.toLocaleDateString()}</span>
                </div>
                <CardTitle className="font-heading">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2">{project.description || "Sin descripción"}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                <div className="text-sm font-mono text-muted-foreground">
                  Freq: {project.scanFrequency}
                </div>
                <Link href={`/dashboard/projects/${project.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Configurar
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
