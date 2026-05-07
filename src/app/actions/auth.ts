"use server"

import { z } from "zod"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  organizationName: z.string().min(2)
})

export async function registerUser(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData.entries())
  const parsed = registerSchema.safeParse(data)

  if (!parsed.success) {
    return { error: "Datos inválidos" }
  }

  const { email, password, organizationName } = parsed.data

  // Check existing
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { error: "El correo ya está registrado" }
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10)
    
    // Create User, Organization and Membership
    const slug = organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4)
    
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
        }
      })
      
      const org = await tx.organization.create({
        data: {
          name: organizationName,
          slug
        }
      })
      
      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: "OWNER"
        }
      })
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Error al crear la cuenta" }
  }
}
