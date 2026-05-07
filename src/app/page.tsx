import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-heading text-2xl font-bold tracking-tight">Buzzbrand</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium hover:text-muted-foreground transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/register" className={buttonVariants({ className: "font-mono uppercase tracking-wider text-xs" })}>
              Empezar
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 sm:py-32 bg-background border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-heading text-5xl sm:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              Monitoriza tu marca en los medios.
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto font-sans">
              Un clipping diario, limpio y accionable, directamente en tu email.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register" className={buttonVariants({ size: "lg", className: "font-mono uppercase tracking-wider text-sm px-8" })}>
                Crear Proyecto
              </Link>
              <Link href="#how-it-works" className={buttonVariants({ variant: "outline", size: "lg", className: "font-mono uppercase tracking-wider text-sm px-8 bg-card text-foreground border-border" })}>
                Ver cómo funciona
              </Link>
            </div>
          </div>
        </section>

        {/* Features / How it works */}
        <section id="how-it-works" className="py-24 bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="font-mono text-xs text-muted-foreground">01</div>
                <h3 className="font-heading text-2xl font-bold">Añade tus términos</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Configura las palabras clave, nombres de marca o frases exactas que quieres monitorizar en internet.
                </p>
              </div>
              <div className="space-y-4">
                <div className="font-mono text-xs text-muted-foreground">02</div>
                <h3 className="font-heading text-2xl font-bold">Selecciona los medios</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Apunta a los sitios web, blogs o portales de noticias específicos que deseas vigilar mediante scraping HTML o RSS.
                </p>
              </div>
              <div className="space-y-4">
                <div className="font-mono text-xs text-muted-foreground">03</div>
                <h3 className="font-heading text-2xl font-bold">Recibe el clipping</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Obtén un resumen diario y editorial en tu bandeja de entrada solo con las menciones nuevas encontradas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 bg-background border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
            <div>
              <h2 className="font-heading text-4xl font-bold mb-6">Sin costes de IA ocultos</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Buzzbrand utiliza un motor de búsqueda local robusto basado en normalización de texto y expresiones regulares. No necesitas pagar por tokens de IA para saber si hablan de ti.
              </p>
            </div>
            <div>
              <h2 className="font-heading text-4xl font-bold mb-6">Scraping ligero + detección local</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Nuestro scraper lee RSS y HTML puro, siendo respetuoso con los medios y detectando contenido relevante sin sobrecargar servidores.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-heading text-xl font-bold">Buzzbrand</div>
          <div className="text-sm text-muted-foreground font-mono">
            © {new Date().getFullYear()} Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
