'use client';

import { MenuItem } from '@/types/menu';

interface ResultCardProps {
  menu: MenuItem | null;
  noMatch: boolean;
  isSaving?: boolean;
  onReroll: () => void;
  onAccept: () => void;
  onReject: () => void;
  onClearFilters?: () => void;
}

const translatePlace = (p: string) => {
  if (p === '7-11') return '🏪 เซเว่น';
  if (p === 'canteen') return '🏢 โรงอาหาร';
  if (p === 'ordered') return '🍳 ตามสั่ง';
  if (p === 'all') return '🌐 ทุกแหล่ง';
  return '👨‍🍳 ทำเอง';
};

const translateHunger = (h: string) => {
  if (h === 'low') return 'หิวน้อย';
  if (h === 'medium') return 'หิวปานกลาง';
  return 'หิวมาก';
};

export default function ResultCard({
  menu,
  noMatch,
  isSaving = false,
  onReroll,
  onAccept,
  onReject,
  onClearFilters,
}: ResultCardProps) {
  if (noMatch) {
    return (
      <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-6 text-center h-full flex flex-col justify-center items-center gap-4 animate-fade-in">
        <span className="text-5xl">😵</span>
        <div>
          <h3 className="text-lg font-black text-slate-800 mb-1">ยังไม่เจอเมนูที่ตรงเงื่อนไข</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            ลองเพิ่มงบประมาณ ล้างคำที่ไม่อยากกิน<br />หรือเลือก <strong>ทุกแหล่งอาหาร</strong> แทน
          </p>
        </div>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm py-2.5 px-5 rounded-xl transition-colors shadow-sm"
          >
            ล้างตัวกรอง
          </button>
        )}
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center h-full flex flex-col justify-center items-center gap-3">
        <span className="text-5xl">🍽️</span>
        <div>
          <p className="text-slate-700 font-bold text-base mb-1">ยังไม่รู้ว่าจะกินอะไร?</p>
          <p className="text-slate-500 text-sm">
            ตั้งค่างบประมาณ แล้วกด{' '}
            <span className="font-black text-blue-600">สุ่มเมนูอาหาร</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl border-2 border-blue-500 relative overflow-hidden animate-fade-in h-full flex flex-col">
      {/* Badge */}
      <div className="absolute top-0 right-0 bg-yellow-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-bl-xl shadow">
        แนะนำสำหรับคุณ
      </div>

      <div className="mb-4 mt-1">
        <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">
          {translatePlace(menu.place)} · {translateHunger(menu.hungerLevel)}
        </span>
        <h2 className="text-2xl font-black text-white mt-1">{menu.name}</h2>
        <div className="text-3xl font-black text-yellow-400 mt-2">
          ฿{menu.price}{' '}
          <span className="text-xs font-normal text-slate-400">โดยประมาณ</span>
        </div>
      </div>

      {/* Reason */}
      <blockquote className="bg-slate-800/60 border-l-4 border-cyan-400 p-3 rounded-r-xl text-slate-300 text-sm italic mb-4">
        &ldquo;{menu.reason}&rdquo;
      </blockquote>

      {/* Nutrition */}
      <div className="bg-slate-800/40 rounded-xl p-4 mb-4 border border-slate-700/50">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          📊 สารอาหารโดยประมาณ
        </h4>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { label: 'คาร์บ', value: menu.nutrition.carbs, color: 'text-white' },
            { label: 'โปรตีน', value: menu.nutrition.protein, color: 'text-cyan-400' },
            { label: 'ไขมัน', value: menu.nutrition.fat, color: 'text-white' },
            { label: 'ผัก', value: menu.nutrition.veggies, color: 'text-emerald-400' },
          ].map((n) => (
            <div key={n.label} className="bg-slate-800 p-2 rounded-lg">
              <div className="text-slate-400 mb-0.5">{n.label}</div>
              <div className={`font-bold ${n.color}`}>{n.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={onAccept}
          disabled={isSaving}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black py-3 px-3 rounded-xl transition-all shadow-md text-sm flex justify-center items-center gap-1"
        >
          {isSaving ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
              บันทึก...
            </span>
          ) : (
            '✅ กินอันนี้!'
          )}
        </button>
        <button
          onClick={onReroll}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-3 rounded-xl transition-all shadow-md text-sm flex justify-center items-center gap-1"
        >
          🔄 สุ่มใหม่
        </button>
        <button
          onClick={onReject}
          disabled={isSaving}
          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-rose-400 border border-rose-500/30 font-bold py-3 px-3 rounded-xl transition-all text-sm flex justify-center items-center gap-1"
        >
          ❌ ไม่เอา
        </button>
      </div>
    </div>
  );
}
