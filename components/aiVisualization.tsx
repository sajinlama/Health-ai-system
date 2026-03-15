import { Heart, Clock, Activity, Brain, Feather } from 'lucide-react'
import React from 'react'

function Aivisualization() {
  return (
    <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">Intelligent AI at Your Service</h2>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                Our advanced machine learning algorithms continuously analyze health patterns and provide actionable insights tailored to your unique needs.
              </p>
              <ul className="space-y-3">
                {[
                  'Real-time health monitoring',
                  'Predictive risk assessment',
                  'Personalized recommendations',
                  'Secure data encryption',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Neural network visualization */}
            <div className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/40 to-secondary/20 border border-border/50 flex items-center justify-center group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              
              {/* Animated neural network nodes */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Center node */}
                <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/50 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                </div>

                {/* Surrounding nodes with pulsing animation */}
                {[...Array(6)].map((_, i) => {
                  const angle = (i * 360) / 6
                  const x = Math.cos((angle * Math.PI) / 180) * 120
                  const y = Math.sin((angle * Math.PI) / 180) * 120
                  return (
                    <div
                      key={i}
                      className="absolute w-10 h-10 rounded-full bg-accent/20 border border-accent/40 animate-pulse"
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  )
                })}

                {/* Connecting lines animation */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(30, 177, 228, 0.3)" />
                      <stop offset="100%" stopColor="rgba(0, 255, 200, 0.3)" />
                    </linearGradient>
                  </defs>
                  {[...Array(6)].map((_, i) => {
                    const angle = (i * 360) / 6
                    const x = Math.cos((angle * Math.PI) / 180) * 120 + 192
                    const y = Math.sin((angle * Math.PI) / 180) * 120 + 192
                    return (
                      <line
                        key={i}
                        x1="192"
                        y1="192"
                        x2={x}
                        y2={y}
                        stroke="url(#line-gradient)"
                        strokeWidth="2"
                        opacity="0.4"
                      />
                    )
                  })}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

export default Aivisualization