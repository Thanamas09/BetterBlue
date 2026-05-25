'use client';

import { useState, useEffect } from 'react';
import MenuCard from '@/components/MenuCard';
import EditMenuModal from '@/components/EditMenuModal';
import { MenuItem } from '@/types/menu';
import { getAllMenus, updateMenu, deleteMenu } from '@/utils/storage';

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [placeFilter, setPlaceFilter] = useState<string>('all');
  const [hungerFilter, setHungerFilter] = useState<string>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // ควบคุม State สำหรับ Modal การแก้ไข
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // โหลดคลังเมนูที่ผ่านการกรองบัญชีดำเรียบร้อยแล้ว
  const loadMenus = () => {
    setMenus(getAllMenus());
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const handleEditClick = (menu: MenuItem) => {
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleSaveMenu = (updatedMenu: MenuItem) => {
    updateMenu(updatedMenu);
    setIsModalOpen(false);
    setEditingMenu(null);
    showFeedback('✏️ อัปเดตข้อมูลเมนูอาหารเรียบร้อยแล้ว!');
    loadMenus();
  };

  // คอร์ฟังก์ชันการลบ/ซ่อนเมนู
  const handleDeleteClick = (id: string) => {
    const targetMenu = menus.find((m) => m.id === id);
    if (!targetMenu) return;

    const confirmPrompt = targetMenu.isDefault 
      ? `ต้องการซ่อนเมนูระบบ "${targetMenu.name}" ออกจากการสุ่มใช่หรือไม่?`
      : `ต้องการลบเมนู "${targetMenu.name}" ออกจากระบบถาวรใช่หรือไม่?`;

    if (confirm(confirmPrompt)) {
      deleteMenu(id); // สั่งสลายข้อมูลตามเงื่อนไขชั้น Storage
      showFeedback('🗑️ ลบเมนูอาหารออกจากระบบแล้ว');
      loadMenus(); // ดึงข้อมูลโครงสร้างผสมก้อนใหม่มาวาด UI ทันที
    }
  };

  // ตัวคุม Feedback Notification แบบตั้งเวลาปิด
  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage('');
    }, 3000);
  };

  // ตัวกรองการค้นหาของหน้าแสดงผล
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlace = placeFilter === 'all' || menu.place === placeFilter;
    const matchesHunger = hungerFilter === 'all' || menu.hungerLevel === hungerFilter;
    return matchesSearch && matchesPlace && matchesHunger;
  });

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6 relative">
      
      {/* แจ้งเตือนลบสำเร็จแบบลอย */}
      {feedbackMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-xl border border-blue-500/30 z-50 animate-bounce">
          {feedbackMessage}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-slate-800">📚 คลังเมนูอาหารทั้งหมด</h1>
        <p className="text-sm text-slate-500">จัดการรายละเอียดเมนู หรือสั่งลบ/ซ่อนตัวเลือกที่ไม่โปรดปรานออกจากการสุ่มได้ทันที</p>
      </div>

      {/* บาร์สำหรับค้นหาและคัดกรองตัวกรอง */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">ค้นหาเมนูอาหาร</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔎 พิมพ์เพื่อค้นหาชื่อเมนู..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">คัดกรองสถานที่ซื้อ</label>
          <select
            value={placeFilter}
            onChange={(e) => setPlaceFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-bold focus:outline-none"
          >
            <option value="all">🌍 สถานที่ทั้งหมด</option>
            <option value="7-11">🏪 เซเว่น (7-11)</option>
            <option value="canteen">🏢 โรงอาหาร</option>
            <option value="ordered">🍳 อาหารตามสั่ง</option>
            <option value="cooking">👨‍🍳 ทำเองกินเอง</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">คัดกรองระดับความอิ่ม</label>
          <select
            value={hungerFilter}
            onChange={(e) => setHungerFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 font-bold focus:outline-none"
          >
            <option value="all">🥣 ความอิ่มทั้งหมด</option>
            <option value="low">น้อย (กรุบกริบ)</option>
            <option value="medium">กลาง (กำลังดี)</option>
            <option value="high">มาก (จุกๆ จัดเต็ม)</option>
          </select>
        </div>
      </div>

      {/* คลังการ์ดเมนูอาหาร */}
      {filteredMenus.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <span className="text-4xl block mb-2">🍽️</span>
          <p className="font-bold text-slate-500">คลังเมนูว่างเปล่า</p>
          <p className="text-xs text-slate-400 mt-1">ไม่มีเมนูที่เข้าเงื่อนไขตัวกรอง หรือเมนูทั้งหมดอาจจะถูกซ่อนไว้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredMenus.map((menu) => (
            <MenuCard
              key={menu.id}
              menu={menu}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* กล่อง Modal สำหรับการแก้ไขฟอร์ม */}
      <EditMenuModal
        menu={editingMenu}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMenu(null);
        }}
        onSave={handleSaveMenu}
      />
    </main>
  );
}