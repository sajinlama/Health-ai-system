import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/lib/db"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 15000,
      },
    }),
  ],

  pages: {
    signIn: "/signin",
  },

  callbacks: {
    async jwt({ token, user }) {
      // 🔥 First login
      if (user?.email) {
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        if (!dbUser) {
          console.log("🆕 Creating NEW user:", user.email)

          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              fullName: user.name ?? "User",
              provider: "google",
              providerId: user.id,
            },
          })
        } else {
          console.log("✅ EXISTING user:", user.email)
        }

        token.id = dbUser.id

        const wasJustCreated =
          Date.now() - dbUser.createdAt.getTime() < 5000

        token.isNewUser = wasJustCreated

        console.log("🔑 JWT callback:", {
          email: user.email,
          isNewUser: wasJustCreated,
        })
      }

      // ✅ IMPORTANT: keep existing token values (no overwrite)
      return token
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.isNewUser = token.isNewUser as boolean
      }

      return session
    },
  },
}

// 👇 NextAuth handler
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }