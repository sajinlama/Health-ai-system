"use client"

import { signIn } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { Brain, ShieldCheck, Activity, Sparkles } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect } from "react"

export default function SignInPage() {
    const session =useSession();
    console.log(session);
    useEffect(()=>{

    }),[]
  return (
    <main className="min-h-screen flex items-center pt-20 px-6 relative bg-background">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      {/* Grid container */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center w-full relative z-10">

        {/* LEFT SIDE */}
        <div className="space-y-6">

          <div className="inline-block px-4 py-2 rounded-full bg-secondary/60 border border-border/50 backdrop-blur-sm">
            <span className="text-sm text-muted-foreground">
              Welcome to Bluesh
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Your AI Companion for
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}Better Health
            </span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-md">
            Sign in to access personalized health insights, predictive diagnostics,
            and AI-powered recommendations designed just for you.
          </p>

          {/* GOOGLE BUTTON */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="flex items-center gap-3 w-64 px-6 py-3 hover:cursor-pointer bg-white text-gray-800 font-semibold rounded shadow hover:shadow-md transition-shadow border border-gray-200"
          >
            {/* Google Logo */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-5 h-5"
            >
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.4 0 19.2-7.6 19.2-20 0-1.3-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.2C29.4 35.1 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.5 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 3-3.1 5.3-6 6.9l6.3 5.2C39.7 36.6 44 31 44 24c0-1.3-.1-2.4-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>

        </div>

        {/* RIGHT SIDE - Highlighted */}
        <div className="grid gap-6 h-full p-6 rounded-xl bg-secondary/30 border border-border/50 backdrop-blur-sm">

          <Card className="p-6 bg-transparent border-none hover:bg-secondary/60 transition-colors">
            <div className="flex items-start gap-4">
              <Brain className="text-primary w-6 h-6" />
              <div>
                <h3 className="font-semibold text-lg mb-1">AI-Powered Insights</h3>
                <p className="text-muted-foreground text-sm">
                  Smart AI analyzes your health patterns and provides
                  personalized recommendations.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-transparent border-none hover:bg-secondary/60 transition-colors">
            <div className="flex items-start gap-4">
              <Activity className="text-primary w-6 h-6" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Real-Time Monitoring</h3>
                <p className="text-muted-foreground text-sm">
                  Track health metrics and receive insights instantly
                  to stay proactive.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-transparent border-none hover:bg-secondary/60 transition-colors">
            <div className="flex items-start gap-4">
              <ShieldCheck className="text-primary w-6 h-6" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Secure & Private</h3>
                <p className="text-muted-foreground text-sm">
                  Your data is encrypted with enterprise-level security.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-transparent border-none hover:bg-secondary/60 transition-colors">
            <div className="flex items-start gap-4">
              <Sparkles className="text-primary w-6 h-6" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Smart Recommendations</h3>
                <p className="text-muted-foreground text-sm">
                  Daily insights for sleep, nutrition, and lifestyle improvements.
                </p>
              </div>
            </div>
          </Card>

        </div>

      </div>
    </main>
  )
}