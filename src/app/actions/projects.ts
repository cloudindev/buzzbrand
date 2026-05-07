"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const projectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  scanFrequency: z.string().default("daily"),
  deliveryTime: z.string().default("08:00"),
  timezone: z.string().default("Europe/Madrid"),
})

export async function createProject(prevState: any, formData: FormData) {
  const session = await auth()
  const organizationId = (session?.user as any)?.organizationId

  if (!organizationId) {
    return { error: "No autorizado" }
  }

  const data = Object.fromEntries(formData.entries())
  const parsed = projectSchema.safeParse(data)

  if (!parsed.success) {
    return { error: "Datos inválidos" }
  }

  try {
    await prisma.project.create({
      data: {
        ...parsed.data,
        organizationId,
      }
    })
    revalidatePath("/dashboard/projects")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Error al crear proyecto" }
  }
}

export async function getProjects() {
  const session = await auth()
  const organizationId = (session?.user as any)?.organizationId

  if (!organizationId) {
    return []
  }

  return await prisma.project.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" }
  })
}
