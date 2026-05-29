import { supabase } from '@/lib/supabase/client';
import { MenuItem, HistoryItem } from '@/types/menu';

// 1. ดึงข้อมูลประวัติการกิน (พร้อมระบบความปลอดภัยดักล่ม)
export const getMealHistory = async (userId: string): Promise<HistoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('meal_history')
      .select('*')
      .eq('user_id', userId)
      .order('eaten_at', { ascending: false });

    if (error) {
      console.warn('Supabase reading history error:', error.message);
      return [];
    }

    return (data || []).map((h) => {
      // ป้องกันอาการวันที่ Parse ไม่ผ่านจนระบบค้าง
      let formattedDate = 'ไม่ระบุวันเวลา';
      try {
        if (h.eaten_at) {
          formattedDate = new Date(h.eaten_at).toLocaleString('th-TH');
        }
      } catch (dateErr) {
        console.error('Error parsing date:', dateErr);
      }

      return {
        id: h.id,
        menuId: h.menu_id || '',
        menuName: h.menu_name || 'เมนูไม่ระบุชื่อ',
        price: Number(h.price) || 0,
        place: h.place || '',
        dateTime: formattedDate
      };
    });
  } catch (err) {
    console.error('Fatal error fetching meal history:', err);
    return [];
  }
};

// 2. บันทึกประวัติการกินลง Cloud (ดักเช็คค่า UUID อย่างปลอดภัย)
export const addMealHistory = async (userId: string, menu: MenuItem) => {
  // ตรวจสอบโครงสร้างว่า menu.id เป็นรูปแบบ UUID หรือไม่ 
  // (ป้องกันปัญหาระบบสุ่มดึงเมนูดั้งเดิมเช่น 'm1', 'm2' ไปยัดใส่ช่อง UUID ในฐานข้อมูลไม่ได้)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUUID = uuidRegex.test(menu.id);

  const { error } = await supabase.from('meal_history').insert({
    user_id: userId,
    menu_id: isValidUUID ? menu.id : null, // ถ้าไม่ใช่ UUID จริง ให้ส่งเป็น null เพื่อไม่ให้หลังบ้านบล็อก
    menu_name: menu.name,
    price: menu.price,
    place: menu.place || 'ordered'
  });

  if (error) {
    console.error('Error saving history to Supabase:', error.message);
    throw error;
  }
};

// 3. ล้างประวัติมื้ออาหาร
export const clearMealHistory = async (userId: string) => {
  const { error } = await supabase
    .from('meal_history')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Error clearing history from Supabase:', error.message);
    throw error;
  }
};