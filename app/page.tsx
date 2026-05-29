'use client';

import { useState, useEffect } from 'react';
import FoodForm from '@/components/FoodForm';
import ResultCard from '@/components/ResultCard';
import ConfirmationCard from '@/components/ConfirmationCard';
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
  const [confirmedMenu, setConfirmedMenu] = useState<MenuItem | null>(null);
  const [noMatch, setNoMatch] = useState<boolean>(false);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
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
    setConfirmedMenu(null);

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
    
    const accepted = selectedMenu;

    if (userId) {
      await addMealHistory(userId, selectedMenu);
    } else {
      addLocalFallbackHistory({
        menuId: selectedMenu.id,
        menuName: selectedMenu.name,
        price: selectedMenu.price
      });
    }

    setSelectedMenu(null);
    setConfirmedMenu(accepted);
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

  const handleAddMore = () => {
    setConfirmedMenu(null);
    setSelectedMenu(null);
    setNoMatch(false);
  };

  if (!authChecked) {
    return <div className="text-center py-20 font-bold text-slate-400">⏳ กำลังจัดเตรียมระบบอาหารอัจฉริยะ...</div>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative">
        <h1 className="text-2xl md:text-4xl font-black mb-2">มื้อนี้กินอะไรดี? V1.2 🍱</h1>
      </div>

      {/* Two-column layout — items-stretch ensures both columns share the same height */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <FoodForm onRandom={handleRandom} />

        {/* Right column stretches to match left column height */}
        <div className="flex flex-col min-h-[420px] md:min-h-0">
          {confirmedMenu ? (
            <ConfirmationCard
              menu={confirmedMenu}
              isLoggedIn={!!userId}
              onAddMore={handleAddMore}
            />
          ) : (
            <ResultCard
              menu={selectedMenu}
              noMatch={noMatch}
              onReroll={handleReroll}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          )}
        </div>
      </div>
    </main>
  );
}
