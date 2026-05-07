"use client"

import { useActionState, useEffect, useState } from "react"
import { registerUser } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, null)
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (state?.success) {
      router.push("/login?registered=true")
    }
  }, [state, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 flex-col gap-6">
      <Link href="/" className="font-heading text-3xl font-bold tracking-tight hover:opacity-80 transition-opacity">
        buzzbrand
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>
            Únete a buzzbrand y monitoriza tu marca.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Nombre de la Organización</Label>
              <Input id="organizationName" name="organizationName" required placeholder="Ej. Mi Empresa S.L." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" name="email" type="email" required placeholder="tu@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  minLength={6} 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  </span>
                </Button>
              </div>
            </div>
            
            {state?.error && (
              <div className="text-destructive text-sm font-medium">{state.error}</div>
            )}
            
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4 mt-2">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
