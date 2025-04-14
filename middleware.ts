import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Define protected paths
  const isProtectedPath = request.nextUrl.pathname.startsWith("/dashboard")
  const isAuthPath = request.nextUrl.pathname.startsWith("/login")

  // Redirect logic
  if (isProtectedPath && !isAuthenticated) {
    // Redirect to login if trying to access protected route while not authenticated
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthPath && isAuthenticated) {
    // Redirect to dashboard if trying to access login while authenticated
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
