'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // โหลด Session แรกเริ่ม
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // ดักฟังการสลับเปลี่ยนสถานะของ User แบบ Real-time
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { name: '🎯 สุ่มเมนู', path: '/' },
    { name: '📚 คลังเมนู', path: '/menus' },
    { name: '➕ เพิ่มเมนู', path: '/add-menu' },
    { name: '📜 ประวัติการกิน', path: '/history' },
  ];

  return (
    <nav className="bg-slate-900 text-white border-b border-blue-500/30 sticky top-0 z-50 shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex justify-between items-center w-full md:w-auto">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              BetterBlue
            </span>
            <span className="bg-yellow-400 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
              Budget
            </span>
          </Link>
          
          {/* ส่วนของแถบโปรไฟล์บนหน้าจอมือถือสเกลเล็ก */}
          {user && (
            <Link href="/profile" className="md:hidden text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl font-bold text-blue-400">
              👤 โปรไฟล์
            </Link>
          )}
        </div>

        <div className="flex gap-1 md:gap-2 flex-wrap justify-center items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`text-xs sm:text-sm font-bold px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          <div className="h-4 w-[1px] bg-slate-700 mx-1 hidden sm:block"></div>

          {user ? (
            <div className="flex items-center gap-2 pl-1">
              <Link href="/profile" className="hidden md:block text-xs text-slate-300 font-semibold hover:text-blue-400 transition-colors max-w-[120px] truncate">
                {user.email}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black px-3 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                🚪 ออก
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 pl-1">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-300 hover:text-white px-2 py-1.5"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-3 py-1.5 rounded-lg transition-all"
              >
                สมัครใช้งาน
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}