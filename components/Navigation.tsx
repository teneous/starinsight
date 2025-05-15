'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

export default function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()

  if (!session) return null

  const navItems = [
    { href: '/dashboard', label: 'Projects' },
    { href: '/dashboard/analytics', label: 'Analytics' }
  ]

  return (
    <nav className="bg-card border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent dark:from-white dark:to-gray-500">
              StarInsight
            </Link>
            
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-primary/10 text-primary dark:text-white dark:bg-white/10'
                        : 'text-muted-foreground hover:bg-primary/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{session.user?.name}</span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        <div className="md:hidden">
          <div className="flex flex-col space-y-2 pb-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-primary/10 text-primary dark:text-white dark:bg-white/10'
                    : 'text-muted-foreground hover:bg-primary/5 dark:hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
} 