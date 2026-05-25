'use client';

import { HistoryItem } from '@/types/menu';

interface HistoryListProps {
  history: HistoryItem[];
  onClear: () => void;
}

export default function HistoryList({ history, onClear }: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-slate-200 text-center text-slate-500">
        <span className="text-4xl block mb-2">🍽️</span>
        <p className="font-medium text-slate-600">ยังไม่มีประวัติการทานอาหารเลยจ้า</p>
        <p className="text-xs text-slate-400 mt-1">เมื่อคุณกด &quot;กินอันนี้แหละ!&quot; เมนูจะมาโผล่ที่นี่</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold text-slate-500">
          ประวัติทั้งหมด ({history.length} รายการ)
        </span>
        <button
          onClick={onClear}
          className="text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          🧹 ล้างประวัติทั้งหมด
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors gap-4"
            >
              <div>
                <h3 className="font-bold text-slate-800 text-base">{item.menuName}</h3>
                <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                  🕒 {item.dateTime}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg font-black text-blue-600">฿{item.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}