// components/ui/Navbar.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';

const colors = {
  cream: '#F8F3EA',
  navy: '#0B1957',
  peach: '#FFDBD1',
  pink: '#FA9EBC'
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Profile', path: '/profile' },
    { name: 'Items', path: '/items' },
    { name: 'Try-On', path: '/try-on' },
  ];

  return (
    <nav className="border-b" style={{ backgroundColor: 'white', borderColor: colors.peach }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <button
            onClick={() => router.push('/')}
            className="text-2xl font-black"
            style={{ color: colors.navy }}
          >
            FitCheck
          </button>

          {/* Nav Links */}
          <div className="flex gap-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
                style={{
                  backgroundColor: pathname === item.path ? colors.navy : 'transparent',
                  color: pathname === item.path ? 'white' : colors.navy,
                }}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ backgroundColor: colors.peach }}
            >
              <svg className="w-5 h-5" style={{ color: colors.navy }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}