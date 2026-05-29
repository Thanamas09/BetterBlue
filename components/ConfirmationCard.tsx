'use client';

import Link from 'next/link';
import { MenuItem } from '@/types/menu';

interface ConfirmationCardProps {
  menu: MenuItem;
  budget: number;
  isLoggedIn: boolean;
  onAddMore: () => void;
  savedAt?: Date;
}

const translatePlace = (p: string) => {
  if (p === '7-11') return '🏪 เซเว่น';
  if (p === 'canteen') return '🏢 โรงอาหาร';
  if (p === 'ordered') return '🍳 ตามสั่ง';
  if (p === 'cooking') return '👨‍🍳 ทำเอง';
  if (p === 'all') return '🌐 ทุกแหล่ง';
  return p;
};

const translateHunger = (h: string) => {
  if (h === 'low') return '🪹 หิวน้อย';
  if (h === 'medium') return '🥣 หิวปานกลาง';
  if (h === 'high') return '🌋 หิวมาก';
  return h;
};

export default function ConfirmationCard({
  menu,
  budget,
  isLoggedIn,
  onAddMore,
  savedAt,
}: ConfirmationCardProps) {
  const remaining = budget - menu.price;
  const now = savedAt ?? new Date();
  const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-400 overflow-hidden h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🎉</span>
          <h2 className="text-lg font-black text-white">บันทึกมื้อนี้สำเร็จ!</h2>
        </div>
        <p className="text-emerald-100 text-xs font-medium">
          เมนูนี้ถูกบันทึกไว้ในประวัติการกินของคุณแล้ว
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-3 p-5">

        {/* Meal name & price */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">เมนูที่เลือก</p>
          <p className="text-xl font-black text-slate-800">{menu.name}</p>
          <p className="text-2xl font-black text-blue-600 mt-1">฿{menu.price}</p>
        </div>

        {/* Budget breakdown */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-100 rounded-xl px-3 py-2.5 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase">งบที่ตั้งไว้</p>
            <p className="text-base font-black text-slate-700 mt-0.5">฿{budget}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 text-center">
            <p className="text-[10px] font-bold text-blue-400 uppercase">ใช้ไป</p>
            <p className="text-base font-black text-blue-600 mt-0.5">฿{menu.price}</p>
          </div>
          <div className={`rounded-xl px-3 py-2.5 text-center border ${remaining >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
            <p className={`text-[10px] font-bold uppercase ${remaining >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>เหลืองบ</p>
            <p className={`text-base font-black mt-0.5 ${remaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>฿{remaining}</p>
          </div>
        </div>

        {/* Details row */}
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-base w-5 shrink-0">{translatePlace(menu.place).split(' ')[0]}</span>
            <span className="font-semibold">{translatePlace(menu.place).slice(3)}</span>
          </div>
          {menu.hungerLevel && (
            <div className="flex items-center gap-2 text-slate-600">
              <span className="text-base w-5 shrink-0">{translateHunger(menu.hungerLevel).split(' ')[0]}</span>
              <span className="font-semibold">{translateHunger(menu.hungerLevel).slice(3)}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-500">
            <span className="text-base w-5 shrink-0">🕒</span>
            <span className="font-semibold">{timeStr} · {dateStr}</span>
          </div>
        </div>

        {/* Storage badge */}
        <div className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 border ${isLoggedIn ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
          <span className="text-lg shrink-0">{isLoggedIn ? '☁️' : '💾'}</span>
          <div>
            <p className={`text-xs font-black ${isLoggedIn ? 'text-blue-700' : 'text-amber-700'}`}>
              {isLoggedIn ? 'บันทึกลง Cloud แล้ว' : 'บันทึกลงเครื่องชั่วคราว'}
            </p>
            <p className={`text-[11px] font-medium mt-0.5 ${isLoggedIn ? 'text-blue-500' : 'text-amber-500'}`}>
              {isLoggedIn
                ? 'ข้อมูลจะอยู่ครบในทุกอุปกรณ์ที่ล็อกอิน'
                : 'ล็อกอินเพื่อเก็บประวัติบน Cloud ถาวร'}
            </p>
          </div>
        </div>

        <div className="flex-1" />

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <Link
            href="/history"
            className="flex justify-center items-center gap-1.5 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            📜 ดูประวัติ
          </Link>
          <button
            onClick={onAddMore}
            className="flex justify-center items-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-md transition-all"
          >
            🎲 สุ่มมื้อต่อไป
          </button>
        </div>
      </div>
    </div>
  );
}
