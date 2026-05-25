'use client';

import { useState, useEffect } from 'react';
import FoodForm from '@/components/FoodForm';
import ResultCard from '@/components/ResultCard';
import { MenuItem, FilterCriteria } from '@/types/menu';
import { getRandomMenu } from '@/utils/randomMenu';
import { getAllMenus, addHistory } from '@/utils/storage';

export default function Home() {
  const [allMenus, setAllMenus] = useState<MenuItem[]>([]);
  const [currentCriteria, setCurrentCriteria] = useState<FilterCriteria | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [noMatch, setNoMatch] = useState<boolean>(false);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // แกนหลักสำคัญ: ดึงฟังก์ชันรวมคลังเมนูทุกเลเยอร์เพื่อสุ่มใช้งานจริง
  const loadFreshMenus = () => {
    setAllMenus(getAllMenus());
  };

  useEffect(() => {
    loadFreshMenus();
  }, []);

  const handleRandom = (criteria: FilterCriteria) => {
    setCurrentCriteria(criteria);
    setRejectedIds([]);
    setSuccessMessage('');

    const match = getRandomMenu([...allMenus], criteria, []);
    if (match) {
      setSelectedMenu(match);
      setNoMatch(false);
    } else {
      setSelectedMenu(null);
      setNoMatch(true);
    }
  };

  const handleReroll = () => {
    if (!currentCriteria) return;
    const match = getRandomMenu([...allMenus], currentCriteria, rejectedIds);
    if (match) {
      setSelectedMenu(match);
      setNoMatch(false);
    } else {
      setSelectedMenu(null);
      setNoMatch(true);
    }
  };

  const handleAccept = () => {
    if (!selectedMenu) return;
    addHistory({
      menuId: selectedMenu.id,
      menuName: selectedMenu.name,
      price: selectedMenu.price,
    });
    setSuccessMessage(`🎉 บันทึกประวัติทานอาหาร "${selectedMenu.name}" เรียบร้อยแล้ว!`);
    setSelectedMenu(null);
  };

  const handleReject = () => {
    if (!selectedMenu || !currentCriteria) return;
    const newRejected = [...rejectedIds, selectedMenu.id];
    setRejectedIds(newRejected);

    const match = getRandomMenu([...allMenus], currentCriteria, newRejected);
    if (match) {
      setSelectedMenu(match);
    } else {
      setSelectedMenu(null);
      setNoMatch(true);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-6xl opacity-10 font-bold select-none">🍱</div>
        <h1 className="text-2xl md:text-4xl font-black mb-2">มื้อนี้กินอะไรดี? 🤔</h1>
        <p className="text-blue-100 text-sm md:text-base max-w-md">
          ใส่พิกัด ป้อนงบประมาณ แล้วปล่อยให้ BetterBlue เลือกอาหารที่ตรงใจ สารอาหารดีต่อใจคุณเอง!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="w-full">
          <FoodForm onRandom={handleRandom} />
        </div>

        <div className="w-full flex flex-col gap-4">
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-xl font-bold text-center text-sm">
              {successMessage}
            </div>
          )}

          <ResultCard
            menu={selectedMenu}
            noMatch={noMatch}
            onReroll={handleReroll}
            onAccept={handleAccept}
            onReject={handleReject}
          />

          {!selectedMenu && !noMatch && !successMessage && (
            <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-slate-200 text-center text-slate-400">
              <span className="text-4xl block mb-2">🍽️</span>
              <p className="font-semibold text-slate-500">พร้อมแล้วกดปุ่มสุ่มอาหารได้เลยครับ!</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}