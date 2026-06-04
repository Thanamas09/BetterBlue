'use client';

import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { getVisibleMenus } from '@/utils/supabaseMenus';
import { useRouter } from 'next/navigation';
import { getSessionUser } from '@/utils/supabaseHelpers';

interface ShortMenu {
  id: string;
  name: string;
  price: number;
  place: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [customMenus, setCustomMenus] = useState<ShortMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // 🎯 State สำหรับข้อมูลผู้ใช้และชื่อเล่น
  const [nickname, setNickname] = useState<string>('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  // 🎯 State สำหรับตั้งค่า Preferences ระบบ
  const [defaultBudget, setDefaultBudget] = useState<number>(80);
  const [budgetSuccess, setBudgetSuccess] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchProfileData = async () => {
      const currentUser = await getSessionUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      
      // ดึงชื่อเล่นจาก user_metadata (ถ้ามี) ถ้าไม่มีให้ดึงจากชื่ออีเมลก่อน @ 
      const savedNickname = currentUser.user_metadata?.nickname || currentUser.email?.split('@')[0] || 'สมาชิก BetterBlue';
      setNickname(savedNickname);

      // ดึงข้อมูลรายการเมนูอาหารส่วนตัว
      const allMenus = await getVisibleMenus(currentUser.id);
      const userCustomMenus: ShortMenu[] = allMenus
        .filter((m) => m.isCustom)
        .map((m) => ({
          id: m.id,
          name: m.name,
          price: m.price,
          place: m.place
        }));
        
      setCustomMenus(userCustomMenus);
      
      // ดึงงบประมาณเริ่มต้นจาก LocalStorage
      const savedBudget = localStorage.getItem('bb_default_budget');
      if (savedBudget) setDefaultBudget(Number(savedBudget));

      setLoading(false);
    };

    fetchProfileData();
  }, [router]);

  // 🔥 ฟังก์ชันอัปเดตชื่อเล่นลง Supabase User Metadata (คลาวด์)
  const handleUpdateNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setIsUpdatingName(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { nickname: nickname.trim() }
      });

      if (error) throw error;
      
      if (data?.user) {
        setUser(data.user); // อัปเดต state ตัวแปร user หลักในระบบ
      }
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 2000);
    } catch (err) {
      console.error('Error updating nickname:', err);
      alert('ไม่สามารถบันทึกชื่อเล่นได้ กรุณาลองใหมี่อีกครั้ง');
    } finally {
      setIsUpdatingName(false);
    }
  };

  // ฟังก์ชันบันทึกค่ามื้ออาหารลง LocalStorage
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('bb_default_budget', String(defaultBudget));
    setBudgetSuccess(true);
    setTimeout(() => setBudgetSuccess(false), 2000);
  };

  // ฟังก์ชันลบเมนูอาหารส่วนตัว
  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบเมนูอาหารส่วนตัวนี้ออกจากคลังข้อมูลคลาวด์?')) return;
    
    setDeletingId(menuId);
    try {
      const { error } = await supabase
        .from('user_menus')
        .delete()
        .eq('id', menuId);

      if (error) throw error;
      setCustomMenus(prev => prev.filter(item => item.id !== menuId));
    } catch (err) {
      console.error('Error deleting menu:', err);
      alert('ไม่สามารถลบข้อมูลได้ในขณะนี้');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="text-center font-bold text-slate-400 animate-pulse">
          ⏳ กำลังโหลดและจัดเตรียมข้อมูลศูนย์ตั้งค่า...
        </div>
      </div>
    );
  }

  // กำหนดตัวอักษรแรกที่จะโชว์บนวงกลมโพรไฟล์ (ถ้ามีชื่อเล่นใช้อักษรแรกของชื่อเล่น ถ้าไม่มีใช้อีเมล)
  const avatarLetter = nickname ? nickname[0].toUpperCase() : user?.email?.[0].toUpperCase();

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* ส่วนหัวแสดงทิศทางของหน้าเพจ */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <span>⚙️</span> ศูนย์ตั้งค่าและจัดการระบบ
        </h1>
        <p className="text-xs text-slate-400 mt-1">ตั้งค่าพฤติกรรมเริ่มต้นของแอปพลิเคชัน BetterBlue และควบคุมคลังข้อมูลส่วนบุคคลของคุณ</p>
      </div>

      {/* Grid Layout แบ่งสัดส่วนแบบ 3 คอลัมน์บนจอใหญ่ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* 🔹 ฝั่งซ้าย (1 ส่วน): Account Status Card */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-3xl flex justify-center items-center rounded-full shadow-md transition-all duration-300">
            {avatarLetter}
          </div>
          <div className="text-center w-full">
            <h2 className="text-base font-black text-slate-800 truncate px-2">{nickname || 'ข้อมูลสมาชิกคลาวด์'}</h2>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5 break-all">{user?.email}</p>
          </div>
          
          <div className="w-full grid grid-cols-2 gap-3 border-t border-b border-slate-100 py-4 my-1">
            <div className="text-center bg-slate-50 p-2.5 rounded-2xl">
              <span className="block text-xl font-black text-blue-600">{customMenus.length}</span>
              <span className="text-[10px] font-bold text-slate-400">เมนูส่วนตัว</span>
            </div>
            <div className="text-center bg-slate-50 p-2.5 rounded-2xl">
              <span className="block text-xl font-black text-indigo-500">Cloud</span>
              <span className="text-[10px] font-bold text-slate-400">ประเภทจัดเก็บ</span>
            </div>
          </div>

          <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100/40">
            <p className="text-center text-[10px] text-slate-500 leading-relaxed">
              🔒 <strong>ระบบความปลอดภัยแบบ RLS เปิดอยู่:</strong> ข้อมูลสิทธิ์การสุ่มและเมนูอาหารทั้งหมดผูกไว้กับ ID บัญชีของคุณอย่างปลอดภัยสูงสุด
            </p>
          </div>
        </div>

        {/* 🔸 ฝั่งขวา (2 ส่วน): Settings & Database Forms */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* ส่วนย่อยที่ 1: ฟอร์มตั้งชื่อเล่น (Profile Metadata) */}
          <section className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
              👤 ข้อมูลโปรไฟล์ (Profile Settings)
            </h3>
            
            <form onSubmit={handleUpdateNickname} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  ชื่อเล่นหรือชื่อเรียกของคุณที่ต้องการให้แสดงในแอป
                </label>
                <div className="flex gap-3 max-w-md">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="เช่น Boss, น้องน้ำ"
                    maxLength={20}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isUpdatingName}
                    className={`text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm whitespace-nowrap active:scale-95 text-white ${
                      nameSuccess 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : 'bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400'
                    }`}
                  >
                    {isUpdatingName ? 'กำลังบันทึก...' : nameSuccess ? 'เปลี่ยนชื่อสำเร็จ! ✓' : 'อัปเดตชื่อเล่น'}
                  </button>
                </div>
              </div>
            </form>
          </section>
          
          {/* ส่วนย่อยที่ 2: ปรับแต่ง Preferences แอป */}
          <section className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
              📊 ค่าเริ่มต้นแอปพลิเคชัน (Preferences)
            </h3>
            
            <form onSubmit={handleSavePreferences} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                    งบประมาณเริ่มต้นต่อมื้อเมื่อกด &apos;ล้างค่าใหม่&apos; (บาท)
                </label>
                <div className="flex gap-3 max-w-sm">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">฿</span>
                    <input
                      type="number"
                      value={defaultBudget}
                      onChange={(e) => setDefaultBudget(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-4 pl-9 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
                      min={1}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className={`text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm whitespace-nowrap active:scale-95 text-white ${
                      budgetSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    {budgetSuccess ? 'บันทึกสำเร็จ! ✓' : 'บันทึกค่ามื้ออาหาร'}
                  </button>
                </div>
              </div>
            </form>
          </section>

          {/* ส่วนย่อยที่ 3: ตารางลบเมนูอาหารส่วนตัว */}
          <section className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
              🍱 คลังเมนูอาหารส่วนตัวของคุณ ({customMenus.length})
            </h3>

            {customMenus.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <span className="text-2xl block mb-1">🍃</span>
                <p className="text-xs text-slate-400 font-medium">คลังข้อมูลยังว่างเปล่า คุณยังไม่ได้สร้างเมนูอาหารส่วนตัว</p>
              </div>
            ) : (
              <div className="overflow-hidden border border-slate-100 rounded-2xl max-h-[320px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider border-b border-slate-100">
                      <th className="py-3 px-4">ชื่อเมนูอาหาร</th>
                      <th className="py-3 px-4">แหล่ง</th>
                      <th className="py-3 px-4 text-right">ราคา</th>
                      <th className="py-3 px-4 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {customMenus.map((menu) => (
                      <tr key={menu.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-800 truncate max-w-[150px]">{menu.name}</td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">{menu.place}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-blue-600">฿{menu.price}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteMenu(menu.id)}
                            disabled={deletingId === menu.id}
                            className="text-rose-500 hover:text-rose-700 font-bold px-2 py-1 rounded transition-colors text-[11px] disabled:text-slate-300"
                          >
                            {deletingId === menu.id ? 'กำลังลบ...' : '🗑️ ลบออก'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}