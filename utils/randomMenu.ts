import { MenuItem, FilterCriteria } from '@/types/menu';

const normalize = (value: string) => value.trim().toLowerCase();

export const getRandomMenu = (
  visibleMenus: MenuItem[],
  criteria: FilterCriteria,
  excludedIds: string[] = []
): MenuItem | null => {
  const excludedSet = new Set(excludedIds);
  const excludedTags = criteria.excludeTags.map(normalize).filter(Boolean);

  const filtered = visibleMenus.filter((menu) => {
    // 1. ดัก ID ที่ถูกกดปฏิเสธ (Reject/Reroll) ไปแล้ว
    if (excludedSet.has(menu.id)) return false;
    
    // 2. ดักเรื่องงบประมาณ (ต้องไม่เกินงบ)
    if (menu.price > criteria.budget) return false;
    
    // 3. ดักเรื่องแหล่งอาหาร (รองรับค่า 'all')
    const menuPlace = normalize(menu.place || '');
    const criteriaPlace = normalize(criteria.place || 'all');
    if (criteriaPlace !== 'all' && menuPlace !== criteriaPlace) return false;
    
    // 4. 🔥 [แก้ไขจุดบั๊ก] ปรับเงื่อนไขระดับความหิวให้ยืดหยุ่นขึ้น ไม่บล็อกเมนูจนสุ่มไม่ขึ้น
    const menuHunger = normalize(menu.hungerLevel || 'medium');
    const criteriaHunger = normalize(criteria.hungerLevel || 'medium');
    
    // ถ้าผู้ใช้เลือก "หิวจัด (high)" แต่เมนูนั้นให้พลังงาน "น้อย (low)" -> ให้ปัดตก ป้องกันไม่อิ่ม
    if (criteriaHunger === 'high' && menuHunger === 'low') return false;
    // (หมายเหตุ: ถ้าบอสอยากให้ล็อกแบบตรงตัวเป๊ะๆ สามารถเปลี่ยนกลับเป็น if (menuHunger !== criteriaHunger) return false; ได้ครับ)

    // 5. ดักวัตถุดิบต้องห้าม (Exclude Tags)
    if (excludedTags.length === 0) return true;

    const menuName = normalize(menu.name);
    const menuTags = Array.isArray(menu.tags) ? menu.tags.map(normalize) : [];

    return !excludedTags.some((tag) =>
      menuName.includes(tag) || menuTags.some((menuTag) => menuTag.includes(tag) || tag.includes(menuTag))
    );
  });

  if (filtered.length === 0) return null;

  // ทำการสุ่มจากอาร์เรย์เมนูที่ผ่านเกณฑ์จริง
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
};