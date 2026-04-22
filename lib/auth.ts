import { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/lib/db"

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: { timeout: 15000 },
    }),
  ],

  pages: {
    signIn: "/signin",
  },

 callbacks: {
  async jwt({ token, user }) {
    // First login
    if (user?.email) {
      let dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      // Create if not exists
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: user.email,
            fullName: user.name ?? "User",
            provider: "google",
            providerId: user.id,
          },
        })
      }

      console.log("this the user id",dbUser);
      // Attach DB id
      token.id = dbUser.id
    }

    return token
  },

  async session({ session, token }) {
    if (session.user && token.id) {
      session.user.id = token.id as string
    }
    return session
  },
}
}