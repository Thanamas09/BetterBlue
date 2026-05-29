'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AuthFormProps {
  type: 'login' | 'register';
}

export default function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (type === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('🎯 สมัครสมาชิกเสร็จเรียบร้อย! สามารถกดยืนยันหรือล็อกอินเข้าระบบต่อได้ทันที');
      }
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการตรวจสอบบัญชี');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md w-full">
      <h2 className="text-2xl font-black text-slate-800 mb-2 text-center">
        {type === 'login' ? '🔐 เข้าสู่ระบบ BetterBlue' : '🚀 สมัครสมาชิกพอร์ตประหยัด'}
      </h2>
      <p className="text-xs text-slate-400 text-center mb-6">
        {type === 'login' ? 'เปิดคลาวด์ล็อกประวัติและคลังข้อมูลอาหารของคุณ' : 'ซิงค์ระบบสุ่มอัจฉริยะไว้ใช้งานได้จากทุกๆ ที่'}
      </p>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-3 text-xs font-bold mb-4">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleAuth} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">อีเมลผู้ใช้งาน (Email)</label>
          <input
            type="email"
            value={email}
            placeholder="example@email.com"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 px-4 text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">รหัสผ่าน (Password)</label>
          <input
            type="password"
            value={password}
            placeholder="••••••••"
            onChange={(passwordE) => setPassword(passwordE.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 px-4 text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3 rounded-xl transition-all shadow-md shadow-blue-500/10 text-sm mt-2 disabled:opacity-50"
        >
          {loading ? '⏳ กำลังประมวลผลข้อมูล...' : type === 'login' ? 'ลงชื่อเข้าใช้งาน' : 'ลงทะเบียนเปิดบัญชี'}
        </button>
      </form>

      <div className="border-t border-slate-100 pt-4 mt-6 text-center text-xs">
        {type === 'login' ? (
          <p className="text-slate-500">
            ยังไม่มีบัญชีกับเราใช่ไหม?{' '}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">สร้างบัญชีใหม่ที่นี่</Link>
          </p>
        ) : (
          <p className="text-slate-500">
            มีบัญชีผู้ใช้อยู่แล้วใช่ไหม?{' '}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">ย้อนกลับไปหน้าล็อกอิน</Link>
          </p>
        )}
      </div>
    </div>
  );
}