'use client';

import { MenuItem } from '@/types/menu';

interface ConfirmationCardProps {
  menu: MenuItem;
  isLoggedIn: boolean;
  onAddMore: () => void;
}

export default function ConfirmationCard({ menu, isLoggedIn, onAddMore }: ConfirmationCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-400 overflow-hidden h-full flex flex-col animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">✅</span>
          <h2 className="text-lg font-black text-white">Order Confirmed Successfully</h2>
        </div>
        <p className="text-emerald-100 text-xs font-medium">ระบบได้รับคำสั่งอาหารของคุณเรียบร้อยแล้ว</p>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-4 p-6">

        {/* Order Status Badge */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-xl px-4 py-2.5">
          <span className="text-base">⏳</span>
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">สถานะออเดอร์</p>
            <p className="text-sm font-black text-amber-800">Waiting for restaurant confirmation</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">รายการที่สั่ง</p>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="flex justify-between items-center px-4 py-3 gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-800 text-sm truncate">{menu.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {menu.place === '7-11' ? '🏪 เซเว่น' :
                    menu.place === 'canteen' ? '🏢 โรงอาหาร' :
                    menu.place === 'ordered' ? '🍳 ตามสั่ง' : '👨‍🍳 ทำเอง'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-500 font-semibold block">x 1</span>
                <span className="text-base font-black text-blue-600">฿{menu.price}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-800 rounded-xl px-4 py-3 flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-semibold">จำนวนรายการ</span>
            <span className="text-white font-bold">1 รายการ</span>
          </div>
          <div className="border-t border-slate-700 pt-2 flex justify-between items-center">
            <span className="text-slate-300 font-bold text-sm">ราคารวมทั้งหมด</span>
            <span className="text-yellow-400 font-black text-xl">฿{menu.price}</span>
          </div>
        </div>

        {/* Storage status */}
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <span className="text-base mt-0.5">{isLoggedIn ? '☁️' : '💾'}</span>
          <p className="text-xs text-blue-700 font-semibold leading-relaxed">
            {isLoggedIn
              ? 'บันทึกประวัติการกินลง Cloud เรียบร้อยแล้ว คุณสามารถติดตามสถานะออเดอร์ได้จากหน้านี้'
              : 'บันทึกลงเครื่องแบบชั่วคราวแล้ว ล็อกอินเพื่อเก็บข้อมูลบน Cloud ถาวร'}
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <button
          onClick={onAddMore}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3 rounded-xl transition-all shadow-md text-sm flex justify-center items-center gap-2"
        >
          🎲 สุ่มเมนูรายการถัดไป
        </button>
      </div>
    </div>
  );
}
