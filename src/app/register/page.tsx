"use client"

import { useActionState, useEffect } from "react"
import { registerUser } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      router.push("/login?registered=true")
    }
  }, [state, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>
            Únete a Buzzbrand y monitoriza tu marca.
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
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            
            {state?.error && (
              <div className="text-destructive text-sm font-medium">{state.error}</div>
            )}
            
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
