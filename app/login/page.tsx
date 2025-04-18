"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { gsap } from "gsap"
import Disclaimer from "@/components/disclaimer"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { status } = useSession()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const [isGuestLogin, setIsGuestLogin] = useState(false)

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (status === "authenticated") {
      router.push("/dashboard")
    }

    // Handle errors from NextAuth
    if (error) {
      let errorMessage = "Authentication failed. Please try again."

      if (error === "CredentialsSignin") {
        errorMessage = "Invalid Canvas API key. Please check and try again."
        setApiKeyError(errorMessage)
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [error, router, status, toast])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset previous errors
    setApiKeyError(null)
    
    // For guest login, use the demo API key
    const finalApiKey = isGuestLogin ? process.env.NEXT_PUBLIC_DEMO_CANVAS_API_KEY : apiKey
    
    // Validate API key format (simple validation)
    if (!isGuestLogin && apiKey.length < 8) {
      setApiKeyError("API key seems too short. Please check and try again.")
      return
    }
    
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        apiKey: finalApiKey,
        redirect: false,
      })

      if (result?.error) {
        const errorMsg = "Invalid Canvas API key. Please check and try again."
        setApiKeyError(errorMsg)
        toast({
          title: "Authentication failed",
          description: errorMsg,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Login successful",
          description: "Welcome to the Automated Assignment Handler!",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      const errorMsg = "An unexpected error occurred. Please try again later."
      setApiKeyError(errorMsg)
      toast({
        title: "An error occurred",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setIsLoading(true)
    setIsGuestLogin(true)
    setApiKeyError(null)

    try {
      const response = await fetch('/api/auth/guest-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Guest login failed')
      }

      // Sign in with the user data from the API
      const result = await signIn("credentials", {
        apiKey: data.user.canvasToken,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Guest login successful",
        description: "Welcome to the Automated Assignment Handler!",
      })
      router.push("/dashboard")
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred. Please try again later."
      setApiKeyError(errorMsg)
      toast({
        title: "Authentication failed",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md login-card">
        <CardHeader className="space-y-1">
          <p className="flex items-center justify-center mb-1">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="lucide lucide-notebook-pen text-white"
            >
              <path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/>
              <path d="M2 6h4"/>
              <path d="M2 10h4"/>
              <path d="M2 14h4"/>
              <path d="M2 18h4"/>
              <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/>
            </svg>
          </p>
          <CardTitle className="text-2xl font-bold text-center mb-1">Instant Assignments</CardTitle>
          <CardDescription className="text-center flex flex-col items-center justify-center text-sm text-muted-foreground">
            <p className="mb-4">
            Automate your Assignments - Homeworks? No more!
            </p>
          </CardDescription>
          <Disclaimer />
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="apiKey">Canvas API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Canvas API key"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value)
                    // Clear error when user types
                    if (apiKeyError) setApiKeyError(null)
                    // Disable guest login if user enters their own API key
                    if (e.target.value) setIsGuestLogin(false)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                  className={apiKeyError ? "border-red-500 focus-visible:ring-red-500" : ""}
                  required={!isGuestLogin}
                  disabled={isGuestLogin}
                />
                {apiKeyError && (
                  <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
                    <AlertCircle size={16} />
                    <span>{apiKeyError}</span>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Guest Login"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-sm text-muted-foreground text-center mt-2">
            Don&apos;t have an API key? You can generate one in your <Link href="https://www.instructure.com/canvas/login" className="text-blue-600">Canvas account</Link> settings.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}