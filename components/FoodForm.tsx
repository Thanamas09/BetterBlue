'use client';

import { useState } from 'react';
import { FilterCriteria, PlaceFilterType, HungerLevelType } from '@/types/menu';

interface FoodFormProps {
  onRandom: (criteria: FilterCriteria) => void;
  onClear?: () => void;
  isRandomized?: boolean;
}

export default function FoodForm({ onRandom, onClear, isRandomized = false }: FoodFormProps) {
  const [budget, setBudget] = useState<number>(80);
  const [place, setPlace] = useState<PlaceFilterType>('all');
  const [hungerLevel, setHungerLevel] = useState<HungerLevelType>('medium');
  const [excludeInput, setExcludeInput] = useState<string>('');

  // ✅ บอสใช้ flag แทน state + useEffect เพื่อป้องกันการ Re-render ทับค่า
  const [hasChangedSinceRandom, setHasChangedSinceRandom] = useState(false);
  const isButtonDisabled = isRandomized && !hasChangedSinceRandom;

  const handleInputChange = (updateAction: () => void) => {
    updateAction();
    setHasChangedSinceRandom(true); // ✅ user แตะฟิลด์แล้ว → ปลดล็อกปุ่มเริ่มสุ่มทันที
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const excludeTags = excludeInput
      ? excludeInput.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [];

    onRandom({ budget: Number(budget) || 0, place, hungerLevel, excludeTags });
  };

  const handleClear = (e?: React.MouseEvent) => {
    // ✅ สั่งดักทาง Event เพื่อไม่ให้โดนฟอร์มหรือสถานะปุ่มอื่น ๆ มาหน่วงการทำงาน
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setBudget(80);
    setPlace('all');
    setHungerLevel('medium');
    setExcludeInput('');
    setHasChangedSinceRandom(false);
    onClear?.();
  };

  const places = [
    { key: 'all',     label: '🌐 ทุกแหล่ง' },
    { key: '7-11',    label: '🏪 เซเว่น' },
    { key: 'canteen', label: '🏢 โรงอาหาร' },
    { key: 'ordered', label: '🍳 ตามสั่ง' },
    { key: 'cooking', label: '👨‍🍳 ทำเอง' },
  ] as const;

  const hungerLevels = [
    { key: 'low',    label: '🪹 น้อย' },
    { key: 'medium', label: '🥣 ปานกลาง' },
    { key: 'high',   label: '🌋 หิวจัด' },
  ] as const;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-6 flex flex-col gap-6"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-serif font-semibold text-slate-900 flex items-center gap-2">
          <span className="text-sm bg-slate-100 p-1.5 rounded-lg">🎯</span> ตั้งค่าเกณฑ์มื้ออาหาร
        </h2>
      </div>

      {/* บล็อกอินพุตงบประมาณต่อมื้อ */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          งบประมาณต่อมื้อ (บาท)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">฿</span>
          <input
            type="number"
            value={budget}
            onChange={(e) => handleInputChange(() => setBudget(Math.max(0, parseInt(e.target.value) || 0)))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-4 pl-9 text-base font-bold text-slate-900 focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
            placeholder="เช่น 80"
            required
            min={1}
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* บล็อกปุ่มเลือกแหล่งอาหาร */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          แหล่งอาหารที่ต้องการ
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {places.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleInputChange(() => setPlace(item.key))}
              className={`py-2.5 px-2 text-xs font-medium rounded-xl border transition-all active:scale-95 ${
                place === item.key
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* บล็อกปุ่มเลือกระดับความหิว */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">ระดับความต้องการพลังงาน</label>
        <div className="grid grid-cols-3 gap-2">
          {hungerLevels.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleInputChange(() => setHungerLevel(item.key))}
              className={`py-2.5 px-2 text-xs font-medium rounded-xl border transition-all active:scale-95 ${
                hungerLevel === item.key
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* บล็อกข้อความระบุวัตถุดิบต้องห้าม */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">สิ่งที่ไม่ต้องการรับประทาน</label>
        <p className="text-[10px] text-slate-400 mb-2">แยกคำค้นหาแต่ละชนิดด้วยเครื่องหมายจุลภาค เช่น ไก่, เผ็ด</p>
        <input
          type="text"
          value={excludeInput}
          onChange={(e) => handleInputChange(() => setExcludeInput(e.target.value))}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 text-xs focus:outline-none focus:border-slate-900 focus:bg-white transition-all"
          placeholder="ระบุวัตถุดิบหรือเมนูคัดออก..."
        />
      </div>

      {/* ปุ่มสั่งการฟอร์มหลัก */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={(e) => handleClear(e)} // ✅ ส่ง Click Event ไปเคลียร์สถานะทั้งหมดแบบตัดขาด
          className="col-span-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-3 px-4 rounded-xl transition-colors text-xs active:scale-95 pointer-events-auto relative z-10" // ✅ เพิ่มเกราะเพื่อให้กดได้ทุกรณี
          suppressHydrationWarning
        >
          ล้างค่าใหม่
        </button>
        <button
          type="submit"
          disabled={isButtonDisabled}
          className={`col-span-2 font-bold py-3 px-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 active:scale-95 ${
            isButtonDisabled
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed transform-none active:scale-100'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          }`}
        >
          <span>🎲</span> เริ่มสุ่มเมนูอาหาร
        </button>
      </div>
    </form>
  );
}