'use client';

import { useState } from 'react';
import { MenuItem, PlaceType, HungerLevelType } from '@/types/menu';

// เปลี่ยนให้รับค่าฟังก์ชันที่มีโครงสร้างยืดหยุ่น หายแดงแน่นอน
interface AddMenuFormProps {
  onAddMenu: (data: Omit<MenuItem, 'id'>) => void;
}

export default function AddMenuForm({ onAddMenu }: AddMenuFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [place, setPlace] = useState<PlaceType>('ordered');
  const [hungerLevel, setHungerLevel] = useState<HungerLevelType>('medium');
  const [tagInput, setTagInput] = useState('');
  const [reason, setReason] = useState('');
  
  const [carbs, setCarbs] = useState('ปานกลาง');
  const [protein, setProtein] = useState('ปานกลาง');
  const [fat, setFat] = useState('ปานกลาง');
  const [veggies, setVeggies] = useState('ปานกลาง');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      alert('กรุณากรอกชื่อเมนูและราคาอาหารให้ครบถ้วน');
      return;
    }

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');

    // ส่งโครงสร้างข้อมูลออกไปให้ครบถ้วนตามที่ Omit<MenuItem, 'id'> ต้องการ
    onAddMenu({
      name,
      price: Number(price),
      place,
      hungerLevel,
      tags,
      nutrition: { carbs, protein, fat, veggies },
      reason,
      isDefault: false,
      isCustom: true
    });

    setName('');
    setPrice('');
    setTagInput('');
    setReason('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">ชื่ออาหาร *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="เช่น ข้าวผัดอเมริกัน, บะหมี่เกี๊ยวหมูแดง"
          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">ราคา (บาท) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="เช่น 50"
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">สถานที่ซื้อ</label>
          <select
            value={place}
            onChange={(e) => setPlace(e.target.value as PlaceType)}
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3 text-slate-800 text-sm font-bold focus:outline-none"
          >
            <option value="ordered">🍳 อาหารตามสั่ง</option>
            <option value="canteen">🏢 โรงอาหาร</option>
            <option value="7-11">🏪 เซเว่น (7-11)</option>
            <option value="cooking">👨‍🍳 ทำเองกินเอง</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">ระดับความอิ่มท้อง</label>
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'high'] as HungerLevelType[]).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setHungerLevel(level)}
              className={`py-2 text-xs font-bold rounded-xl border-2 transition-all ${
                hungerLevel === level
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {level === 'low' ? 'น้อย (เบาๆ)' : level === 'medium' ? 'ปานกลาง' : 'มาก (จุกๆ)'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
        <span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider">📊 สัดส่วนสารอาหารคร่าวๆ</span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">คาร์โบไฮเดรต</label>
            <select value={carbs} onChange={(e) => setCarbs(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700">
              <option value="น้อย">น้อย</option>
              <option value="ปานกลาง">ปานกลาง</option>
              <option value="สูง">สูง</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">โปรตีน</label>
            <select value={protein} onChange={(e) => setProtein(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700">
              <option value="น้อย">น้อย</option>
              <option value="ปานกลาง">ปานกลาง</option>
              <option value="สูง">สูง</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">ไขมัน</label>
            <select value={fat} onChange={(e) => setFat(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700">
              <option value="น้อย">น้อย</option>
              <option value="ปานกลาง">ปานกลาง</option>
              <option value="สูง">สูง</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">ผัก / ใยอาหาร</label>
            <select value={veggies} onChange={(e) => setVeggies(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700">
              <option value="น้อย">น้อย</option>
              <option value="ปานกลาง">ปานกลาง</option>
              <option value="สูง">สูง</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">แท็ก (คั่นด้วยเครื่องหมายจุลภาค `,` เพื่อแยกแท็ก)</label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="เช่น เผ็ด, เมนูเส้น, ไก่"
          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 mb-1">เหตุผลที่แนะนำ (Reason)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="เช่น อร่อยได้โปรตีนสูงจากเนื้อเน้นๆ หรือ เมนูเซฟงบตอนสิ้นเดือน"
          rows={2}
          className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3 text-slate-800 text-sm font-semibold focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl transition-all shadow-md text-sm mt-2"
      >
        ✨ บันทึกเข้าคลังอาหารส่วนตัว
      </button>
    </form>
  );
}