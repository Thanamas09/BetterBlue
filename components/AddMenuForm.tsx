'use client';

import { useState } from 'react';
import { MenuItem, PlaceType, HungerLevelType, Nutrition } from '@/types/menu';

interface AddMenuFormProps {
  onAdd: (menu: MenuItem) => void;
}

export default function AddMenuForm({ onAdd }: AddMenuFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(60);
  const [place, setPlace] = useState<PlaceType>('ordered');
  const [hungerLevel, setHungerLevel] = useState<HungerLevelType>('medium');
  const [tagsInput, setTagsInput] = useState('');
  const [reason, setReason] = useState('');

  // Nutrition sub-state
  const [carbs, setCarbs] = useState('ปานกลาง');
  const [protein, setProtein] = useState('ปานกลาง');
  const [fat, setFat] = useState('ปานกลาง');
  const [veggies, setVeggies] = useState('ปานกลาง');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const tags = tagsInput
      ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const newMenu: MenuItem = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      price: Number(price) || 0,
      place,
      hungerLevel,
      tags,
      nutrition: { carbs, protein, fat, veggies },
      reason: reason.trim() || 'เมนูที่คุณสร้างสรรค์ขึ้นมาเองแบบคูลๆ',
      isCustom: true,
    };

    onAdd(newMenu);

    // Reset Form
    setName('');
    setPrice(60);
    setTagsInput('');
    setReason('');
  };

  const nutOptions = ['ไม่มี', 'ต่ำ', 'ปานกลาง', 'สูง', 'สูงมาก'];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex flex-col gap-4">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อเมนูอาหาร *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 px-4 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
          placeholder="เช่น ข้าวหมูกรอบคั่วพริกเกลือ"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">ราคาโดยประมาณ (บาท) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 px-4 text-slate-800 font-bold text-blue-600 focus:outline-none focus:border-blue-500"
            required
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">คีย์เวิร์ด / แท็ก</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 px-4 text-slate-800 focus:outline-none focus:border-blue-500"
            placeholder="หมู, เผ็ด, ข้าว (คั่นด้วยคอมม่า)"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">สถานที่ซื้อ</label>
          <select
            value={place}
            onChange={(e) => setPlace(e.target.value as PlaceType)}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 px-3 text-slate-700 font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="7-11">🏪 เซเว่น</option>
            <option value="canteen">🏢 โรงอาหาร</option>
            <option value="ordered">🍳 ตามสั่ง</option>
            <option value="cooking">👨‍🍳 ทำเอง</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">ความอิ่มท้อง</label>
          <select
            value={hungerLevel}
            onChange={(e) => setHungerLevel(e.target.value as HungerLevelType)}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 px-3 text-slate-700 font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="low">น้อย (ของทานเล่น)</option>
            <option value="medium">กลาง (จานเดียวปกติ)</option>
            <option value="high">มาก (บุฟเฟต์ / จัดหนัก)</option>
          </select>
        </div>
      </div>

      {/* Nutrition Sub-form */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">📊 ปริมาณสารอาหาร</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {([
            { label: 'คาร์บ', val: carbs, set: setCarbs },
            { label: 'โปรตีน', val: protein, set: setProtein },
            { label: 'ไขมัน', val: fat, set: setFat },
            { label: 'ผัก', val: veggies, set: setVeggies },
          ]).map((nut) => (
            <div key={nut.label}>
              <label className="block text-xs font-bold text-slate-600 mb-1">{nut.label}</label>
              <select
                value={nut.val}
                onChange={(e) => nut.set(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg py-1 px-2 text-xs font-medium"
              >
                {nutOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">เหตุผลที่แนะนำเมนูนี้</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 px-4 text-slate-800 text-sm focus:outline-none focus:border-blue-500"
          placeholder="ทำไมคนถึงต้องกินเมนูนี้ในงบนี้?"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-slate-900 hover:bg-slate-800 text-yellow-400 font-black py-3 rounded-xl transition-all shadow-md mt-2 tracking-wide"
      >
        ➕ บันทึกเมนูอาหารลงคลังสุ่ม
      </button>
    </form>
  );
}