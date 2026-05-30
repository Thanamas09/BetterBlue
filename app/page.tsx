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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [allMenus, setAllMenus] = useState<MenuItem[]>([]);
  const [currentCriteria, setCurrentCriteria] = useState<FilterCriteria | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [confirmedMenu, setConfirmedMenu] = useState<MenuItem | null>(null);
  const [noMatch, setNoMatch] = useState(false);
  const [bannedIds, setBannedIds] = useState<string[]>([]); 
  const [authChecked, setAuthChecked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  useEffect(() => {
    const syncAuthState = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const currentUid = session?.user?.id;
        setUserId(currentUid);
        setUserEmail(session?.user?.email || null);

        const loaded = await getVisibleMenus(currentUid);
        setAllMenus(loaded);
      } catch (error) {
        console.error('Error syncing auth or loading menus:', error);
      } finally {
        setAuthChecked(true);
      }
    };

    syncAuthState();
  }, []);

  const pickMenu = (criteria: FilterCriteria, excluded: string[]) => {
    const match = getRandomMenu([...allMenus], criteria, excluded);
    setSelectedMenu(match);
    setNoMatch(!match);
  };

  // จัดการเมื่อผู้ใช้กดปุ่ม "เริ่มสุ่มเมนูอาหาร" จากฟอร์มฝั่งซ้าย
  const handleRandom = (criteria: FilterCriteria) => {
    setCurrentCriteria(criteria);
    setBannedIds([]); 
    setConfirmedMenu(null);
    pickMenu(criteria, []);
  };

  // จัดการกดปุ่ม "สุ่มใหม่" (Reroll)
  const handleReroll = () => {
    const activeCriteria = currentCriteria || { budget: 80, place: 'all', hungerLevel: 'medium', excludeTags: [] };
    const tempExcluded = selectedMenu ? [...bannedIds, selectedMenu.id] : bannedIds;
    const match = getRandomMenu([...allMenus], activeCriteria, tempExcluded);
    
    if (match) {
      setSelectedMenu(match);
      setNoMatch(false);
    } else {
      const resetMatch = getRandomMenu([...allMenus], activeCriteria, bannedIds);
      setSelectedMenu(resetMatch);
      setNoMatch(!resetMatch);
    }
  };

  // ยืนยันการเลือกเมนูอาหาร (กินอันนี้)
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
    } catch (error) {
      console.error('Failed to save meal history:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // จัดการปฏิเสธเมนูอาหาร (ไม่เอา)
  const handleReject = () => {
    if (!selectedMenu) return;
    const activeCriteria = currentCriteria || { budget: 80, place: 'all', hungerLevel: 'medium', excludeTags: [] };
    const nextBanned = [...bannedIds, selectedMenu.id];
    setBannedIds(nextBanned);
    pickMenu(activeCriteria, nextBanned);
  };

  const resetRandomizerState = () => {
    setCurrentCriteria(null);
    setSelectedMenu(null);
    setConfirmedMenu(null);
    setNoMatch(false);
    setBannedIds([]);
  };

  const handleClearForm = () => {
    resetRandomizerState();
    setFormResetKey((key) => key + 1);
  };

  const handleClearFilters = () => {
    resetRandomizerState();
    setFormResetKey((key) => key + 1);
  };

  const handleAddMore = () => {
    setConfirmedMenu(null);
    setSelectedMenu(null);
    setNoMatch(false);
    setBannedIds([]);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 font-medium">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs tracking-widest uppercase">กำลังจัดเตรียมระบบอาหารอัจฉริยะ...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8 animate-fadeIn">
      {/* ส่วนหัวแบนเนอร์หลัก */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                BetterBlue Engine V1.2
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-semibold tracking-wide text-white">
              มื้อนี้กินอะไรดี<span className="text-amber-400 font-sans font-light">?</span> 🍱
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-light">
              วิเคราะห์และสุ่มเลือกเมนูอาหารที่เหมาะสมที่สุดตามเกณฑ์งบประมาณและข้อจำกัดของคุณ
            </p>
          </div>

          <div className="flex items-center gap-5 bg-slate-950/40 backdrop-blur-sm border border-slate-800 px-5 py-3 rounded-2xl">
            <div className="text-left">
              <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-medium">คลังเมนูอาหาร</span>
              <span className="text-base font-bold text-white">{allMenus.length} <span className="text-xs font-light text-slate-400">รายการ</span></span>
            </div>
            <div className="w-px h-6 bg-slate-800" />
            <div className="text-left">
              <span className="block text-[9px] uppercase tracking-wider text-slate-500 font-medium">สิทธิ์ผู้ใช้งาน</span>
              <span className="text-xs font-medium text-amber-400 truncate max-w-[110px] block mt-0.5">
                {userEmail ? userEmail.split('@')[0] : 'โหมดทั่วไป'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout สมมาตร */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* 💡 ฟอร์มฝั่งซ้าย: นำ pointer-events-none แผงรวมออกแล้ว และส่ง prop isRandomized เข้าไปคุมปุ่มแทน */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
          <FoodForm 
            key={formResetKey} 
            onRandom={handleRandom} 
            onClear={handleClearForm} 
            isRandomized={!!selectedMenu} 
          />
        </div>

        {/* ส่วนการ์ดประมวลผลลัพธ์ฝั่งขวา */}
        <div className="flex flex-col min-h-[420px] md:min-h-0 h-full justify-between">
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
              onClearFilters={handleClearFilters}
            />
          )}
        </div>
      </div>
    </main>
  );
}