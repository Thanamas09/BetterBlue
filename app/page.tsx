'use client';

import { useEffect, useState } from 'react';
import FoodForm from '@/components/FoodForm';
import ResultCard from '@/components/ResultCard';
import ConfirmationCard from '@/components/ConfirmationCard';
import { FilterCriteria, MenuItem } from '@/types/menu';
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
  const [noMatch, setNoMatch] = useState(false);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const syncAuthState = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUid = session?.user?.id;
      setUserId(currentUid);
      setAuthChecked(true);

      const loaded = await getVisibleMenus(currentUid);
      setAllMenus(loaded);
    };

    syncAuthState();
  }, []);

  const pickMenu = (criteria: FilterCriteria, excluded: string[]) => {
    const match = getRandomMenu([...allMenus], criteria, excluded);
    setSelectedMenu(match);
    setNoMatch(!match);
  };

  const handleRandom = (criteria: FilterCriteria) => {
    setCurrentCriteria(criteria);
    setRejectedIds([]);
    setConfirmedMenu(null);
    pickMenu(criteria, []);
  };

  const handleReroll = () => {
    if (!currentCriteria) return;
    const nextRejected = selectedMenu
      ? Array.from(new Set([...rejectedIds, selectedMenu.id]))
      : rejectedIds;
    setRejectedIds(nextRejected);
    pickMenu(currentCriteria, nextRejected);
  };

  const handleAccept = async () => {
    if (!selectedMenu || isSaving) return;

    const accepted = selectedMenu;
    const budget = currentCriteria?.budget;
    setIsSaving(true);

    try {
      if (userId) {
        await addMealHistory(userId, accepted, { budget });
      } else {
        addLocalFallbackHistory({
          menuId: accepted.id,
          menuName: accepted.name,
          price: accepted.price,
          place: accepted.place,
          hungerLevel: accepted.hungerLevel,
          budget,
        });
      }

      setSelectedMenu(null);
      setConfirmedMenu(accepted);
      setNoMatch(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = () => {
    if (!selectedMenu || !currentCriteria) return;
    const nextRejected = Array.from(new Set([...rejectedIds, selectedMenu.id]));
    setRejectedIds(nextRejected);
    pickMenu(currentCriteria, nextRejected);
  };

  const handleAddMore = () => {
    setConfirmedMenu(null);
    setSelectedMenu(null);
    setNoMatch(false);
  };

  if (!authChecked) {
    return (
      <div className="text-center py-20 font-bold text-slate-500">
        ⏳ กำลังจัดเตรียมระบบสุ่มเมนู...
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 md:py-10 flex flex-col gap-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-300/20 blur-2xl" />
        <p className="text-blue-100 text-xs font-bold uppercase tracking-[0.2em] mb-2">
          BetterBlue Meal Budget Tracker
        </p>
        <h1 className="text-2xl md:text-4xl font-black mb-2">มื้อนี้กินอะไรดี? 🍱</h1>
        <p className="text-sm md:text-base text-blue-100 max-w-2xl">
          ตั้งงบ เลือกแหล่งอาหาร แล้วให้ระบบช่วยสุ่มเมนูที่เหมาะกับมื้อนี้แบบไม่ต้องคิดเยอะ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <FoodForm onRandom={handleRandom} />

        <div className="flex flex-col min-h-[420px] md:min-h-0">
          {confirmedMenu ? (
            <ConfirmationCard
              menu={confirmedMenu}
              budget={currentCriteria?.budget ?? confirmedMenu.price}
              isLoggedIn={!!userId}
              onAddMore={handleAddMore}
            />
          ) : (
            <ResultCard
              menu={selectedMenu}
              noMatch={noMatch}
              isSaving={isSaving}
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
