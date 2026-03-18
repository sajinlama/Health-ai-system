import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/lib/db"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    })
  ],
  
  pages: {
    signIn: "/signin", 
  },

  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email,
            fullName: user.name ?? "User",
            provider: "google",
            providerId: user.id,
          }
        })
      }

      return true
    },

    // ✅ ADD THIS: JWT callback (IMPORTANT for JWT strategy!)
    async jwt({ token, user, account }) {
      // When user signs in, add their DB id to the token
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
        }
      }
      return token;
    },

    // ✅ UPDATED: Session callback
    async session({ session, token }) {
      // Add user id from token to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url === baseUrl) {
        return `${baseUrl}/onboarding`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
}