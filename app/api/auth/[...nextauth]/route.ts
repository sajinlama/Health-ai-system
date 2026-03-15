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

  callbacks: {
    async signIn({ user }) {
      if(!user.email){
        return false;
      }
      console.log(user)

      const existingUser = await prisma.user.findUnique({
        where: {
          email: user.email!,
        },
      })

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email!,
            fullName: user.name!,
            provider: "google"
          }
        })
      }

      return true
    }
  }
})

export { handler as GET, handler as POST }