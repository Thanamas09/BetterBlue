'use client';

import { useState, useEffect } from 'react';
import AddMenuForm from '@/components/AddMenuForm';
import { MenuItem } from '@/types/menu';
import { saveCustomMenus, getCustomMenus } from '@/utils/storage';

export default function AddMenuPage() {
  const [customMenus, setCustomMenus] = useState<MenuItem[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setCustomMenus(getCustomMenus());
  }, []);

  const handleAddMenu = (newMenu: MenuItem) => {
    saveCustomMenus([newMenu, ...getCustomMenus()]);
    setCustomMenus([newMenu, ...customMenus]);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">➕ เพิ่มเมนูประจำตัว</h1>
        <p className="text-sm text-slate-500">ไม่มีเมนูโปรดในคลังหรอ? แอดข้อมูลเองไว้สุ่มรอบหน้าได้เลย!</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-400 text-emerald-800 font-bold p-3 text-center rounded-xl text-sm animate-fade-in">
          🚀 เพิ่มเมนูใหม่ลงคลังสุ่มส่วนตัวสำเร็จแล้ว!
        </div>
      )}

      <AddMenuForm onAdd={handleAddMenu} />

      {/* Display user's custom menus list */}
      {customMenus.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-slate-500 mb-3">เมนูที่เพิ่มเองทั้งหมด ({customMenus.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {customMenus.map((menu) => (
              <div key={menu.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-md mb-1 inline-block">Custom</span>
                <h4 className="font-bold text-slate-800">{menu.name}</h4>
                <p className="text-sm font-extrabold text-blue-600 mt-0.5">฿{menu.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}