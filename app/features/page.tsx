'use client'

import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, Clock, Activity, Brain, Zap, Shield, TrendingUp, Bell } from 'lucide-react'
import { useState } from 'react'

const features = [
  {
    id: 'predictive',
    icon: Brain,
    title: 'Predictive Analysis & Diagnostics',
    description: 'Advanced AI analyzes your health data to predict potential risks and provide early diagnostic insights.',
    benefits: [
      'Early detection of health risks',
      'Personalized health risk assessments',
      'AI-powered diagnostic recommendations',
      'Real-time health pattern analysis',
    ],
  },
  {
    id: 'reminders',
    icon: Bell,
    title: 'Smart Medical Reminders',
    description: 'Never miss a dose or appointment with intelligent reminders tailored to your schedule.',
    benefits: [
      'Medication adherence tracking',
      'Appointment reminders and notifications',
      'Custom reminder schedules',
      'Integration with your calendar',
    ],
  },
  {
    id: 'sleep',
    icon: Clock,
    title: 'Sleep Schedule Optimization',
    description: 'Personalized sleep tracking and AI-powered recommendations for better rest and recovery.',
    benefits: [
      'Sleep quality monitoring',
      'AI-optimized sleep schedules',
      'Sleep debt tracking',
      'Recovery recommendations',
    ],
  },
  {
    id: 'exercise',
    icon: Activity,
    title: 'Personalized Exercise Routines',
    description: 'Custom AI-generated fitness plans based on your health data, goals, and current fitness level.',
    benefits: [
      'Tailored workout plans',
      'Progressive difficulty scaling',
      'Real-time performance tracking',
      'Recovery guidance and rest days',
    ],
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Enterprise-Grade Security',
    description: 'Your health data is protected with military-grade encryption and compliance standards.',
    benefits: [
      'End-to-end encryption',
      'HIPAA compliance',
      'Data privacy controls',
      'Regular security audits',
    ],
  },
  {
    id: 'insights',
    icon: TrendingUp,
    title: 'Actionable Health Insights',
    description: 'Get meaningful analytics and trends about your health journey with clear visualizations.',
    benefits: [
      'Health trend analysis',
      'Progress tracking dashboards',
      'Personalized recommendations',
      'Data-driven insights',
    ],
  },
]

export default function FeaturesPage() {
  const [selectedFeature, setSelectedFeature] = useState<string>('predictive')

  const activeFeature = features.find((f) => f.id === selectedFeature)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary overflow-hidden">
      {/* Navigation */}
      <Navbar/>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Animated Background Elements - Creates visual depth */}
        {/* This container holds the pulsing gradient orbs for visual appeal */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Right accent orb - Cyan/accent color pulsing at default speed */}
          <div className="absolute top-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-30 animate-pulse" />
          {/* Left primary orb - Blue/primary color with 1s animation delay for staggered effect */}
          <div className="absolute bottom-40 left-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
            Features Built for Your{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Health Journey
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Discover the comprehensive suite of AI-powered tools designed to help you achieve your wellness goals.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setSelectedFeature(feature.id)}
                className="group text-left"
              >
                <Card
                  className={`p-8 transition-all duration-300 h-full ${
                    selectedFeature === feature.id
                      ? 'bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-lg shadow-primary/20'
                      : 'bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50 hover:border-border hover:bg-gradient-to-br hover:from-secondary/60 hover:to-secondary/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center transition-all ${
                    selectedFeature === feature.id
                      ? 'bg-gradient-to-br from-primary to-accent'
                      : 'bg-gradient-to-br from-primary/50 to-accent/50 group-hover:from-primary group-hover:to-accent'
                  }`}>
                    <feature.icon className="w-6 h-6 text-background" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </button>
            ))}
          </div>

          {/* Feature Details */}
          {activeFeature && (
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/40 to-secondary/20 border border-border/50 p-12 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <div className="relative z-10">
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <activeFeature.icon className="w-8 h-8 text-background" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-foreground mb-2">{activeFeature.title}</h2>
                    <p className="text-lg text-muted-foreground">{activeFeature.description}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4">Key Benefits</h3>
                    <ul className="space-y-3">
                      {activeFeature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Feature visualization - Static circular elements for visual appeal */}
                  <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50 flex items-center justify-center group">
                    {/* Background gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                    
                    {/* Central pulsing icon with animated container */}
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Main central element with pulse animation */}
                      <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/50 flex items-center justify-center animate-pulse">
                        <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
                          <activeFeature.icon className="w-8 h-8 text-primary" />
                        </div>
                      </div>

                      {/* Static orbiting elements positioned in fixed angles */}
                      {/* Top element at 0 degrees */}
                      <div className="absolute w-8 h-8 rounded-full bg-accent/30 border border-accent/50" style={{ transform: 'translate(0px, -80px)' }} />
                      {/* Bottom-left element at 120 degrees */}
                      <div className="absolute w-8 h-8 rounded-full bg-accent/30 border border-accent/50" style={{ transform: 'translate(-69.28px, 40px)' }} />
                      {/* Bottom-right element at 240 degrees */}
                      <div className="absolute w-8 h-8 rounded-full bg-accent/30 border border-accent/50" style={{ transform: 'translate(69.28px, 40px)' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              How Bluesh Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, intelligent, and powered by advanced AI
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Connect Your Data',
                description: 'Securely sync your health data and personal information',
              },
              {
                step: '02',
                title: 'AI Analysis',
                description: 'Our AI processes your data to identify patterns and risks',
              },
              {
                step: '03',
                title: 'Get Insights',
                description: 'Receive personalized recommendations tailored to you',
              },
              {
                step: '04',
                title: 'Take Action',
                description: 'Follow recommendations and track your health progress',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <Card className="p-8 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50 h-full">
                  <div className="text-4xl font-bold text-primary mb-4 opacity-50">{item.step}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>

                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary to-accent transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Why Choose Bluesh
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Superior intelligence, security, and user experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'AI-First Approach',
                items: [
                  'Machine learning models trained on millions of health records',
                  'Continuous learning and model improvements',
                  'Predictive capabilities beyond simple tracking',
                ],
              },
              {
                title: 'Enterprise Security',
                items: [
                  'Military-grade encryption for all data',
                  'HIPAA, GDPR, and SOC 2 compliant',
                  'Zero-knowledge architecture',
                ],
              },
              {
                title: 'User-Centric Design',
                items: [
                  'Intuitive interface with powerful features',
                  '24/7 customer support',
                  'Seamless integration with popular health apps',
                ],
              },
            ].map((section, i) => (
              <Card key={i} className="p-8 bg-gradient-to-br from-secondary/40 to-secondary/20 border-border/50 hover:from-secondary/60 hover:to-secondary/30 transition-all">
                <h3 className="text-2xl font-semibold text-foreground mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
     <Footer/>
    </div>
  )
}
