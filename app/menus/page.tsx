'use client';

import { useState, useEffect, useMemo } from 'react';
import MenuCard from '@/components/MenuCard';
import EditMenuModal from '@/components/EditMenuModal';
import { MenuItem } from '@/types/menu';
import { getVisibleMenus, updateUserMenu, overrideDefaultMenu, deleteMenu } from '@/utils/supabaseMenus';
import { getSessionUserId } from '@/utils/supabaseHelpers';
import Link from 'next/link';

export default function MenusPage() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [placeFilter, setPlaceFilter] = useState('all');
  const [hungerFilter, setHungerFilter] = useState('all');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadMenus = async (uid?: string) => {
    const list = await getVisibleMenus(uid);
    setMenus(list);
  };

  useEffect(() => {
    const initialize = async () => {
      const uid = await getSessionUserId();
      setUserId(uid ?? undefined);
      loadMenus(uid ?? undefined);
    };

    initialize();
  }, []);

  const handleEditClick = (menu: MenuItem) => {
    if (!userId) {
      alert('🔒 กรุณาเข้าสู่ระบบก่อนเพื่อแก้ไขรายละเอียดเมนูอาหาร');
      return;
    }
    setEditingMenu(menu);
    setIsModalOpen(true);
  };

  const handleSaveMenu = async (updatedMenu: MenuItem) => {
    if (!userId) return;

    try {
      if (updatedMenu.isDefault && !updatedMenu.source_menu_id) {
        await overrideDefaultMenu(userId, updatedMenu.id, updatedMenu);
      } else {
        await updateUserMenu(userId, updatedMenu);
      }
      setIsModalOpen(false);
      showFeedback('✏️ บันทึกการแก้ไขข้อมูลลง Cloud เรียบร้อย');
      loadMenus(userId);
    } catch {
      alert('เกิดข้อผิดพลาดในการแก้ข้อมูล');
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!userId) {
      alert('🔒 กรุณาเข้าสู่ระบบก่อนเพื่อทำการลบหรือซ่อนเมนูอาหารออกจากการสุ่ม');
      return;
    }
    const target = menus.find(m => m.id === id);
    if (!target) return;

    if (confirm(`คุณแน่ใจใช่ไหมว่าจะลบ/ซ่อนเมนู "${target.name}"?`)) {
      try {
        await deleteMenu(userId, target);
        showFeedback('🗑️ จัดการลบ/ซ่อนเมนูอาหารเรียบร้อย');
        loadMenus(userId);
      } catch (err) {
        console.error('Error deleting menu:', err);
        alert('เกิดข้อผิดพลาดในการลบเมนูอาหาร กรุณาลองใหม่อีกครั้ง');
      }
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  const filteredMenus = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();
    return menus.filter((m) => {
      return m.name.toLowerCase().includes(normalizedSearch) &&
        (placeFilter === 'all' || m.place === placeFilter) &&
        (hungerFilter === 'all' || m.hungerLevel === hungerFilter);
    });
  }, [menus, searchTerm, placeFilter, hungerFilter]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6 relative">
      {feedbackMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-xl z-50">
          {feedbackMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* Fixed: was text-white on slate-50 background — now text-slate-800 */}
          <h1 className="text-2xl font-black text-slate-800">📚 คลังเมนูอาหารทั้งหมด</h1>
        </div>
        {!userId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-800 font-medium">
            💡 ต้องการจัดแต่งเมนูเอง? <Link href="/login" className="underline font-bold text-blue-600">เข้าสู่ระบบที่นี่</Link>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="🔎 ค้นหาเมนูอาหาร..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <select
          value={placeFilter}
          onChange={e => setPlaceFilter(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
        >
          <option value="all" className="bg-white text-slate-900 font-semibold">🌍 ทุกสถานที่</option>
          <option value="7-11" className="bg-white text-slate-900 font-semibold">🏪 เซเว่น</option>
          <option value="canteen" className="bg-white text-slate-900 font-semibold">🏢 โรงอาหาร</option>
          <option value="ordered" className="bg-white text-slate-900 font-semibold">🍳 ตามสั่ง</option>
          <option value="cooking" className="bg-white text-slate-900 font-semibold">👨‍🍳 ทำเอง</option>
        </select>
        <select
          value={hungerFilter}
          onChange={e => setHungerFilter(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
        >
          <option value="all" className="bg-white text-slate-900 font-semibold">🥣 ทุกระดับความอิ่ม</option>
          <option value="low" className="bg-white text-slate-900 font-semibold">น้อย</option>
          <option value="medium" className="bg-white text-slate-900 font-semibold">ปานกลาง</option>
          <option value="high" className="bg-white text-slate-900 font-semibold">มาก</option>
        </select>
      </div>

      {filteredMenus.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500 font-medium">ไม่พบเมนูอาหาร</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredMenus.map(m => (
            <MenuCard key={m.id} menu={m} onEdit={handleEditClick} onDelete={handleDeleteClick} />
          ))}
        </div>
      )}

      <EditMenuModal menu={editingMenu} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingMenu(null); }} onSave={handleSaveMenu} />
    </main>
  );
}
