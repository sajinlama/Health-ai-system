"use client"

import { Button } from '@/components/ui/button'
import Link from 'next/link'

function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-block mb-6 px-4 py-2 rounded-full bg-secondary/60 border border-border/50 backdrop-blur-sm">
          <span className="text-sm text-muted-foreground">✨ Next Generation Healthcare</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
          AI-Powered Health Recommendations,{' '}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Personalized for You
          </span>
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Experience the future of healthcare with intelligent AI-driven insights. Get predictive diagnostics, smart reminders, and personalized health plans designed just for you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signin" passHref>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-background font-semibold px-8 hover:cursor-pointer">
              Get Started
            </Button>
          </Link>

          <Link href="/features" passHref>
            <Button
              size="lg"
              variant="outline"
              className="border-border/50 hover:bg-secondary/50 font-semibold px-8 bg-transparent hover:cursor-pointer"
            >
              View Features
            </Button>
          </Link>
        </div>

        {/* Floating stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
          {[
            { label: 'Users', value: '500K+' },
            { label: 'Health Insights', value: '1M+' },
            { label: 'Accuracy', value: '99.8%' },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-lg bg-secondary/40 border border-border/50 backdrop-blur-sm hover:bg-secondary/60 transition-colors">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero