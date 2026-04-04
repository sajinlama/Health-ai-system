import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import prisma from "@/lib/db"

const handler = NextAuth({
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

    async jwt({ token, user, trigger }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! }
        });

        if (dbUser) {
          token.id = dbUser.id;
          // ✅ Check if this was a pre-existing user BEFORE sign-in created them.
          // We detect "existing user" by checking if createdAt differs from updatedAt,
          // or more simply: re-query to see if they existed before this sign-in.
          // Since signIn callback runs first and creates new users, we check
          // if the user was just created (createdAt ≈ updatedAt) or already existed.
          const isNewUser = 
            Math.abs(dbUser.createdAt.getTime() - dbUser.updatedAt.getTime()) < 2000;
          token.isNewUser = isNewUser;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.isNewUser = token.isNewUser as boolean; // optional: expose to client
      }
      return session;
    },

    async redirect({ url, baseUrl, token }: any) {
      // ✅ New user → onboarding, existing user → dashboard
      if (url === baseUrl || url === `${baseUrl}/signin`) {
        return token?.isNewUser 
          ? `${baseUrl}/onboarding` 
          : `${baseUrl}/dashboard`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }