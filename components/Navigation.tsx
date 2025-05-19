'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import { NavigationMenu, NavigationMenuList } from '@/components/ui/navigation-menu';

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const navItems = [
    { href: '/dashboard', label: 'Projects' },
    { href: '/dashboard/analytics', label: 'Analytics' },
  ];

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <NavigationMenu className="flex-none">
          <NavigationMenuList className="h-16 flex items-center">
            <div className="flex items-center gap-6">
              <Button variant="ghost" className="px-0" asChild>
                <Link
                  href="/dashboard"
                  className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent dark:from-white dark:to-gray-500"
                >
                  StarInsight
                </Link>
              </Button>

              <div className="hidden md:flex items-center gap-2">
                {navItems.map(item => (
                  <Button
                    key={item.href}
                    variant={pathname === item.href ? 'secondary' : 'ghost'}
                    asChild
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open('https://github.com/teneous/starinsight', '_blank')}
            className="hover:bg-accent/50"
            title="View on GitHub"
          >
            <Github className="h-5 w-5 text-muted-foreground" />
          </Button>

          <Button variant="ghost" className="text-sm text-muted-foreground" disabled>
            {session.user?.name}
          </Button>

          <Button variant="ghost" onClick={() => signOut()} className="text-sm">
            Sign Out
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden container mx-auto px-4 pb-3">
        <div className="flex flex-col gap-2">
          {navItems.map(item => (
            <Button
              key={item.href}
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              asChild
              className="w-full justify-start"
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
