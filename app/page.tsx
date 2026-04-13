'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, Clock, Activity, Brain, Feather } from 'lucide-react'

import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import Aivisualization from '@/components/aiVisualization'
import Cta from '@/components/cta'
import Footer from '@/components/footer'

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)

  const { data: session, status } = useSession()
  const router = useRouter()

  // scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 🔥 REDIRECT LOGIC
  useEffect(() => {
    if (status === 'loading') return

    if (!session) return // not logged in → stay on home

    if (session.user?.isNewUser) {
      router.push('/onboarding')
    } else {
      router.push('/dashboard')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary overflow-hidden">
      <Navbar />
      <Hero />
      <Feather />
      <Aivisualization />
      <Cta />
      <Footer />
    </div>
  )
}