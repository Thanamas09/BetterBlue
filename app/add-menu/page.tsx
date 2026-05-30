'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AddMenuForm from '@/components/AddMenuForm';
import { createCustomMenu } from '@/utils/supabaseMenus';
import { supabase } from '@/lib/supabase/client';
import { MenuDraft } from '@/types/menu';

export default function AddMenuPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // ตรวจสอบ Session การเข้าสู่ระบบเมื่อเข้ามาที่หน้านี้
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
      }
      setLoading(false);
    });
  }, []);

  const handleAddMenu = async (formData: MenuDraft) => {
    if (!userId) return;
    try {
      await createCustomMenu(userId, formData);

      router.push('/menus');
      router.refresh();
    } catch (e) {
      console.error('Failed to add menu:', e);
      alert('เกิดข้อผิดพลาดในการบันทึกเมนูอาหาร กรุณาลองใหม่อีกครั้ง');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="text-center font-bold text-slate-500 animate-pulse">
          ⏳ ตรวจสอบสถานะบัญชี...
        </div>
      </div>
    );
  }

  // เคสป้องกัน: ถ้ายังไม่ได้ Login จะมีสิทธิ์เห็นแค่หน้าต่างแจ้งเตือนล็อก
  if (!userId) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-100 rounded-2xl shadow-xl text-center">
        <span className="text-4xl block mb-3 animate-bounce">🔒</span>
        <h2 className="text-xl font-black text-slate-800">กรุณาเข้าสู่ระบบก่อนใช้งาน</h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          ฟีเจอร์การเพิ่มเมนูอาหารส่วนตัวสงวนสิทธิ์ไว้เฉพาะผู้ใช้งานสมาชิกคลาวด์เท่านั้น
        </p>
        <Link 
          href="/login" 
          className="inline-block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-blue-500/10"
        >
          ลงชื่อเข้าใช้งานที่นี่
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">➕ เพิ่มเมนูอาหารโปรด</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <AddMenuForm onAddMenu={handleAddMenu} />
      </div>
    </main>
  );
}