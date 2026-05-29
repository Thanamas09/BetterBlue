'use client';

import { useState } from 'react';
import { FilterCriteria, PlaceType, HungerLevelType } from '@/types/menu';

interface FoodFormProps {
  onRandom: (criteria: FilterCriteria) => void;
}

export default function FoodForm({ onRandom }: FoodFormProps) {
  const [budget, setBudget] = useState<number>(80);
  const [place, setPlace] = useState<PlaceType>('all');
  const [hungerLevel, setHungerLevel] = useState<HungerLevelType>('medium');
  const [excludeInput, setExcludeInput] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const excludeTags = excludeInput
      ? excludeInput.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [];
    onRandom({ budget: Number(budget) || 0, place, hungerLevel, excludeTags });
  };

  const handleClear = () => {
    setBudget(80);
    setPlace('all');
    setHungerLevel('medium');
    setExcludeInput('');
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
      className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex flex-col gap-5"
    >
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
        <span>🎯</span> ตั้งค่ามื้ออาหาร
      </h2>

      {/* Budget */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          งบประมาณต่อมื้อ (บาท)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">฿</span>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 pl-9 pr-4 text-lg font-bold text-blue-600 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="เช่น 80"
            required
            min={1}
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* Place */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          แหล่งอาหาร
        </label>
        <div className="grid grid-cols-3 gap-2">
          {places.slice(0, 3).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPlace(item.key as PlaceType)}
              className={`py-2.5 px-2 text-xs font-bold rounded-xl border-2 transition-all ${
                place === item.key
                  ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
          {places.slice(3).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPlace(item.key as PlaceType)}
              className={`py-2.5 px-2 text-xs font-bold rounded-xl border-2 transition-all ${
                place === item.key
                  ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hunger Level */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">ระดับความหิว</label>
        <div className="grid grid-cols-3 gap-2">
          {hungerLevels.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setHungerLevel(item.key)}
              className={`py-2.5 px-2 text-xs font-bold rounded-xl border-2 transition-all ${
                hungerLevel === item.key
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exclude Tags */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">ไม่อยากกินอะไร?</label>
        <p className="text-xs text-slate-400 mb-2">คั่นด้วยเครื่องหมายจุลภาค (,) เช่น ไก่, เผ็ด</p>
        <input
          type="text"
          value={excludeInput}
          onChange={(e) => setExcludeInput(e.target.value)}
          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3 px-4 text-slate-700 focus:outline-none focus:border-blue-500 transition-colors text-sm"
          placeholder="เมนูหรือวัตถุดิบที่ไม่ต้องการ..."
        />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <button
          type="button"
          onClick={handleClear}
          className="col-span-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-4 rounded-xl transition-colors text-sm"
          suppressHydrationWarning
        >
          ล้างค่า
        </button>
        <button
          type="submit"
          className="col-span-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex justify-center items-center gap-2"
        >
          <span>🎲</span> สุ่มเมนูอาหาร
        </button>
      </div>
    </form>
  );
}
