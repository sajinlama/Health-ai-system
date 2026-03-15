'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, Clock, Activity, Brain, Feather } from 'lucide-react'
import { useEffect, useState } from 'react'
import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import Aivisualization from '@/components/aiVisualization'
import Cta from '@/components/cta'
import Footer from '@/components/footer'
export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary overflow-hidden">
      <Navbar/>
      <Hero/>
     <Feather/>
     <Aivisualization/>
     <Cta/>
     <Footer/>
      
    </div>
  )
}
