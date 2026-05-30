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
  
  // หน้าจอแสดงผลเมื่อการค้นหาไม่ตรงกับเงื่อนไขใดๆเลย (No Match State)
  if (noMatch) {
    return (
      <div className="bg-slate-900 border border-amber-500/30 text-white rounded-3xl p-6 text-center h-full flex flex-col justify-center items-center gap-5 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl">
          🔍
        </div>
        <div>
          <h3 className="text-lg font-serif font-medium text-amber-400 mb-2 tracking-wide">ไม่พบเมนูที่ตรงเงื่อนไข</h3>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
            ลองปรับขยายงบประมาณเพิ่มขึ้น ล้างคำที่ไม่ต้องการ หรือเปลี่ยนไปเลือกตัวเลือก <strong className="text-slate-200">ทุกแหล่งอาหาร</strong> แทนครับบอส
          </p>
        </div>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-amber-500/10 active:scale-95"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        )}
      </div>
    );
  }

  // หน้าจอตอนยังไม่มีการกดสุ่มหรือไม่มีข้อมูลเมนู (Empty State)
  if (!menu) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 border-dashed rounded-3xl p-6 text-center h-full flex flex-col justify-center items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl animate-pulse">
          🍽️
        </div>
        <div>
          <p className="text-slate-300 font-medium text-sm mb-1">ยังไม่แน่ใจใช่ไหมว่ามื้อนี้จะทานอะไรดี?</p>
          <p className="text-slate-500 text-xs">
            กำหนดงบประมาณฝั่งซ้าย แล้วกดปุ่ม <span className="text-blue-400 font-medium">สุ่มเมนูอาหาร</span> ได้เลยครับ
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden animate-fadeIn h-full flex flex-col justify-between">
      
      {/* ป้ายสัญลักษณ์หรูหราหัวมุมบนขวา */}
      <div className="absolute top-0 right-0 bg-amber-400 text-slate-950 font-bold text-[10px] tracking-wider uppercase px-4 py-1.5 rounded-bl-2xl shadow-md border-l border-b border-amber-500/20">
        แนะนำสำหรับคุณ
      </div>

      <div>
        {/* หมวดหมู่เนื้อหาข้อมูลย่อย */}
        <div className="mb-4 mt-2">
          <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            {translatePlace(menu.place)} · {translateHunger(menu.hungerLevel)}
          </span>
          <h2 className="text-2xl font-serif font-semibold tracking-wide text-white mt-3 leading-tight">{menu.name}</h2>
          <div className="text-3xl font-bold font-sans text-amber-400 mt-2 flex items-baseline gap-1">
            <span className="text-xl font-light">฿</span>{menu.price}
            <span className="text-[10px] font-light text-slate-500 ml-1">งบประมาณโดยประมาณ</span>
          </div>
        </div>

        {/* บล็อกโควทคำอธิบายเหตุผลประกอบเมนู */}
        <blockquote className="bg-slate-950/50 border-l-2 border-amber-400 p-3.5 rounded-r-xl text-slate-400 text-xs italic mb-5 leading-relaxed">
          &ldquo;{menu.reason}&rdquo;
        </blockquote>

        {/* แผงข้อมูลตารางสารอาหาร (Nutrition Section) */}
        <div className="bg-slate-950/30 rounded-2xl p-4 mb-6 border border-slate-800/60">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
            📊 สารอาหารโดยประมาณ
          </h4>
          <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
            {[
              { label: 'คาร์บ', value: menu.nutrition.carbs, color: 'text-slate-200' },
              { label: 'โปรตีน', value: menu.nutrition.protein, color: 'text-amber-400' },
              { label: 'ไขมัน', value: menu.nutrition.fat, color: 'text-slate-200' },
              { label: 'ผัก', value: menu.nutrition.veggies, color: 'text-emerald-400' },
            ].map((n) => (
              <div key={n.label} className="bg-slate-900/80 border border-slate-800/40 p-2 rounded-xl">
                <div className="text-slate-500 text-[10px] mb-0.5">{n.label}</div>
                <div className={`font-bold ${n.color}`}>{n.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* แผงกลุ่มปุ่มควบคุม Action ด้านล่างสุด */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <button
          onClick={onAccept}
          disabled={isSaving}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-3.5 px-2 rounded-xl transition-all text-xs flex justify-center items-center gap-1 active:scale-95 shadow-lg shadow-emerald-500/10"
        >
          {isSaving ? (
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              กำลังบันทึก
            </span>
          ) : (
            '✓ กินอันนี้'
          )}
        </button>
        
        <button
          onClick={onReroll}
          disabled={isSaving}
          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-medium py-3.5 px-2 rounded-xl transition-all text-xs flex justify-center items-center gap-1 border border-slate-700/60 active:scale-95"
        >
          🔄 สุ่มใหม่
        </button>
        
        <button
          onClick={onReject}
          disabled={isSaving}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-rose-400 border border-rose-500/20 font-medium py-3.5 px-2 rounded-xl transition-all text-xs flex justify-center items-center gap-1 active:scale-95"
        >
          ✕ ไม่เอา
        </button>
      </div>

    </div>
  );
}