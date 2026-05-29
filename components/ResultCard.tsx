'use client';

import { MenuItem } from '@/types/menu';

interface ResultCardProps {
  menu: MenuItem | null;
  noMatch: boolean;
  onReroll: () => void;
  onAccept: () => void;
  onReject: () => void;
}

export default function ResultCard({ menu, noMatch, onReroll, onAccept, onReject }: ResultCardProps) {
  if (noMatch) {
    return (
      <div className="bg-yellow-50 border-2 border-dashed border-yellow-400 rounded-2xl p-6 text-center shadow-md animate-fade-in h-full flex flex-col justify-center items-center">
        <span className="text-4xl">😵</span>
        <h3 className="text-xl font-black text-slate-800 mt-3 mb-2">ไม่พบเมนูอาหารที่ตรงเงื่อนไข</h3>
        <p className="text-slate-700 text-sm">
          ลองเพิ่มงบประมาณ ขยายสถานที่ หรือลบเมนูที่ไม่อยากกินออกดูนะเพื่อน!
        </p>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center h-full flex flex-col justify-center items-center gap-3">
        <span className="text-5xl">🍽️</span>
        <p className="text-slate-600 font-bold text-base">ตั้งค่าความหิวและงบประมาณ</p>
        <p className="text-slate-500 text-sm">แล้วกดปุ่ม <span className="font-black text-blue-600">สุ่มเมนูอาหาร</span> เพื่อรับคำแนะนำ</p>
      </div>
    );
  }

  const translatePlace = (p: string) => {
    if (p === '7-11') return '🏪 เซเว่น';
    if (p === 'canteen') return '🏢 โรงอาหาร';
    if (p === 'ordered') return '🍳 ตามสั่ง';
    return '👨‍🍳 ทำเอง';
  };

  const translateHunger = (h: string) => {
    if (h === 'low') return 'น้อย';
    if (h === 'medium') return 'ปานกลาง';
    return 'หิวจัด!';
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl border-2 border-blue-500 relative overflow-hidden animate-fade-in h-full flex flex-col">
      {/* Decorative Badge */}
      <div className="absolute top-0 right-0 bg-yellow-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-bl-xl shadow">
        RECOMMENDED MATCH
      </div>

      <div className="mb-4">
        <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">
          {translatePlace(menu.place)} • ความอิ่ม: {translateHunger(menu.hungerLevel)}
        </span>
        <h2 className="text-2xl font-black text-white mt-1">{menu.name}</h2>
        <div className="text-3xl font-black text-yellow-400 mt-2">
          ฿{menu.price} <span className="text-xs font-normal text-slate-400">โดยประมาณ</span>
        </div>
      </div>

      {/* Reason section */}
      <blockquote className="bg-slate-800/60 border-l-4 border-cyan-400 p-3 rounded-r-xl text-slate-300 text-sm italic mb-5">
        &ldquo;{menu.reason}&rdquo;
      </blockquote>

      {/* Nutrition Grid */}
      <div className="bg-slate-800/40 rounded-xl p-4 mb-4 border border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          📊 ข้อมูลสารอาหารโดยประมาณ
        </h4>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-slate-800 p-2 rounded-lg">
            <div className="text-slate-400">คาร์บ</div>
            <div className="font-bold text-white mt-0.5">{menu.nutrition.carbs}</div>
          </div>
          <div className="bg-slate-800 p-2 rounded-lg">
            <div className="text-slate-400">โปรตีน</div>
            <div className="font-bold text-cyan-400 mt-0.5">{menu.nutrition.protein}</div>
          </div>
          <div className="bg-slate-800 p-2 rounded-lg">
            <div className="text-slate-400">ไขมัน</div>
            <div className="font-bold text-white mt-0.5">{menu.nutrition.fat}</div>
          </div>
          <div className="bg-slate-800 p-2 rounded-lg">
            <div className="text-slate-400">ผัก</div>
            <div className="font-bold text-emerald-400 mt-0.5">{menu.nutrition.veggies}</div>
          </div>
        </div>
      </div>

      {/* Spacer to push buttons to bottom */}
      <div className="flex-1" />

      {/* Action CTA Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <button
          onClick={onAccept}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-3 px-4 rounded-xl transition-all shadow-md md:col-span-1 text-sm flex justify-center items-center gap-1.5"
        >
          ✅ กินอันนี้แหละ!
        </button>
        <button
          onClick={onReroll}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md md:col-span-1 text-sm flex justify-center items-center gap-1.5"
        >
          🔄 สุ่มใหม่อีกที
        </button>
        <button
          onClick={onReject}
          className="bg-slate-800 hover:bg-slate-700 text-rose-400 border border-rose-500/30 font-bold py-3 px-4 rounded-xl transition-all text-sm md:col-span-1 flex justify-center items-center gap-1.5"
        >
          ❌ ไม่เอาเมนูนี้
        </button>
      </div>
    </div>
  );
}
