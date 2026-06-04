'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { HistoryItem } from '@/types/menu';
import { getMealHistory, clearMealHistory, deleteSingleMealHistory } from '@/utils/supabaseHistory';
import {
  clearLocalFallbackHistory,
  deleteLocalFallbackHistoryItem,
  getLocalFallbackHistory,
} from '@/utils/storage';
import { Toast, useToast } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import Link from 'next/link';
import { getSessionUserId } from '@/utils/supabaseHelpers';

const translatePlace = (p?: string) => {
  if (!p) return '';
  if (p === '7-11') return '🏪 เซเว่น';
  if (p === 'canteen') return '🏢 โรงอาหาร';
  if (p === 'ordered') return '🍳 ตามสั่ง';
  if (p === 'cooking') return '👨‍🍳 ทำเอง';
  if (p === 'all') return '🌐 ทุกแหล่ง';
  return p;
};

const translateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
};

export default function HistoryPage() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  // 📅 State ระบบ Calendar & การเลือกวันเดี่ยว
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => new Date().toDateString());

  // 🎯 State สำหรับระบบเลือกขอบเขตวันเองของบอส (Custom Range Selector)
  const [customStart, setCustomStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7); // Default ย้อนหลังให้ 7 วันจากวันปัจจุบัน
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]; // Default สิ้นสุดที่วันนี้
  });

  // ลอจิกดึงข้อมูลจาก Database / LocalStorage
  const loadHistory = useCallback(async (uid?: string) => {
    setLoading(true);
    try {
      if (uid) {
        const dbHistory = await getMealHistory(uid);
        setHistory(dbHistory);
      } else {
        setHistory(getLocalFallbackHistory());
      }
    } catch {
      console.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      const uid = await getSessionUserId();
      if (!isMounted) return;
      setUserId(uid ?? undefined);
      loadHistory(uid ?? undefined);
    };

    initialize();
    return () => { isMounted = false; };
  }, [loadHistory]);

  const handleClearConfirmed = async () => {
    setShowClearModal(false);
    try {
      if (userId) {
        await clearMealHistory(userId);
        await loadHistory(userId);
      } else {
        clearLocalFallbackHistory();
        setHistory([]);
      }
      addToast('ล้างประวัติทั้งหมดสำเร็จ', 'success');
    } catch {
      addToast('เกิดข้อผิดพลาดในการลบข้อมูล ลองใหม่อีกครั้ง', 'error');
    }
  };

  const handleDeleteSingle = async (id: string) => {
    setDeleteTarget(null);
    try {
      if (userId) {
        await deleteSingleMealHistory(userId, id);
        await loadHistory(userId);
      } else {
        setHistory(deleteLocalFallbackHistoryItem(id));
      }
      addToast('ลบรายการสำเร็จ', 'success');
    } catch {
      addToast('ลบรายการไม่สำเร็จ ลองใหม่', 'error');
    }
  };

  // -------------------------------------------------------------------------
  // 📊 สถิติอัตโนมัติประจำสัปดาห์ปัจจุบัน (Dynamic Weekly Auto)
  // -------------------------------------------------------------------------
  const stats = useMemo(() => {
    const nowObj = new Date();
    const startOfWeekObj = new Date(nowObj);
    startOfWeekObj.setDate(nowObj.getDate() - nowObj.getDay());
    startOfWeekObj.setHours(0, 0, 0, 0);

    const endOfWeekObj = new Date(startOfWeekObj);
    endOfWeekObj.setDate(startOfWeekObj.getDate() + 6);
    endOfWeekObj.setHours(23, 59, 59, 999);

    const formatShortDate = (d: Date) => {
      return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
    };

    const weekRangeText = `${formatShortDate(startOfWeekObj)} – ${formatShortDate(endOfWeekObj)}`;

    const weekItems = history.filter((h) => {
      try {
        const itemDate = new Date(h.dateTime);
        return itemDate >= startOfWeekObj && itemDate <= endOfWeekObj;
      } catch { return false; }
    });

    const weekTotal = weekItems.reduce((s, h) => s + h.price, 0);
    const weekAvg = weekItems.length ? Math.round(weekTotal / weekItems.length) : 0;
    const weekMostExpensive = weekItems.length ? weekItems.reduce((a, b) => a.price > b.price ? a : b) : null;

    const historyDatesSet = new Set(
      history.map((h) => {
        try { return new Date(h.dateTime).toDateString(); } catch { return ''; }
      })
    );

    return {
      weekTotal,
      weekItemsCount: weekItems.length,
      weekAvg,
      weekMostExpensive,
      historyDatesSet,
      weekRangeText
    };
  }, [history]);

  // -------------------------------------------------------------------------
  // 🔍 สถิติตามใจบอส (Custom Range Statistics Calculator)
  // -------------------------------------------------------------------------
  const customRangeStats = useMemo(() => {
    if (!customStart || !customEnd) return { total: 0, count: 0, avg: 0 };

    const startBound = new Date(customStart);
    startBound.setHours(0, 0, 0, 0);

    const endBound = new Date(customEnd);
    endBound.setHours(23, 59, 59, 999);

    const filteredItems = history.filter((h) => {
      try {
        const itemDate = new Date(h.dateTime);
        return itemDate >= startBound && itemDate <= endBound;
      } catch { return false; }
    });

    const total = filteredItems.reduce((s, h) => s + h.price, 0);
    const count = filteredItems.length;
    const avg = count ? Math.round(total / count) : 0;

    return { total, count, avg };
  }, [history, customStart, customEnd]);
    // -------------------------------------------------------------------------
  // 📅 สถิติรายเดือนอิงตามปฏิทินที่เปิดอยู่ (Monthly Statistics)
  // -------------------------------------------------------------------------
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStats = useMemo(() => {
    const currentMonthItems = history.filter((h) => {
      try {
        const itemDate = new Date(h.dateTime);
        // กรองเอาเฉพาะรายการที่ เดือน และ ปี ตรงกับหน้าปฏิทินปัจจุบัน
        return itemDate.getMonth() === month && itemDate.getFullYear() === year;
      } catch { return false; }
    });

    const total = currentMonthItems.reduce((s, h) => s + h.price, 0);
    const count = currentMonthItems.length;
    const avg = count ? Math.round(total / count) : 0;
    
    const monthText = currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });

    return { total, count, avg, monthText };
  }, [history, month, year, currentDate]);
  // -------------------------------------------------------------------------
  // 📅 CALENDAR CORE GENERATOR
  // -------------------------------------------------------------------------

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) { days.push(null); }
    for (let d = 1; d <= daysInMonth; d++) { days.push(new Date(year, month, d)); }
    return days;
  }, [year, month, firstDayOfMonth, daysInMonth]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const activeDayItems = useMemo(() => {
    return history.filter((h) => {
      try { return new Date(h.dateTime).toDateString() === selectedDateStr; } catch { return false; }
    });
  }, [history, selectedDateStr]);

  const activeDayTotal = useMemo(() => {
    return activeDayItems.reduce((s, h) => s + h.price, 0);
  }, [activeDayItems]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center gap-4 bg-white">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-sans tracking-wider text-slate-400">กำลังจัดเตรียมแดชบอร์ดข้อมูลประวัติ...</p>
      </div>
    );
  }

  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* ส่วนหัว แดชบอร์ดแบบพรีเมียม */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-sans font-bold tracking-wide text-slate-900">BetterBlue Insights 📜</h1>
            <p className="text-xs text-slate-400 font-light mt-0.5">วิเคราะห์สถิติ พฤติกรรมการบริโภค และควบคุมงบประมาณรายสัปดาห์</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="text-xs font-medium text-rose-500 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-all border border-rose-200/50 active:scale-95"
            >
              ล้างประวัติทั้งหมด
            </button>
          )}
        </div>
        
        {history.length > 0 && (
          <div className="flex flex-col gap-6">
            
            {/* 📊 บล็อกแถวสถิติสรุปภาพรวมรายสัปดาห์ (Auto-Weekly) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-sm relative overflow-hidden">
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  รายจ่ายรวม ({stats.weekRangeText})
                </span>
                <span className="block text-2xl font-bold font-sans text-amber-400 mt-1">฿{stats.weekTotal}</span>
                <div className="absolute right-3 bottom-2 text-2xl opacity-10">💳</div>
              </div>
              
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-medium">จำนวนมื้อสะสมสัปดาห์นี้</span>
                <span className="block text-2xl font-bold text-slate-800 mt-1">{stats.weekItemsCount} <span className="text-xs font-light text-slate-400">มื้อ</span></span>
                <div className="absolute right-3 bottom-2 text-2xl opacity-10">🍱</div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-medium">งบเฉลี่ยต่อมื้อ</span>
                <span className="block text-2xl font-bold text-slate-800 mt-1">฿{stats.weekAvg}</span>
                <div className="absolute right-3 bottom-2 text-2xl opacity-10">📊</div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-medium">มื้ออาหารราคาสูงสุด</span>
                <span className="block text-sm font-semibold text-slate-800 truncate mt-1.5">{stats.weekMostExpensive ? stats.weekMostExpensive.menuName : 'ไม่มีประวัติ'}</span>
                <span className="text-xs text-amber-500 font-bold">{stats.weekMostExpensive ? `฿${stats.weekMostExpensive.price}` : '-'}</span>
              </div>
            </div>
            {/* 📊 บล็อกแถวสถิติสรุปภาพรวมรายสัปดาห์ (Auto-Weekly) */}
            {/* 💡 บรรทัดด้านล่างนี้แก้จาก sm:grid-cols-2 lg:grid-cols-4 เป็น lg:grid-cols-5 เพื่อรองรับการ์ดใบใหม่ครับ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* ... การ์ดใบที่ 1 - 4 เดิมของบอส ... */}

              {/* 🆕 การ์ดใบที่ 5: สรุปยอดรายเดือนตามปฏิทิน */}
              <div className="bg-blue-900 text-white rounded-2xl p-4 border border-blue-800 shadow-sm relative overflow-hidden sm:col-span-2 lg:col-span-1">
                <span className="block text-[10px] uppercase tracking-widest text-blue-200 font-bold">
                  ยอดรวมรายเดือน ({monthStats.monthText})
                </span>
                <span className="block text-2xl font-bold font-sans text-amber-300 mt-1">฿{monthStats.total}</span>
                <span className="block text-[10px] text-blue-200/80 mt-0.5">เฉลี่ย ฿{monthStats.avg} / มื้อ ({monthStats.count} มื้อ)</span>
                <div className="absolute right-3 bottom-2 text-2xl opacity-10">📅</div>
              </div>

            </div>
            {/* 🛠️ ส่วนระบบเจาะจงขอบเขตวันที่ (Custom Range Picker Widget) */}
            <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl flex flex-col md:flex-row gap-6 items-center justify-between shadow-inner">
              <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
                <div className="w-full sm:w-auto">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">วันที่เริ่มต้น</label>
                  <input 
                    type="date" 
                    value={customStart} 
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
                <span className="text-slate-400 text-xs hidden sm:block mt-4">ถึง</span>
                <div className="w-full sm:w-auto">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">วันที่สิ้นสุด</label>
                  <input 
                    type="date" 
                    value={customEnd} 
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
              </div>

              {/* บล็อกแสดงผลสถิติจากขอบเขตที่บอสตั้งค่า */}
              <div className="w-full md:w-auto flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 border-slate-200/80 pt-4 md:pt-0">
                <div className="text-center md:text-right px-4">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">ยอดรวมช่วงเลือกเอง</span>
                  <span className="text-xl font-black font-sans text-blue-600">฿{customRangeStats.total}</span>
                </div>
                <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                <div className="text-center md:text-right px-4">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">รวมทั้งสิ้น</span>
                  <span className="text-base font-bold text-slate-700">{customRangeStats.count} <span className="text-xs font-light text-slate-400">มื้อ</span></span>
                </div>
                <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                <div className="text-center md:text-right px-4">
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">เฉลี่ยต่อมื้อ</span>
                  <span className="text-base font-bold text-slate-700">฿{customRangeStats.avg}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 🔲 ส่วนผืนผ้าใบหลักปฏิทินและรายละเอียด */}
        {history.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center max-w-xl mx-auto w-full">
            <span className="text-5xl block mb-4">🍃</span>
            <p className="font-bold text-slate-800 text-lg mb-1">ยังไม่มีฐานข้อมูลประวัติการบริโภค</p>
            <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto leading-relaxed">
              เมื่อบอสกดบันทึกมื้ออาหารจากหน้าสุ่มหลัก ข้อมูลไทม์ไลน์และเครื่องมือวิเคราะห์ปฏิทินจะเริ่มเปิดทำงานโดยอัตโนมัติครับ
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-6 py-3 rounded-xl transition-all shadow-md active:scale-95"
            >
              🎲 เริ่มสุ่มมื้ออาหารแรก
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 📅 ปฏิทินอัจฉริยะ (ฝั่งซ้าย) */}
            <div className="lg:col-span-5 bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs transition-colors leading-none active:scale-95">‹</button>
                  <button type="button" onClick={() => { setCurrentDate(new Date()); setSelectedDateStr(new Date().toDateString()); }} className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[10px] uppercase font-bold tracking-wider transition-colors active:scale-95">วันนี้</button>
                  <button type="button" onClick={() => changeMonth(1)} className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs transition-colors leading-none active:scale-95">›</button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
                  <div key={day} className="py-1">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} className="aspect-square" />;
                  
                  const dStr = date.toDateString();
                  const isSelected = dStr === selectedDateStr;
                  const isToday = dStr === new Date().toDateString();
                  const hasHistory = stats.historyDatesSet.has(dStr);

                  return (
                    <button
                      key={`day-${date.getTime()}`}
                      type="button"
                      onClick={() => setSelectedDateStr(dStr)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-95 text-xs font-semibold ${
                        isSelected 
                          ? 'bg-slate-900 text-white shadow-md' 
                          : isToday 
                          ? 'border border-amber-500 text-slate-900 bg-amber-50/20' 
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>{date.getDate()}</span>
                      {hasHistory && (
                        <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${isSelected ? 'bg-amber-400' : 'bg-amber-500'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 🕒 ไทม์ไลน์มื้ออาหารเฉพาะวัน (ฝั่งขวา) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">แสดงรายงานของวันที่</span>
                  <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                    {new Date(selectedDateStr).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <div className="text-right px-3 py-1.5 bg-white border border-slate-200/60 rounded-xl flex items-center gap-2 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ทานไป:</span>
                    <span className="text-xs font-bold text-slate-800">
                      {activeDayItems.length} <span className="text-[10px] font-normal text-slate-400">มื้อ</span>
                    </span>
                  </div>
                  
                  <div className="text-right px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 shadow-sm">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">รวมทั้งสิ้น:</span>
                    <span className="text-xs font-bold text-blue-600">
                      ฿{activeDayTotal}
                    </span>
                  </div>
                </div>
              </div>

              {activeDayItems.length === 0 ? (
                <div className="bg-white border border-slate-100 border-dashed rounded-2xl p-10 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <span className="text-xl">🍽️</span>
                  <p className="text-xs font-medium">ไม่มีรายการมื้ออาหารที่บันทึกไว้ในวันนี้ครับบอส</p>
                </div>
              ) : (
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
                  {activeDayItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 text-sm truncate">{item.menuName}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {item.place && (
                            <span className="text-[9px] font-bold tracking-wide text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                              {translatePlace(item.place)}
                            </span>
                          )}
                          <span className="text-[9px] text-slate-400 font-medium">
                            🕒 {translateTime(item.dateTime)} น.
                          </span>
                          {item.storageMode && (
                            <span className="text-[9px]">
                              {item.storageMode === 'cloud' ? '☁️' : '💾'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">฿{item.price}</p>
                          {item.budget && item.budget > 0 && (
                            <p className={`text-[9px] font-bold mt-0.5 ${item.price <= item.budget ? 'text-emerald-500' : 'text-rose-500'}`}>
                              / ฿{item.budget}
                            </p>
                          )}
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item.id)}
                          className="w-6 h-6 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 text-lg leading-none"
                          title="ลบรายการนี้ออกจากประวัติ"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        )}

      </main>

      <ConfirmModal
        isOpen={showClearModal}
        title="ล้างประวัติทั้งหมด?"
        message="การกระทำนี้ไม่สามารถย้อนกลับได้ ประวัติการกินทั้งหมดในคลังจะถูกลบออกถาวร"
        confirmLabel="ล้างทั้งหมด"
        cancelLabel="ยกเลิก"
        danger
        onConfirm={handleClearConfirmed}
        onCancel={() => setShowClearModal(false)}
      />
      
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="ลบรายการนี้?"
        message="ต้องการลบรายการมื้ออาหารนี้ออกจากประวัติใช่ไหม?"
        confirmLabel="ลบออก"
        cancelLabel="ยกเลิก"
        danger
        onConfirm={() => deleteTarget && handleDeleteSingle(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
      
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}