"use client"

import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function Navbar() {

  const pathname = usePathname()

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-background/40 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Heart className="w-5 h-5 text-background" />
          </div>

          <Link href="/">
            <span className="text-xl font-bold text-foreground hover:cursor-pointer">
              Bluesh
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-6">

          {pathname === "/" ? (
            <Link
              href="/features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
          ) : (
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
          )}

          <Button
            className="bg-primary hover:bg-primary/90 text-background"
            onClick={() => signIn()}
          >
            Sign In
          </Button>

        </div>
      </div>
    </nav>
  )
}

export default Navbar