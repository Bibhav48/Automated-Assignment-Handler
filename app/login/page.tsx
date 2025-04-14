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

export default function LoginPage() {
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { status } = useSession()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

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
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }

    // Animation
    gsap.from(".login-card", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    })
  }, [error, router, status, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        apiKey,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Authentication failed",
          description: "Please check your Canvas API key and try again.",
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
      toast({
        title: "An error occurred",
        description: "Please try again later.",
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
          <CardTitle className="text-2xl font-bold text-center">Automated Assignment Handler</CardTitle>
          <CardDescription className="text-center">
            Enter your Canvas API key to access your assignments
          </CardDescription>
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
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-sm text-muted-foreground text-center mt-2">
            Don&apos;t have an API key? You can generate one in your Canvas account settings.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
