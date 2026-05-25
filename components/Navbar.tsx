'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: '🎯 สุ่มเมนู', path: '/' },
    { name: '📚 คลังเมนู', path: '/menus' },
    { name: '➕ เพิ่มเมนู', path: '/add-menu' },
    { name: '📜 ประวัติการกิน', path: '/history' },
  ];

  return (
    <nav className="bg-slate-900 text-white border-b border-blue-500/30 sticky top-0 z-50 shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            BetterBlue
          </span>
          <span className="bg-yellow-400 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
            Budget
          </span>
        </Link>
        <div className="flex gap-1 md:gap-2 flex-wrap justify-center">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}