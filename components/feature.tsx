"use client"
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, Clock, Activity, Brain } from 'lucide-react'

import React from 'react'

function Feature() {
  return (
     <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Powerful Features for Better Health
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to take control of your wellness journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Brain,
                title: 'Predictive Analysis & Diagnostics',
                description:
                  'Advanced AI analyzes your health data to predict potential risks and provide early diagnostic insights.',
              },
              {
                icon: Clock,
                title: 'Medical Reminders',
                description: 'Smart reminders for medicines and appointments, keeping you on track with your health routine.',
              },
              {
                icon: Heart,
                title: 'Sleep Schedule',
                description:
                  'Personalized sleep tracking and AI-powered recommendations for better rest and recovery.',
              },
              {
                icon: Activity,
                title: 'Exercise Routines',
                description:
                  'Custom AI-generated fitness plans based on your health data, goals, and current fitness level.',
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="p-8 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50 hover:border-border hover:bg-gradient-to-br hover:from-secondary/60 hover:to-secondary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-background" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
  )
}

export default Feature