import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { neon } from "@neondatabase/serverless";

// Initialize the database client
const sql = neon(process.env.DATABASE_URL!);

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Canvas",
      credentials: {
        apiKey: { label: "Canvas API Key", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.apiKey) {
          return null;
        }

        try {
          // Validate the API key by making a request to Canvas API
          const apiUrl = process.env.CANVAS_API_URL;
          const apiKey = credentials.apiKey;

          const response = await fetch(`${apiUrl}/users/self`, {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            console.error(
              "Canvas API validation failed:",
              await response.text()
            );
            return null;
          }

          const userProfile = await response.json();

          if (!userProfile || !userProfile.id) {
            return null;
          }

          // Create or update user in our database
          const userId = `canvas_${userProfile.id}`;
          const userEmail =
            userProfile.email || `${userProfile.id}@canvas.user`;

          // Check if user exists
          const existingUsers = await sql`
            SELECT * FROM "User" WHERE id = ${userId}
          `;

          if (existingUsers.length === 0) {
            // Create new user
            await sql`
              INSERT INTO "User" (id, name, email, "canvasToken", "createdAt", "updatedAt")
              VALUES (
                ${userId}, 
                ${userProfile.name || "Canvas User"}, 
                ${userEmail}, 
                ${apiKey}, 
                ${new Date().toISOString()}, 
                ${new Date().toISOString()}
              )
            `;
          } else {
            // Update existing user
            await sql`
              UPDATE "User" 
              SET 
                name = ${userProfile.name || "Canvas User"}, 
                "canvasToken" = ${apiKey}, 
                "updatedAt" = ${new Date().toISOString()}
              WHERE id = ${userId}
            `;
          }

          return {
            id: userId,
            name: userProfile.name,
            email: userEmail,
            image: userProfile.avatar_url,
            canvasToken: apiKey,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.apiKey = user.canvasToken;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.apiKey = token.apiKey as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
