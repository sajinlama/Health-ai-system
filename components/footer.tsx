import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, Clock, Activity, Brain, Feather } from 'lucide-react'
import { useEffect, useState } from 'react'
function Footer() {
  return (
    <div>
        <footer className="py-12 px-6 border-t border-border/50 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {[
              {
                title: 'Core Features',
                links: ['Predictive Analysis & Diagnostics', 'Medical Reminders', 'Sleep Schedule', 'Exercise Routines'],
              },
              {
                title: 'Resources',
                links: ['Documentation', 'API', 'Community', 'Support'],
              },
            ].map((group, i) => (
              <div key={i}>
                <h4 className="font-semibold text-foreground mb-4">{group.title}</h4>
                <ul className="space-y-2">
                  {group.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Heart className="w-4 h-4 text-background" />
              </div>
              <span className="font-bold text-foreground">Bluesh</span>
            </div>
            <p className="text-muted-foreground text-sm">© 2026 Bluesh. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </div>
  )
}

export default Footer