'use client';

import { MenuItem } from '@/types/menu';

interface MenuCardProps {
  menu: MenuItem;
  onEdit: (menu: MenuItem) => void;
  onDelete: (id: string) => void;
}

export default function MenuCard({ menu, onEdit, onDelete }: MenuCardProps) {
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
    <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-100 hover:border-blue-400/50 transition-all flex flex-col justify-between gap-4">
      <div>
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <span className="text-xs font-bold text-slate-400">
            {translatePlace(menu.place)} • อิ่ม: {translateHunger(menu.hungerLevel)}
          </span>
          {menu.isDefault ? (
            <span className="bg-slate-100 text-slate-500 font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
              System
            </span>
          ) : (
            <span className="bg-blue-50 text-blue-600 font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
              Custom
            </span>
          )}
        </div>
        
        <h3 className="font-extrabold text-slate-800 text-lg">{menu.name}</h3>
        <p className="text-xl font-black text-blue-600 mt-1">฿{menu.price}</p>
        
        <p className="text-xs text-slate-500 italic mt-2 bg-slate-50 p-2 rounded-lg line-clamp-2">
          &ldquo;{menu.reason}&rdquo;
        </p>

        {/* Tags */}
        {menu.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {menu.tags.map((tag, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-600 font-medium text-[11px] px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-3 flex items-center justify-end gap-2">
        <button
          onClick={() => onEdit(menu)}
          className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
        >
          ✏️ แก้ไข
        </button>
        <button
          onClick={() => onDelete(menu.id)}
          className="bg-rose-50 hover:bg-rose-100 text-rose-500 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
          title={menu.isDefault ? "ซ่อนเมนูระบบนี้ออกจากการใช้งาน" : "ลบเมนูที่สร้างเองทิ้ง"}
        >
          🗑️ ลบ
        </button>
      </div>
    </div>
  );
}