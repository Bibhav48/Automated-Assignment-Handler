import NextAuth, { DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { CanvasApiClient } from "@/lib/canvas-api"

declare module "next-auth" {
  interface User {
    canvasToken?: string
  }
  interface Session {
    user: {
      canvasToken?: string
    } & DefaultSession["user"]
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Canvas API Key",
      credentials: {
        apiKey: { label: "API Key", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.apiKey) {
          return null
        }

        try {
          const canvasClient = new CanvasApiClient(credentials.apiKey)
          const user = await canvasClient.getUserProfile()
          
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            canvasToken: credentials.apiKey,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.canvasToken = user.canvasToken
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.canvasToken = token.canvasToken as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})

export const { GET, POST } = handler
export const auth = handler.auth
export const signIn = handler.signIn
export const signOut = handler.signOut 