import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { neon } from "@neondatabase/serverless";
import { SessionStrategy } from "next-auth";

// Initialize the database client
const sql = neon(process.env.DATABASE_URL!);

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Canvas",
      credentials: {
        apiKey: { label: "Canvas API Key", type: "password" },
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.apiKey) {
          return null;
        }

        // Handle log users
        if (credentials.userType === "log") {
          // For log users, we just need to verify the API key matches our stored one
          const logUsers = await sql`
            SELECT * FROM "User" 
            WHERE "canvasToken" = ${credentials.apiKey} 
            AND "userType" = 'log'
          `;

          if (logUsers.length === 0) {
            return null;
          }

          const user = logUsers[0];
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            userType: "log",
          };
        }

        // Handle Canvas users
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
              INSERT INTO "User" (id, name, email, "canvasToken", "userType", "createdAt", "updatedAt")
              VALUES (
                ${userId}, 
                ${userProfile.name || "Canvas User"}, 
                ${userEmail}, 
                ${apiKey}, 
                'canvas',
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
                "userType" = 'canvas',
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
            userType: "canvas",
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.apiKey = user.canvasToken;
        token.userType = user.userType;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.apiKey = token.apiKey as string;
        session.userType = token.userType as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
