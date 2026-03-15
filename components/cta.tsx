'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, Clock, Activity, Brain, Feather } from 'lucide-react'
function Cta() {
  return (
     <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary/20 to-accent/20 border border-border/50 p-12 md:p-16 text-center backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Ready to Transform Your Health?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already experiencing personalized, AI-powered health recommendations.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-background font-semibold px-10 hover:cursor-pointer">
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </section>
  )
}

export default Cta