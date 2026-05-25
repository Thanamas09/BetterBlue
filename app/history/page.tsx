'use client';

import { useState, useEffect } from 'react';
import HistoryList from '@/components/HistoryList';
import { HistoryItem } from '@/types/menu';
import { getHistory, clearHistory } from '@/utils/storage';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClearAll = () => {
    if (confirm('คุณแน่ใจใช่ไหมว่าต้องการลบประวัติการทานอาหารทั้งหมด?')) {
      clearHistory();
      setHistory([]);
    }
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800">📜 ประวัติการกินคูลๆ</h1>
        <p className="text-sm text-slate-500">บันทึกช่วยจำ เมนูที่คุณสุ่มได้แล้วเลือกทาน</p>
      </div>

      <HistoryList history={history} onClear={handleClearAll} />
    </main>
  );
}