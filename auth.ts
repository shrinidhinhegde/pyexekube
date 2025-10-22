import NextAuth from "next-auth"
import CognitoProvider from "next-auth/providers/cognito"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!,
      authorization: {
          params: {
              scope: "openid email profile",
          },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, trigger, session }) {
      if (trigger === "update") {
        token.name = session.name
        token.picture = session.image
      }

      if (account) {
        token.accessToken = account.access_token
        token.idToken = account.id_token
      }

      // Extract sub from Cognito profile and store as user id
      if (profile?.sub) {
        token.sub = profile.sub
      }

      return token
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken as string
      (session as any).idToken = token.idToken
      
      // Add the sub as user.id to the session
      if (token.sub) {
        (session.user as any).id = token.sub
      }
      
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
})
