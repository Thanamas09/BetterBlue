'use client';

import { useState, useEffect } from 'react';
import FoodForm from '@/components/FoodForm';
import ResultCard from '@/components/ResultCard';
import { MenuItem, FilterCriteria } from '@/types/menu';
import { getRandomMenu } from '@/utils/randomMenu';
import { getVisibleMenus } from '@/utils/supabaseMenus';
import { addMealHistory } from '@/utils/supabaseHistory';
import { addLocalFallbackHistory } from '@/utils/storage';
import { supabase } from '@/lib/supabase/client';

export default function Home() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [allMenus, setAllMenus] = useState<MenuItem[]>([]);
  const [currentCriteria, setCurrentCriteria] = useState<FilterCriteria | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [noMatch, setNoMatch] = useState<boolean>(false);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const syncAuthState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUid = session?.user?.id;
      setUserId(currentUid);
      setAuthChecked(true);
      
      const loaded = await getVisibleMenus(currentUid);
      setAllMenus(loaded);
    };

    syncAuthState();
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

  const handleAccept = async () => {
    if (!selectedMenu) return;
    
    if (userId) {
      await addMealHistory(userId, selectedMenu);
      setSuccessMessage(`🚀 บันทึกประวัติกินข้าวคลาวด์ "${selectedMenu.name}" เรียบร้อยแล้ว!`);
    } else {
      addLocalFallbackHistory({
        menuId: selectedMenu.id,
        menuName: selectedMenu.name,
        price: selectedMenu.price
      });
      setSuccessMessage(`💾 บันทึกลงเครื่องแบบชั่วคราวแล้ว! ล็อกอินเพื่อเก็บบนคลาวด์ถาวรได้นะ`);
    }
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

  if (!authChecked) {
    return <div className="text-center py-20 font-bold text-slate-400">⏳ กำลังจัดเตรียมระบบอาหารอัจฉริยะ...</div>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative">
        <h1 className="text-2xl md:text-4xl font-black mb-2">มื้อนี้กินอะไรดี? V1.2 🍱</h1>
      </div>

      {/* ปรับเป็น items-stretch เพื่อให้ฝั่งซ้ายและขวาสูงสมมาตรเท่ากันเสมอ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <FoodForm onRandom={handleRandom} />
        
        {/* ครอบกล่องฝั่งขวาด้วย flex flex-col h-full เพื่อให้ยืดเต็มความสูงของการ์ดฝั่งซ้าย */}
        <div className="flex flex-col gap-4 h-full">
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-400 text-emerald-800 px-4 py-3 rounded-xl font-bold text-center text-sm shadow-sm animate-fadeIn">
              {successMessage}
            </div>
          )}
          {/* ห่อหุ้มชั้นในให้ยืดเนื้อที่เต็มความสูงที่เหลืออยู่ */}
          <div className="flex-1 flex flex-col min-h-[380px] md:min-h-0">
            <ResultCard menu={selectedMenu} noMatch={noMatch} onReroll={handleReroll} onAccept={handleAccept} onReject={handleReject} />
          </div>
        </div>
      </div>
    </main>
  );
}