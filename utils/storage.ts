import { MenuItem, HistoryItem } from '@/types/menu';
import { DEFAULT_MENUS } from '@/data/menus';

const KEYS = {
  CUSTOM_MENUS: 'betterblue_custom_menus',
  EDITED_MENUS: 'betterblue_edited_menus',
  DELETED_MENU_IDS: 'betterblue_deleted_menu_ids', // Key ใหม่ตามบรีฟ
  HISTORY: 'betterblue_history',
};

// --- ส่วนจัดการ Custom Menus (เพิ่มเอง) ---
export const getCustomMenus = (): MenuItem[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.CUSTOM_MENUS);
  return data ? JSON.parse(data) : [];
};

export const saveCustomMenus = (menus: MenuItem[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.CUSTOM_MENUS, JSON.stringify(menus));
};

// --- ส่วนจัดการ Edited Menus (บันทึกตัวดั้งเดิมที่โดนแก้) ---
export const getEditedMenus = (): MenuItem[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.EDITED_MENUS);
  return data ? JSON.parse(data) : [];
};

export const saveEditedMenus = (menus: MenuItem[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.EDITED_MENUS, JSON.stringify(menus));
};

// --- ส่วนจัดการ บัญชีดำเมนูที่ถูกลบ/ซ่อน (Deleted Menu IDs) ---
export const getDeletedMenuIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.DELETED_MENU_IDS);
  return data ? JSON.parse(data) : [];
};

export const saveDeletedMenuIds = (ids: string[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.DELETED_MENU_IDS, JSON.stringify(ids));
};

// --- ส่วนดึงเมนูทั้งหมดแบบผสม และกรองบัญชีดำออก (Core) ---
export const getAllMenus = (): MenuItem[] => {
  const custom = getCustomMenus();
  const edited = getEditedMenus();
  const deletedIds = getDeletedMenuIds();
  
  // 1. เอา Default มาตั้ง และเช็คว่าตัวไหนเคยโดนอัปเดตข้อมูลไหม
  const mergedDefaults = DEFAULT_MENUS.map((defMenu) => {
    const editedVersion = edited.find((edit) => edit.id === defMenu.id);
    return editedVersion ? { ...editedVersion, isDefault: true } : defMenu;
  });

  // 2. รวม Default + Custom เข้าด้วยกัน
  const allCombined = [...mergedDefaults, ...custom];

  // 3. กรอง (Filter) ตัวที่ติดบัญชีดำใน deletedMenuIds ออกไปให้หมด
  return allCombined.filter((menu) => !deletedIds.includes(menu.id));
};

// --- ส่วนประมวลผลการลบแบบแยกร่าง (Delete Core Logic) ---
export const deleteMenu = (id: string): void => {
  const customList = getCustomMenus();
  const editedList = getEditedMenus();
  const deletedIds = getDeletedMenuIds();

  // ตรวจสอบว่าเป็น Custom Menu หรือไม่
  const isCustom = customList.some((m) => m.id === id);

  if (isCustom) {
    // กฎข้อ 1: ลบออกจาก customMenus จริงๆ
    const updatedCustom = customList.filter((m) => m.id !== id);
    saveCustomMenus(updatedCustom);
  } else {
    // กฎข้อ 2: ถ้าเป็น Default (หรือเคยถูก edit ไว้) ให้ถอดสตรีมออกจาก edited และเอา ID เข้าบัญชีดำ
    const updatedEdited = editedList.filter((m) => m.id !== id);
    saveEditedMenus(updatedEdited);
  }

  // ไม่ว่าจะสัญชาติไหน ดัน ID เข้าไปเก็บที่ deletedMenuIds เพื่อความปลอดภัยในการดึงข้อมูลย้อนหลัง
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    saveDeletedMenuIds(deletedIds);
  }
};

// --- ระบบกู้คืนเมนูอาหารที่ถูกซ่อน/ลบ (Restore Option) ---
export const restoreMenu = (id: string): void => {
  const deletedIds = getDeletedMenuIds();
  const updatedIds = deletedIds.filter((deletedId) => deletedId !== id);
  saveDeletedMenuIds(updatedIds);
};

// --- ส่วนจัดการประวัติการทานอาหาร (คงเดิม) ---
export const getHistory = (): HistoryItem[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(KEYS.HISTORY);
  return data ? JSON.parse(data) : [];
};

export const addHistory = (item: Omit<HistoryItem, 'id' | 'dateTime'>): void => {
  if (typeof window === 'undefined') return;
  const current = getHistory();
  const newItem: HistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    dateTime: new Date().toLocaleString('th-TH'),
  };
  localStorage.setItem(KEYS.HISTORY, JSON.stringify([newItem, ...current]));
};

export const clearHistory = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEYS.HISTORY);
};

// ฟังก์ชันซัพพอร์ตหน้าแอดเมนูเวอร์ชันก่อนหน้า
export const saveCustomMenu = saveCustomMenus;
export const updateMenu = (updatedMenu: MenuItem): void => {
  if (updatedMenu.isDefault) {
    const editedList = getEditedMenus();
    const index = editedList.findIndex((m) => m.id === updatedMenu.id);
    if (index > -1) editedList[index] = updatedMenu;
    else editedList.push(updatedMenu);
    saveEditedMenus(editedList);
  } else {
    const customList = getCustomMenus();
    const index = customList.findIndex((m) => m.id === updatedMenu.id);
    if (index > -1) {
      customList[index] = updatedMenu;
      saveCustomMenus(customList);
    }
  }
};