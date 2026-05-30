'use client';

import { useState, useEffect, useCallback } from 'react';
import { HistoryItem } from '@/types/menu';
import { getMealHistory, clearMealHistory, deleteSingleMealHistory } from '@/utils/supabaseHistory';
import {
  clearLocalFallbackHistory,
  deleteLocalFallbackHistoryItem,
  getLocalFallbackHistory,
} from '@/utils/storage';
import { supabase } from '@/lib/supabase/client';
import { Toast, useToast } from '@/components/Toast';
import ConfirmModal from '@/components/ConfirmModal';
import Link from 'next/link';

function groupByDate(items: HistoryItem[]): { dateLabel: string; items: HistoryItem[]; total: number }[] {
  const map = new Map<string, HistoryItem[]>();
  for (const item of items) {
    let dateKey: string;
    try {
      const d = new Date(item.dateTime);
      dateKey = Number.isNaN(d.getTime()) ? 'ไม่ระบุวันที่' : d.toDateString();
    } catch {
      dateKey = 'ไม่ระบุวันที่';
    }
    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey)!.push(item);
  }

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  return Array.from(map.entries()).map(([key, dayItems]) => {
    let dateLabel: string;
    if (key === today) {
      dateLabel = `วันนี้ — ${new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    } else if (key === yesterday) {
      dateLabel = `เมื่อวาน — ${new Date(Date.now() - 86400000).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    } else {
      try {
        dateLabel = new Date(key).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      } catch {
        dateLabel = key;
      }
    }
    const total = dayItems.reduce((s, i) => s + i.price, 0);
    return { dateLabel, items: dayItems, total };
  });
}

function getThisWeekItems(items: HistoryItem[]): HistoryItem[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return items.filter((h) => {
    try { return new Date(h.dateTime) >= startOfWeek; }
    catch { return false; }
  });
}

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
      addToast('โหลดประวัติไม่สำเร็จ กรุณาลองใหม่', 'error');
      setHistory(getLocalFallbackHistory());
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id;
      setUserId(uid);
      loadHistory(uid);
    });
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

  // Computed stats
  const todayStr = new Date().toDateString();
  const todayItems = history.filter((h) => {
    try { return new Date(h.dateTime).toDateString() === todayStr; } catch { return false; }
  });
  const todayTotal = todayItems.reduce((s, h) => s + h.price, 0);
  const todayAvg = todayItems.length ? Math.round(todayTotal / todayItems.length) : 0;

  const weekItems = getThisWeekItems(history);
  const weekTotal = weekItems.reduce((s, h) => s + h.price, 0);
  const weekAvg = weekItems.length ? Math.round(weekTotal / weekItems.length) : 0;
  const weekMostExpensive = weekItems.length ? weekItems.reduce((a, b) => a.price > b.price ? a : b) : null;

  // Most common place this week
  const placeCount = weekItems.reduce<Record<string, number>>((acc, h) => {
    const p = h.place || 'other';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});
  const topPlace = Object.entries(placeCount).sort((a, b) => b[1] - a[1])[0]?.[0];

  const grouped = groupByDate(history);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-500">กำลังโหลดประวัติมื้ออาหาร...</p>
      </div>
    );
  }

  return (
    <>
      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-slate-800">ประวัติการกิน 📜</h1>
          {history.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-colors border border-rose-200"
            >
              ล้างทั้งหมด
            </button>
          )}
        </div>

        {/* Today summary */}
        {todayItems.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
            <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">สรุปค่าอาหารวันนี้</p>
            <p className="text-lg font-black mb-3">
              วันนี้คุณกินไปแล้ว {todayItems.length} มื้อ ใช้ไปประมาณ{' '}
              <span className="text-yellow-300">฿{todayTotal}</span>
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
                <p className="text-white/70 text-[10px] font-semibold">จำนวนมื้อ</p>
                <p className="text-white font-black text-lg">{todayItems.length}</p>
              </div>
              <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
                <p className="text-white/70 text-[10px] font-semibold">ค่าใช้จ่ายรวม</p>
                <p className="text-yellow-300 font-black text-lg">฿{todayTotal}</p>
              </div>
              <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
                <p className="text-white/70 text-[10px] font-semibold">เฉลี่ยต่อมื้อ</p>
                <p className="text-white font-black text-lg">฿{todayAvg}</p>
              </div>
            </div>
          </div>
        )}

        {/* Weekly summary */}
        {weekItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">สรุปสัปดาห์นี้</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-400 font-semibold">ยอดรวม</p>
                <p className="text-xl font-black text-blue-600">฿{weekTotal}</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-400 font-semibold">จำนวนมื้อ</p>
                <p className="text-xl font-black text-slate-800">{weekItems.length} มื้อ</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-400 font-semibold">เฉลี่ยต่อมื้อ</p>
                <p className="text-xl font-black text-slate-800">฿{weekAvg}</p>
              </div>
              {weekMostExpensive && (
                <div className="bg-slate-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-slate-400 font-semibold">มื้อแพงสุด</p>
                  <p className="text-sm font-black text-slate-800 truncate">{weekMostExpensive.menuName}</p>
                  <p className="text-xs text-blue-500 font-bold">฿{weekMostExpensive.price}</p>
                </div>
              )}
            </div>
            {topPlace && (
              <p className="text-xs text-slate-500 font-semibold">
                แหล่งอาหารที่ใช้บ่อยสุด: <span className="text-slate-700 font-black">{translatePlace(topPlace)}</span>
              </p>
            )}
          </div>
        )}

        {/* History list or empty state */}
        {history.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <span className="text-5xl block mb-3">🍃</span>
            <p className="font-black text-slate-700 text-lg mb-1">ยังไม่มีประวัติการกิน</p>
            <p className="text-sm text-slate-500 mb-6">
              เริ่มจากการสุ่มเมนูแล้วบันทึกมื้อแรกของคุณ
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-md"
            >
              🎲 ไปสุ่มเมนู
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {grouped.map((group) => (
              <div key={group.dateLabel}>
                {/* Date header */}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-black text-slate-600">{group.dateLabel}</h2>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    รวม ฿{group.total}
                  </span>
                </div>
                {/* Items */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {group.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{item.menuName}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {item.place && (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                {translatePlace(item.place)}
                              </span>
                            )}
                            <span className="text-[10px] font-semibold text-slate-400">
                              🕒 {translateTime(item.dateTime)}
                            </span>
                            {item.storageMode && (
                              <span className="text-[10px] font-bold text-slate-300">
                                {item.storageMode === 'cloud' ? '☁️' : '💾'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-2">
                          <p className="text-base font-black text-blue-600">฿{item.price}</p>
                          {item.budget && item.budget > 0 && (
                            <p className={`text-[10px] font-bold ${item.price <= item.budget ? 'text-emerald-500' : 'text-rose-500'}`}>
                              / ฿{item.budget}
                            </p>
                          )}
                          <button
                            onClick={() => setDeleteTarget(item.id)}
                            className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none ml-1"
                            title="ลบรายการนี้"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={showClearModal}
        title="ล้างประวัติทั้งหมด?"
        message="การกระทำนี้ไม่สามารถย้อนกลับได้ ประวัติการกินทั้งหมดจะถูกลบออก"
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
        confirmLabel="ลบ"
        cancelLabel="ยกเลิก"
        danger
        onConfirm={() => deleteTarget && handleDeleteSingle(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
