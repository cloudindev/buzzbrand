import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="font-heading font-bold text-xl">buzzbrand</span>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-2 rounded-md hover:bg-muted font-sans text-sm font-medium">Resumen</Link>
          <Link href="/dashboard/projects" className="block px-4 py-2 rounded-md hover:bg-muted font-sans text-sm font-medium">Proyectos</Link>
          <Link href="/dashboard/mentions" className="block px-4 py-2 rounded-md hover:bg-muted font-sans text-sm font-medium">Menciones</Link>
          <Link href="/dashboard/settings" className="block px-4 py-2 rounded-md hover:bg-muted font-sans text-sm font-medium">Configuración</Link>
        </nav>
        <div className="p-4 border-t border-border">
          <div className="text-xs font-mono text-muted-foreground truncate">{session.user.email}</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center px-6 md:hidden">
          <span className="font-heading font-bold text-xl">buzzbrand</span>
        </header>
        <div className="flex-1 p-6 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
