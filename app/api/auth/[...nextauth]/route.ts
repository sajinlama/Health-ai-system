import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/db";

const handler = NextAuth({
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
    async signIn({ user }) {
      if (!user.email) return false;

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!existingUser) {
        console.log("🆕 Creating NEW user:", user.email);

        await prisma.user.create({
          data: {
            email: user.email,
            fullName: user.name ?? "User",
            provider: "google",
            providerId: user.id,
          },
        });
      } else {
        console.log("✅ EXISTING user:", user.email);
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (dbUser) {
          token.id = dbUser.id;

          const wasJustCreated =
            Date.now() - dbUser.createdAt.getTime() < 5000;

          token.isNewUser = wasJustCreated;

          console.log("🔑 JWT callback:", {
            email: user.email,
            isNewUser: wasJustCreated,
          });
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.isNewUser = token.isNewUser;
      }

      return session;
    },
  },
});

export { handler as GET, handler as POST };