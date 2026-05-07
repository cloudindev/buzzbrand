import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Initialize Prisma Client in a separate file
// src/lib/prisma.ts

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await prisma.user.findUnique({ where: { email } })
          if (!user || !user.passwordHash) return null

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash)
          if (passwordsMatch) {
            // Fetch membership to inject organizationId into session
            const membership = await prisma.membership.findFirst({
              where: { userId: user.id },
              include: { organization: true }
            })
            return {
              ...user,
              organizationId: membership?.organizationId || null,
              role: membership?.role || null,
            }
          }
        }
        return null
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.organizationId = (user as any).organizationId
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).organizationId = token.organizationId;
        (session.user as any).role = token.role;
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  }
})
