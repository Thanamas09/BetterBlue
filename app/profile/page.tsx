'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { getVisibleMenus } from '@/utils/supabaseMenus';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [customCount, setCustomCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      
      const allMenus = await getVisibleMenus(session.user.id);
      setCustomCount(allMenus.filter(m => m.isCustom).length);
      setLoading(false);
    };

    fetchProfileData();
  }, [router]);

  if (loading) {
    return <div className="text-center py-20 font-bold text-slate-400">⏳ กำลังตรวจสอบข้อมูลผู้ใช้...</div>;
  }

  return (
    <main className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4">
        <div className="w-20 h-20 bg-blue-600 text-white font-black text-3xl flex justify-center items-center rounded-full shadow-inner">
          {user?.email?.[0].toUpperCase()}
        </div>
        <div className="text-center w-full">
          <h2 className="text-xl font-black text-slate-800">ข้อมูลสมาชิกคลาวด์</h2>
          <p className="text-sm text-slate-400 mt-1 break-words">{user?.email}</p>
        </div>
        
        <div className="w-full grid grid-cols-2 gap-3 border-t border-b border-slate-100 py-4 my-2">
          <div className="text-center bg-slate-50 p-3 rounded-xl">
            <span className="block text-xl font-black text-blue-600">{customCount}</span>
            <span className="text-[11px] font-bold text-slate-400">เมนูอาหารส่วนตัว</span>
          </div>
          <div className="text-center bg-slate-50 p-3 rounded-xl">
            <span className="block text-xl font-black text-indigo-500">Cloud</span>
            <span className="text-[11px] font-bold text-slate-400">ประเภทจัดเก็บ</span>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 italic">
          ระบบเปิดการรักษาความปลอดภัยแบบ RLS ข้อมูลส่วนตัวนี้จะแสดงผลให้เห็นเฉพาะเจ้าของบัญชีเท่านั้น
        </p>
      </div>
    </main>
  );
}