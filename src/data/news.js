import { IMAGES } from './images';
import { daysFromNow } from '../utils/format';

export const NEWS_CATEGORIES = ['Hammasi', 'Futbol', 'Salomatlik', 'Tadbirlar', 'Maslahatlar'];

export const NEWS = [
  {
    id: 'n1',
    title: 'Toshkentda yangi mini-futbol maydonlari foydalanishga topshirildi',
    category: 'Futbol',
    date: daysFromNow(0, 9),
    image: IMAGES.football[0],
    readTime: 3,
    views: 2840,
    isNew: true,
    body: [
      'Poytaxtning bir qator tumanlarida zamonaviy sun\'iy maysali mini-futbol maydonlari ochildi. Maydonlar tungi yoritish, kiyinish xonalari va avtoturargohlar bilan jihozlangan.',
      'Endi ushbu maydonlarni SportON ilovasi orqali bir necha soniyada bron qilish mumkin: kerakli sana va vaqtni tanlang, to\'lov usulini belgilang — tamom.',
      'Mutaxassislarning fikricha, bunday maydonlar yoshlarning bo\'sh vaqtini mazmunli o\'tkazishi va sog\'lom turmush tarzini ommalashtirishga xizmat qiladi.',
    ],
  },
  {
    id: 'n2',
    title: 'Uyda mashq qilish: murabbiylardan 5 ta muhim maslahat',
    category: 'Maslahatlar',
    date: daysFromNow(-1, 12),
    image: IMAGES.workout[1],
    readTime: 4,
    views: 1920,
    body: [
      '1. Doimiylik — eng muhim omil. Haftasiga 3–4 marta 20 daqiqa, oyiga bir marta 2 soatdan ko\'ra samaraliroq.',
      '2. Qizishni o\'tkazib yubormang. 5 daqiqalik yengil kardio jarohatlar xavfini keskin kamaytiradi.',
      '3. Texnika tezlikdan muhimroq. Har bir mashqni to\'g\'ri bajarishga e\'tibor bering.',
      '4. Suv iching va yetarlicha uxlang — mushaklar aynan dam olish paytida tiklanadi.',
      '5. Natijalaringizni yozib boring. SportON ilovasi bajarilgan mashg\'ulotlarni avtomatik saqlaydi.',
    ],
  },
  {
    id: 'n3',
    title: 'Havaskorlar o\'rtasidagi kuzgi turnirlar mavsumi boshlandi',
    category: 'Tadbirlar',
    date: daysFromNow(-2, 15),
    image: IMAGES.basketball[1],
    readTime: 2,
    views: 1310,
    body: [
      'Kuzgi mavsumda mini-futbol, basketbol, tennis va voleybol bo\'yicha havaskorlar turnirlari o\'tkaziladi.',
      'Ro\'yxatdan o\'tish SportON ilovasining «Sport tadbirlari» bo\'limida ochiq. Joylar soni cheklangan.',
    ],
  },
  {
    id: 'n4',
    title: 'To\'g\'ri ovqatlanish: mashg\'ulotdan oldin va keyin nima yeyish kerak?',
    category: 'Salomatlik',
    date: daysFromNow(-3, 10),
    image: IMAGES.workout[2],
    readTime: 5,
    views: 3105,
    body: [
      'Mashg\'ulotdan 1–2 soat oldin murakkab uglevodlar (bo\'tqa, non, meva) energiya beradi.',
      'Mashg\'ulotdan keyingi 1 soat ichida oqsil (tuxum, tvorog, tovuq go\'shti) mushaklarni tiklashga yordam beradi.',
      'Va albatta — suv. Mashg\'ulot davomida har 15–20 daqiqada bir necha qultum suv iching.',
    ],
  },
  {
    id: 'n5',
    title: 'Bolalar uchun bepul suzish darslari tashkil etiladi',
    category: 'Salomatlik',
    date: daysFromNow(-5, 11),
    image: IMAGES.swimming[0],
    readTime: 2,
    views: 980,
    body: [
      'Bir qator sport majmualarida 7–14 yoshli bolalar uchun bepul suzish darslari tashkil etiladi.',
      'Darslar dam olish kunlari tajribali murabbiylar nazoratida o\'tadi. Ro\'yxatdan o\'tish majmualarning o\'zida.',
    ],
  },
  {
    id: 'n6',
    title: 'Yugurishni qanday boshlash kerak? Boshlovchilar uchun reja',
    category: 'Maslahatlar',
    date: daysFromNow(-7, 8),
    image: IMAGES.running[1],
    readTime: 4,
    views: 1540,
    body: [
      '1-hafta: 1 daqiqa yugurish + 2 daqiqa yurish, 8 marta takrorlang.',
      '2-hafta: 2 daqiqa yugurish + 2 daqiqa yurish, 6 marta.',
      '4-haftaga kelib 20 daqiqa to\'xtovsiz yugura olasiz. Asosiysi — shoshilmang va tanangizni tinglang.',
    ],
  },
];

export const getNews = (id) => NEWS.find((n) => n.id === id);
