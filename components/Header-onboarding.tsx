import { Brain } from 'lucide-react'
import React from 'react'


function HeaderOnboarding() {
  return (
  <div className="text-center mb-16">
          <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg mb-4">
            <Brain className="text-white w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Set Up Your Health Profile</h1>
          <p className="text-muted-foreground">
            Tell us about yourself for personalized AI health insights
          </p>
        </div>
  )
}

export default HeaderOnboarding