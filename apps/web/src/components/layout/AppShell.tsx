'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, LayoutDashboard, ListPlus, Sparkles, Target, Award, Globe, Building2 } from 'lucide-react';
import { Chatbot } from '../features/chat/Chatbot';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/activities', label: 'Activities', icon: ListPlus },
  { href: '/insights', label: 'Insights', icon: Sparkles },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/tasks', label: 'Tasks', icon: Award },
  { href: '/impact', label: 'Impact', icon: Globe },
  { href: '/city', label: 'City', icon: Building2 },
];

export const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [userName, setUserName] = React.useState('');
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setUserName(localStorage.getItem('userName') || '');

    const protectedRoutes = ['/dashboard', '/activities', '/insights', '/goals', '/tasks', '/impact', '/city', '/profile'];
    if (!token && protectedRoutes.includes(pathname)) {
      window.location.href = '/login';
    }
  }, [pathname]);

  const isLanding = pathname === '/';
  const isAuth = pathname === '/login' || pathname === '/register' || pathname === '/onboarding';
  const initial = userName ? userName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 glass border-b border-white/30 animate-slide-down">
        <div className="max-w-7xl mx-auto px-6 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest to-leaf flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-heading)] text-forest tracking-tight">
              Imprint
            </span>
          </Link>

          {!isAuth && isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-forest/10 text-forest'
                        : 'text-text-secondary hover:text-forest hover:bg-forest/5'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-3">
            {isAuthenticated === null ? null : isAuth ? null : isAuthenticated ? (
              <Link
                href="/profile"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-leaf to-leaf-light flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                {initial}
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link href="/register" className="btn-primary text-sm !px-5 !py-2">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main ─── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative">
        {children}
        {!isAuth && isAuthenticated && <Chatbot />}
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-leaf-pale/30 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} Imprint. Making sustainability personal.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-forest transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-forest transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
