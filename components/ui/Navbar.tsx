// components/ui/Navbar.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useState } from 'react';

const colors = {
  cream: '#F8F3EA',
  navy: '#0B1957',
  peach: '#FFDBD1',
  pink: '#FA9EBC'
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    router.push('/login');
  };

  // Don't show navbar on login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <nav className="border-b" style={{ backgroundColor: 'white', borderColor: colors.peach }}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <button 
            onClick={() => router.push('/')}
            className="text-2xl font-black transition-opacity hover:opacity-80"
            style={{ color: colors.navy }}
          >
            FitCheck
          </button>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push('/')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isActive('/') ? 'font-bold' : ''
              }`}
              style={{
                backgroundColor: isActive('/') ? colors.peach : 'transparent',
                color: colors.navy,
              }}
            >
              Home
            </button>
            
            <button
              onClick={() => router.push('/profile')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isActive('/profile') ? 'font-bold' : ''
              }`}
              style={{
                backgroundColor: isActive('/profile') ? colors.peach : 'transparent',
                color: colors.navy,
              }}
            >
              Profile
            </button>

            <button
              onClick={() => router.push('/items')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isActive('/items') ? 'font-bold' : ''
              }`}
              style={{
                backgroundColor: isActive('/items') ? colors.peach : 'transparent',
                color: colors.navy,
              }}
            >
              Wardrobe
            </button>

            <button
              onClick={() => router.push('/try-on')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isActive('/try-on') ? 'font-bold' : ''
              }`}
              style={{
                backgroundColor: isActive('/try-on') ? colors.peach : 'transparent',
                color: colors.navy,
              }}
            >
              Try-On
            </button>
          </div>

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:opacity-80"
                style={{ backgroundColor: colors.cream }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ backgroundColor: colors.pink, color: colors.navy }}
                >
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden md:block" style={{ color: colors.navy }}>
                  {user.email}
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  style={{ color: colors.navy }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg border-2 overflow-hidden z-50"
                  style={{ backgroundColor: 'white', borderColor: colors.peach }}
                >
                  <div className="p-3 border-b" style={{ borderColor: colors.peach }}>
                    <p className="text-xs font-semibold" style={{ color: colors.navy, opacity: 0.6 }}>
                      Signed in as
                    </p>
                    <p className="text-sm font-bold truncate" style={{ color: colors.navy }}>
                      {user.email}
                    </p>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push('/profile');
                      }}
                      className="w-full px-3 py-2 rounded-lg text-left text-sm font-medium transition-all hover:opacity-80"
                      style={{ backgroundColor: colors.cream, color: colors.navy }}
                    >
                      ⚙️ Settings
                    </button>
                  </div>

                  <div className="p-2 border-t" style={{ borderColor: colors.peach }}>
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full px-3 py-2 rounded-lg text-left text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-50"
                      style={{ backgroundColor: colors.pink, color: colors.navy }}
                    >
                      {loggingOut ? '🔄 Logging out...' : '🚪 Logout'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: colors.navy, color: 'white' }}
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
}