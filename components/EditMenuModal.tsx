'use client';

import { useState, useEffect } from 'react';
import { MenuItem, PlaceType, HungerLevelType } from '@/types/menu';

interface EditMenuModalProps {
  menu: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMenu: MenuItem) => void;
}

export default function EditMenuModal({ menu, isOpen, onClose, onSave }: EditMenuModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [place, setPlace] = useState<PlaceType>('ordered');
  const [hungerLevel, setHungerLevel] = useState<HungerLevelType>('medium');
  const [tagsInput, setTagsInput] = useState('');
  const [reason, setReason] = useState('');
  const [carbs, setCarbs] = useState('ปานกลาง');
  const [protein, setProtein] = useState('ปานกลาง');
  const [fat, setFat] = useState('ปานกลาง');
  const [veggies, setVeggies] = useState('ปานกลาง');

  useEffect(() => {
    if (menu) {
      setName(menu.name);
      setPrice(menu.price);
      setPlace(menu.place);
      setHungerLevel(menu.hungerLevel);
      setTagsInput(menu.tags.join(', '));
      setReason(menu.reason);
      setCarbs(menu.nutrition.carbs);
      setProtein(menu.nutrition.protein);
      setFat(menu.nutrition.fat);
      setVeggies(menu.nutrition.veggies);
    }
  }, [menu]);

  if (!isOpen || !menu) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    onSave({
      ...menu,
      name: name.trim(),
      price: Number(price) || 0,
      place,
      hungerLevel,
      tags,
      nutrition: { carbs, protein, fat, veggies },
      reason: reason.trim(),
    });
  };

  const nutOptions = ['ไม่มี', 'ต่ำ', 'ปานกลาง', 'สูง', 'สูงมาก'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-lg">✏️ แก้ไขเมนูอาหาร</h3>
            <p className="text-xs text-slate-400">แก้ไขข้อมูลที่เลือกเพื่อใช้อัปเดตในการสุ่มครั้งถัดไป</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-xl p-1">×</button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">ชื่อเมนูอาหาร *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3 text-slate-800 font-bold focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">ราคา (บาท) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3 text-slate-800 font-bold text-blue-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">คีย์เวิร์ดแท็ก (คั่นด้วย ,)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3 text-sm font-medium focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">สถานที่ซื้อ</label>
              <select
                value={place}
                onChange={(e) => setPlace(e.target.value as PlaceType)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-2 text-xs font-bold text-slate-700"
              >
                <option value="7-11">🏪 เซเว่น</option>
                <option value="canteen">🏢 โรงอาหาร</option>
                <option value="ordered">🍳 ตามสั่ง</option>
                <option value="cooking">👨‍🍳 ทำเอง</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">ระดับความอิ่ม</label>
              <select
                value={hungerLevel}
                onChange={(e) => setHungerLevel(e.target.value as HungerLevelType)}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-2 text-xs font-bold text-slate-700"
              >
                <option value="low">น้อย</option>
                <option value="medium">ปานกลาง</option>
                <option value="high">มาก</option>
              </select>
            </div>
          </div>

          {/* Nutrition Section */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2">📊 ข้อมูลสารอาหาร</span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'คาร์บ', val: carbs, set: setCarbs },
                { label: 'โปรตีน', val: protein, set: setProtein },
                { label: 'ไขมัน', val: fat, set: setFat },
                { label: 'ผัก', val: veggies, set: setVeggies },
              ].map((n) => (
                <div key={n.label}>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">{n.label}</label>
                  <select
                    value={n.val}
                    onChange={(e) => n.set(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md p-1 text-[11px] font-medium"
                  >
                    {nutOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">เหตุผลที่แนะนำ</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700"
              required
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-2 rounded-xl text-xs transition-colors shadow-md"
            >
              💾 บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}