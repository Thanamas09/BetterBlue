import { MenuItem } from '@/types/menu';

export const DEFAULT_MENUS: MenuItem[] = [
  {
    id: 'm1',
    name: 'ข้าวเพราไก่ไข่ดาว',
    price: 60,
    place: 'ordered',
    hungerLevel: 'medium',
    tags: ['ไก่', 'เผ็ด', 'กะเพรา'],
    nutrition: { carbs: 'สูง', protein: 'สูง', fat: 'ปานกลาง', veggies: 'น้อย' },
    reason: 'เมนูสิ้นคิดแต่ได้โปรตีนเน้นๆ จากไก่และไข่ดาว อิ่มอร่อยตามงบ!',
    isDefault: true
  },
  {
    id: 'm2',
    name: 'ข้าวไข่เจียวหมูสับ',
    price: 45,
    place: 'ordered',
    hungerLevel: 'low',
    tags: ['หมู', 'ไข่', 'ทอด'],
    nutrition: { carbs: 'สูง', protein: 'ปานกลาง', fat: 'สูง', veggies: 'ไม่มี' },
    reason: 'ประหยัดงบสุดๆ ได้ความหอมฟูของไข่เจียวร้อนๆ',
    isDefault: true
  },
  {
    id: 'm3',
    name: 'แซนวิชแฮมชีส + นมจืด',
    price: 42,
    place: '7-11',
    hungerLevel: 'low',
    tags: ['ขนมปัง', 'ชีส', 'นม'],
    nutrition: { carbs: 'ปานกลาง', protein: 'ปานกลาง', fat: 'ปานกลาง', veggies: 'ไม่มี' },
    reason: 'รีบเร่งแค่ไหนก็อิ่มได้ สารอาหารครบถ้วนพลังงานพร้อม',
    isDefault: true
  },
  {
    id: 'm4',
    name: 'ข้าวกล่องเซเว่น อกไก่และข้าวไรซ์เบอร์รี่',
    price: 69,
    place: '7-11',
    hungerLevel: 'medium',
    tags: ['อกไก่', 'คลีน', 'สุขภาพ'],
    nutrition: { carbs: 'ปานกลาง', protein: 'สูงมาก', fat: 'ต่ำ', veggies: 'น้อย' },
    reason: 'สายเฮลตี้ต้องกดไลก์ แคลต่ำ โปรตีนสูงลิ่ว',
    isDefault: true
  },
  {
    id: 'm5',
    name: 'ก๋วยเตี๋ยวต้มยำหมูโบราณ',
    price: 55,
    place: 'canteen',
    hungerLevel: 'medium',
    tags: ['เส้น', 'หมู', 'เผ็ด', 'ต้มยำ'],
    nutrition: { carbs: 'สูง', protein: 'ปานกลาง', fat: 'ปานกลาง', veggies: 'ปานกลาง' },
    reason: 'แซ่บถึงใจ อิ่มกำลังดี มีผักโรยและถั่วงอกเพิ่มเนื้อสัมผัส',
    isDefault: true
  },
  {
    id: 'm6',
    name: 'สเต๊กไก่พริกไทยดำ + สลัดผัก',
    price: 80,
    place: 'canteen',
    hungerLevel: 'high',
    tags: ['ไก่', 'สเต๊ก', 'ผัก', 'จัดเต็ม'],
    nutrition: { carbs: 'ต่ำ', protein: 'สูงมาก', fat: 'ปานกลาง', veggies: 'สูง' },
    reason: 'หิวจัดต้องจานนี้ โปรตีนแน่นๆ พร้อมไฟเบอร์จากผักสลัดสด',
    isDefault: true
  },
  {
    id: 'm7',
    name: 'มาม่าเกาหลีใส่ไข่และชีส',
    price: 35,
    place: 'cooking',
    hungerLevel: 'medium',
    tags: ['ต้ม', 'เส้น', 'เผ็ด', 'ชีส'],
    nutrition: { carbs: 'สูงมาก', protein: 'ปานกลาง', fat: 'สูง', veggies: 'ไม่มี' },
    reason: 'เซฟงบปลายเดือน แซ่บซี๊ดชีสเยิ้มๆ ทำง่ายใน 3 นาที',
    isDefault: true
  },
  {
    id: 'm8',
    name: 'ข้าวหน้าหมูสไลด์ผัดซีอิ๊วญี่ปุ่น',
    price: 75,
    place: 'cooking',
    hungerLevel: 'high',
    tags: ['หมู', 'ทำเอง', 'ญี่ปุ่น'],
    nutrition: { carbs: 'สูง', protein: 'สูง', fat: 'ปานกลาง', veggies: 'น้อย' },
    reason: 'ทำเองได้เยอะสะใจ หมูนุ่มๆ ซอสหวานเค็มกลมกล่อม',
    isDefault: true
  }
];