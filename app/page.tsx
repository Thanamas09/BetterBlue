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
import { getSessionUser } from '@/utils/supabaseHelpers';

export default function Home() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [allMenus, setAllMenus] = useState<MenuItem[]>([]);
  const [currentCriteria, setCurrentCriteria] = useState<FilterCriteria | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [confirmedMenu, setConfirmedMenu] = useState<MenuItem | null>(null);
  const [noMatch, setNoMatch] = useState(false);
  
  // 🎯 แยก State การบล็อกออกจากกันอย่างชัดเจนตามสเปกบอส
  const [bannedIds, setBannedIds] = useState<string[]>([]); // สำหรับปุ่ม "ไม่เอา" เท่านั้น (แบนถาวรในรอบนั้น)
  
  const [authChecked, setAuthChecked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);

  // ดึงข้อมูลสถานะ Auth และรายการเมนูทั้งหมดจากฐานข้อมูลเมื่อเริ่มต้นระบบ
  useEffect(() => {
    const syncAuthState = async () => {
      try {
        const currentUser = await getSessionUser();
        setUserId(currentUser?.id ?? undefined);
        setUserEmail(currentUser?.email ?? null);

        const loaded = await getVisibleMenus(currentUser?.id);
        setAllMenus(loaded);
      } catch (error) {
        console.error('Error syncing auth or loading menus:', error);
      } finally {
        setAuthChecked(true);
      }
    };

    syncAuthState();
  }, []);

  // ฟังก์ชันส่วนกลางสำหรับเรียกตัวสุ่มเมนูอาหาร
  const pickMenu = (criteria: FilterCriteria, excluded: string[]) => {
    const match = getRandomMenu(allMenus, criteria, excluded);
    setSelectedMenu(match);
    setNoMatch(!match);
  };

  // 🎯 4. จัดการเมื่อผู้ใช้กดปุ่ม "เริ่มสุ่มเมนูอาหาร" จากฟอร์มฝั่งซ้าย
  const handleRandom = (criteria: FilterCriteria) => {
    // 💡 ป้องกันการทำงานซ้ำ: ถ้ามีเมนูสุ่มคาอยู่ที่หน้าจอฝั่งขวาแล้ว จะบล็อกไม่ให้ฟังก์ชันนี้ทำงานซ้ำซ้อนเป็นสุ่มใหม่
    if (selectedMenu) return;

    setCurrentCriteria(criteria);
    setBannedIds([]); // ล้างบัญชีดำเมื่อกดตั้งเกณฑ์เริ่มสุ่มใหม่กลุ่มใหม่
    setConfirmedMenu(null);
    pickMenu(criteria, []);
  };

  // 🎯 2. จัดการกดปุ่ม "สุ่มใหม่" (Reroll) -> เปลี่ยนเมนูโดยไม่เอาเมนูเก่าออกจากระบบถาวร
  const handleReroll = () => {
    const activeCriteria = currentCriteria || { budget: 80, place: 'all', hungerLevel: 'medium', excludeTags: [] };
    
    // วิธีคิดแบบไร้บั๊ก: รวม ID ที่โดนแบนถาวร เข้ากับ ID ล่าสุดที่อยู่บนหน้าจอ (เพื่อไม่ให้สุ่มได้ซ้ำอันเดิมทันที)
    const tempExcluded = selectedMenu ? [...bannedIds, selectedMenu.id] : bannedIds;
    
    // ส่งรายการไปตรวจสอบสุ่มหาอาหารจานใหม่
    const match = getRandomMenu(allMenus, activeCriteria, tempExcluded);
    
    if (match) {
      setSelectedMenu(match);
      setNoMatch(false);
    } else {
      // 💡 ในกรณีสุ่มวนจนครบหมดคลังจริงๆ ให้เอากลุ่มอาหารที่ Reroll กลับมาสุ่มวน Loop ใหม่ได้เรื่อยๆ (Infinity Loop)
      // โดยยังคงรักษารายการอาหารที่โดนแบนถาวร (Banned) เอาไว้เหมือนเดิม
      const resetMatch = getRandomMenu(allMenus, activeCriteria, bannedIds);
      setSelectedMenu(resetMatch);
      setNoMatch(!resetMatch);
    }
  };

  // 🎯 3. ยืนยันการเลือกเมนูอาหาร (กินอันนี้) และบันทึกลงฐานข้อมูล/Local Storage
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

  // 🎯 1. จัดการปฏิเสธเมนูอาหาร (ไม่เอา) -> บันทึกเข้าบัญชีดำ ห้ามเจออีกในรอบนี้
  const handleReject = () => {
    if (!selectedMenu) return;
    const activeCriteria = currentCriteria || { budget: 80, place: 'all', hungerLevel: 'medium', excludeTags: [] };
    
    // อัปเดตเก็บเข้าอาร์เรย์โดนแบนถาวรจริง
    const nextBanned = [...bannedIds, selectedMenu.id];
    setBannedIds(nextBanned);
    
    // สุ่มใบถัดไปโดยคัดเมนูที่แบนทิ้งไปเลย
    pickMenu(activeCriteria, nextBanned);
  };

  // เคลียร์ค่า State การสุ่มทั้งหมดภายในหน้าหลัก
  const resetRandomizerState = () => {
    setCurrentCriteria(null);
    setSelectedMenu(null);
    setConfirmedMenu(null);
    setNoMatch(false);
    setBannedIds([]);
  };

  // ล้างค่าฟอร์มฝั่งซ้ายพร้อมๆ กับเคลียร์สถานะฝั่งขวา (ปุ่มล้างค่า)
  const handleClearForm = () => {
    resetRandomizerState();
    setFormResetKey((key) => key + 1);
  };

  // ล้างตัวกรองทั้งหมดเมื่อระบบหาเมนูไม่เจอ (No Match)
  const handleClearFilters = () => {
    resetRandomizerState();
    setFormResetKey((key) => key + 1);
  };

  // สั่งเริ่มกระบวนการเลือกใหม่อีกครั้งหลังจากบันทึกเสร็จสิ้น
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
      
      {/* ส่วนหัวแบนเนอร์หลักสไตล์ Luxury Minimal Matte */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                BetterBlue Engine V1.5
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-semibold tracking-wide text-white">
              มื้อนี้กินอะไรดี<span className="text-amber-400 font-sans font-light">?</span> 🍱
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-light">
              วิเคราะห์และสุ่มเลือกเมนูอาหารที่เหมาะสมที่สุดตามเกณฑ์งบประมาณและข้อจำกัดของคุณ
            </p>
          </div>

          {/* ป้ายแสดงข้อมูลโปรไฟล์ย่อยมุมขวา */}
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

      {/* Grid Layout สมมาตรแบ่งซ้ายขวา */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* กล่องตั้งค่าข้อมูลเกณฑ์ฝั่งซ้าย */}
        {/* 💡 เพิ่มการใส่ CSS pointer-events-none และ Opacity จางลงเมื่อทำการสุ่มขึ้นฝั่งขวาแล้ว เพื่อบอก User ว่าปุ่มถูกล็อกชั่วคราวอย่างชัดเจน */}
        <div className={`bg-white border border-slate-100 rounded-3xl shadow-sm transition-all duration-300 ${selectedMenu ? 'opacity-75 pointer-events-none select-none' : 'hover:shadow-md'}`}>
          <FoodForm key={formResetKey} onRandom={handleRandom} onClear={handleClearForm} />
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