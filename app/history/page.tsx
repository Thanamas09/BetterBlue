'use client';

import { useState, useEffect } from 'react';
import { HistoryItem } from '@/types/menu';
import { getMealHistory, clearMealHistory } from '@/utils/supabaseHistory';
import { getLocalFallbackHistory } from '@/utils/storage';
import { supabase } from '@/lib/supabase/client';

export default function HistoryPage() {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistoryData = async (uid?: string) => {
    setLoading(true);
    try {
      if (uid) {
        const dbHistory = await getMealHistory(uid);
        setHistory(dbHistory);
      } else {
        setHistory(getLocalFallbackHistory());
      }
    } catch (err) {
      console.error('Failed to load history data component level:', err);
      setHistory(getLocalFallbackHistory());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const uid = session?.user?.id;
      setUserId(uid);
      loadHistoryData(uid);
    });
  }, []);

  const handleClear = async () => {
    if (!confirm('คุณต้องการล้างข้อมูลประวัติการกินทั้งหมดใช่หรือไม่?')) return;
    
    try {
      if (userId) {
        await clearMealHistory(userId);
        await loadHistoryData(userId);
      } else {
        localStorage.removeItem('betterblue_local_fallback_history');
        setHistory([]);
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบข้อมูล กรุณลองใหม่อีกครั้ง');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center gap-2">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-400 mt-2">⏳ กำลังโหลดบันทึกประวัติมื้ออาหารจากคลาวด์...</p>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          {/* ปรับสีเป็น text-white และคำอธิบายเป็น text-slate-300 เพื่อความชัดเจนบน Dark Theme */}
          <h1 className="text-2xl font-black text-white">📜 ประวัติการกินอาหาร</h1>
        </div>
        {history.length > 0 && (
          <button 
            onClick={handleClear} 
            className="text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-colors"
          >
            💥 ล้างประวัติทั้งหมด
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <span className="text-4xl block mb-2">🍃</span>
          <p className="font-bold text-slate-500">ยังไม่มีบันทึกประวัติการกิน</p>
          <p className="text-xs text-slate-400 mt-1">มื้อถัดไปหลังกดสุ่มแล้ว อย่าลืมกดปุ่มบันทึกเพื่อสะสมสถิตินะครับ</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {history.map((item) => (
            <div 
              key={item.id} 
              className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center gap-3 transition-all hover:border-slate-200"
            >
              <div>
                <h3 className="font-black text-slate-800 text-sm">{item.menuName}</h3>
                <span className="text-[11px] text-slate-400 font-semibold">{item.dateTime}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-blue-600 block">฿{item.price}</span>
                {item.place && (
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded-md mt-0.5 inline-block">
                    {item.place === 'ordered' ? '🍳 ตามสั่ง' : item.place === 'canteen' ? '🏢 โรงอาหาร' : item.place === '7-11' ? '🏪 เซเว่น' : '👨‍🍳 ทำเอง'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}