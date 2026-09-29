import { IMAGES } from './images';

const REVIEWS = [
  { id: 'r1', author: 'Jasur T.', rating: 5, date: '2026-09-20', text: 'Maydon juda toza, yoritish zo\'r. Kechqurun o\'ynash uchun eng yaxshi joy!' },
  { id: 'r2', author: 'Dilnoza R.', rating: 4, date: '2026-09-14', text: 'Xodimlar xushmuomala, bron qilish oson. Faqat avtoturargoh biroz tor.' },
  { id: 'r3', author: 'Sardor A.', rating: 5, date: '2026-09-02', text: 'Narxi sifatiga mos. Kiyinish xonasi va dush bor, doim shu yerga kelamiz.' },
  { id: 'r4', author: 'Bekzod M.', rating: 4, date: '2026-08-27', text: 'Umuman olganda yaxshi, dam olish kunlari oldindan bron qilish kerak.' },
];

export const VENUES = [
  {
    id: 'v1',
    name: 'Champion Sport Majmuasi',
    type: 'football',
    district: 'Yunusobod tumani',
    address: 'Amir Temur ko\'chasi, 108',
    distance: 1.2,
    rating: 4.8,
    reviewsCount: 124,
    images: IMAGES.football,
    phone: '+998712001010',
    open: 7,
    close: 24,
    coords: { lat: 41.3602, lng: 69.2869 },
    amenities: ['parking', 'shower', 'locker', 'light', 'tribune', 'uniform', 'cafe', 'cctv'],
    description:
      'Champion — Yunusobodning eng mashhur mini-futbol majmuasi. FIFA standartidagi sun\'iy maysa, LED yoritish va 200 o\'rinli tribuna. Do\'stlar, korporativ jamoalar va turnirlar uchun ideal joy.',
    fields: [
      { id: 'f1', name: '1-maydon', size: '40×20 m', surface: 'Sun\'iy maysa', price: 250000 },
      { id: 'f2', name: '2-maydon', size: '40×20 m', surface: 'Sun\'iy maysa', price: 250000 },
      { id: 'f3', name: 'Katta maydon', size: '60×40 m', surface: 'Sun\'iy maysa', price: 400000 },
    ],
    reviews: REVIEWS,
    popular: true,
  },
  {
    id: 'v2',
    name: 'Next Level Tennis',
    type: 'tennis',
    district: 'Mirzo Ulug\'bek tumani',
    address: 'Buyuk Ipak Yo\'li, 45',
    distance: 2.5,
    rating: 4.7,
    reviewsCount: 85,
    images: IMAGES.tennis,
    phone: '+998712002020',
    open: 6,
    close: 23,
    coords: { lat: 41.3385, lng: 69.3345 },
    amenities: ['parking', 'shower', 'locker', 'light', 'cafe', 'water'],
    description:
      'Yopiq va ochiq kortlarga ega zamonaviy tennis markazi. Professional murabbiylar bilan individual darslar va raketka ijarasi mavjud.',
    fields: [
      { id: 'f1', name: 'Yopiq kort №1', size: 'Hard', surface: 'Hard', price: 180000 },
      { id: 'f2', name: 'Ochiq kort №2', size: 'Grunt', surface: 'Grunt', price: 140000 },
    ],
    reviews: REVIEWS.slice(0, 3),
    popular: true,
  },
  {
    id: 'v3',
    name: 'Aqua Life Suzish',
    type: 'swimming',
    district: 'Yakkasaroy tumani',
    address: 'Shota Rustaveli ko\'chasi, 12',
    distance: 3.1,
    rating: 4.6,
    reviewsCount: 64,
    images: IMAGES.swimming,
    phone: '+998712003030',
    open: 7,
    close: 22,
    coords: { lat: 41.2912, lng: 69.2567 },
    amenities: ['parking', 'shower', 'locker', 'medical', 'cafe', 'ac'],
    description:
      '25 metrli isitiladigan basseyn, bolalar uchun alohida hovuz va sauna. Suzishni o\'rganish kurslari barcha yoshdagilar uchun.',
    fields: [
      { id: 'f1', name: 'Umumiy basseyn (1 kishi)', size: '25 m', surface: 'Basseyn', price: 70000 },
      { id: 'f2', name: 'Alohida yo\'lak', size: '25 m', surface: 'Basseyn', price: 150000 },
    ],
    reviews: REVIEWS.slice(1),
  },
  {
    id: 'v4',
    name: 'Power Fitness',
    type: 'gym',
    district: 'Chilonzor tumani',
    address: 'Bunyodkor shoh ko\'chasi, 23',
    distance: 1.8,
    rating: 4.9,
    reviewsCount: 212,
    images: IMAGES.gym,
    phone: '+998712004040',
    open: 6,
    close: 24,
    coords: { lat: 41.2856, lng: 69.2044 },
    amenities: ['parking', 'shower', 'locker', 'wifi', 'ac', 'water', 'cctv'],
    description:
      '1500 m² maydonga ega fitnes-klub: kuch zali, kardio zona, guruh mashg\'ulotlari va shaxsiy murabbiylar. Bir martalik tashrif yoki abonement.',
    fields: [
      { id: 'f1', name: 'Bir martalik tashrif', size: 'Zal', surface: 'Fitnes zal', price: 60000 },
      { id: 'f2', name: 'Shaxsiy murabbiy bilan', size: 'Zal', surface: 'Fitnes zal', price: 180000 },
    ],
    reviews: REVIEWS,
    popular: true,
  },
  {
    id: 'v5',
    name: 'Basket Zone',
    type: 'basketball',
    district: 'Uchtepa tumani',
    address: 'Lutfiy ko\'chasi, 7',
    distance: 3.4,
    rating: 4.5,
    reviewsCount: 96,
    images: IMAGES.basketball,
    phone: '+998712005050',
    open: 8,
    close: 23,
    coords: { lat: 41.2961, lng: 69.1809 },
    amenities: ['parking', 'shower', 'locker', 'light', 'tribune'],
    description:
      'Parket qoplamali yopiq basketbol zali. 5×5 o\'yinlar, 3×3 turnirlar va bolalar sektsiyalari uchun.',
    fields: [{ id: 'f1', name: 'Asosiy zal', size: '28×15 m', surface: 'Parket', price: 220000 }],
    reviews: REVIEWS.slice(0, 2),
  },
  {
    id: 'v6',
    name: 'Olimp Arena',
    type: 'football',
    district: 'Yunusobod tumani',
    address: 'Yunusobod 11-mavze, 3A',
    distance: 0.8,
    rating: 4.7,
    reviewsCount: 158,
    images: [IMAGES.football[1], IMAGES.football[2], IMAGES.football[0]],
    phone: '+998712006060',
    open: 8,
    close: 24,
    coords: { lat: 41.3712, lng: 69.2905 },
    amenities: ['parking', 'shower', 'locker', 'light', 'uniform', 'water'],
    description:
      'Uyingizga eng yaqin mini-futbol maydoni. Yopiq (qishki) va ochiq maydonlar, to\'p va manishka bepul beriladi.',
    fields: [
      { id: 'f1', name: 'Yopiq maydon', size: '42×22 m', surface: 'Sun\'iy maysa', price: 300000 },
      { id: 'f2', name: 'Ochiq maydon', size: '40×20 m', surface: 'Sun\'iy maysa', price: 220000 },
    ],
    reviews: REVIEWS.slice(1),
    popular: true,
  },
  {
    id: 'v7',
    name: 'Bunyodkor Mini Futbol',
    type: 'football',
    district: 'Chilonzor tumani',
    address: 'Chilonzor 9-kvartal, 14',
    distance: 4.2,
    rating: 4.4,
    reviewsCount: 73,
    images: [IMAGES.football[2], IMAGES.football[0]],
    phone: '+998712007070',
    open: 9,
    close: 24,
    coords: { lat: 41.2759, lng: 69.2033 },
    amenities: ['parking', 'locker', 'light', 'water'],
    description: 'Qulay narxlardagi ochiq mini-futbol maydonlari. Kechki o\'yinlar uchun kuchli projektorlar.',
    fields: [
      { id: 'f1', name: '1-maydon', size: '40×20 m', surface: 'Sun\'iy maysa', price: 180000 },
      { id: 'f2', name: '2-maydon', size: '40×20 m', surface: 'Sun\'iy maysa', price: 180000 },
    ],
    reviews: REVIEWS.slice(2),
  },
  {
    id: 'v8',
    name: 'Fighter Boxing Club',
    type: 'boxing',
    district: 'Shayxontohur tumani',
    address: 'Navoiy ko\'chasi, 30',
    distance: 2.9,
    rating: 4.8,
    reviewsCount: 58,
    images: IMAGES.boxing,
    phone: '+998712008080',
    open: 7,
    close: 22,
    coords: { lat: 41.3219, lng: 69.2451 },
    amenities: ['shower', 'locker', 'ac', 'water', 'medical'],
    description: 'Boks va kikboksing klubi. Professional ring, guruh va individual mashg\'ulotlar, sparring kechalari.',
    fields: [
      { id: 'f1', name: 'Guruh mashg\'uloti', size: 'Ring', surface: 'Ring', price: 80000 },
      { id: 'f2', name: 'Individual trening', size: 'Ring', surface: 'Ring', price: 200000 },
    ],
    reviews: REVIEWS.slice(0, 3),
  },
  {
    id: 'v9',
    name: 'Zen Yoga Studio',
    type: 'yoga',
    district: 'Mirobod tumani',
    address: 'Oybek ko\'chasi, 18',
    distance: 2.1,
    rating: 4.9,
    reviewsCount: 47,
    images: IMAGES.yoga,
    phone: '+998712009090',
    open: 7,
    close: 21,
    coords: { lat: 41.2995, lng: 69.2767 },
    amenities: ['shower', 'locker', 'ac', 'wifi', 'water'],
    description: 'Shinam yoga studiyasi: hatha, vinyasa va meditatsiya darslari. Gilamcha va jihozlar bepul.',
    fields: [{ id: 'f1', name: 'Guruh darsi', size: 'Studiya', surface: 'Studiya', price: 65000 }],
    reviews: REVIEWS.slice(1, 3),
  },
  {
    id: 'v10',
    name: 'Smash Voleybol Markazi',
    type: 'volleyball',
    district: 'Sergeli tumani',
    address: 'Yangi Sergeli ko\'chasi, 5',
    distance: 5.6,
    rating: 4.3,
    reviewsCount: 31,
    images: IMAGES.volleyball,
    phone: '+998712001111',
    open: 8,
    close: 22,
    coords: { lat: 41.2256, lng: 69.2201 },
    amenities: ['parking', 'locker', 'light', 'water'],
    description: 'Yopiq voleybol zali va plyaj voleyboli uchun qumli maydon.',
    fields: [
      { id: 'f1', name: 'Yopiq zal', size: '18×9 m', surface: 'Taraflex', price: 160000 },
      { id: 'f2', name: 'Plyaj maydoni', size: '16×8 m', surface: 'Qum', price: 120000 },
    ],
    reviews: REVIEWS.slice(0, 2),
  },
];

export const getVenue = (id) => VENUES.find((v) => v.id === id);

export const minPrice = (venue) => Math.min(...venue.fields.map((f) => f.price));

/** Hozir ochiqmi (soat va daqiqa hisobga olinadi). */
export const isOpenNow = (venue, now = new Date()) => {
  const h = now.getHours() + now.getMinutes() / 60;
  return h >= venue.open && h < venue.close;
};

/** "Ochiq · 24:00 gacha" / "Yopiq · 07:00 da ochiladi" ko'rinishidagi holat matni. */
export const openStatus = (venue, now = new Date()) => {
  const open = isOpenNow(venue, now);
  const pad = (n) => String(n).padStart(2, '0');
  return {
    open,
    label: open ? 'Ochiq' : 'Yopiq',
    hint: open ? `${pad(venue.close % 24)}:00 gacha` : `${pad(venue.open % 24)}:00 da ochiladi`,
  };
};

/** Bir xil sport turidagi boshqa majmualar; yetmasa — mashhurlari bilan to'ldiriladi. */
export const similarVenues = (venue, limit = 6) => {
  const same = VENUES.filter((v) => v.id !== venue.id && v.type === venue.type);
  const rest = VENUES.filter((v) => v.id !== venue.id && v.type !== venue.type && v.popular);
  return [...same, ...rest].slice(0, limit);
};

/** Tumanlar bo'yicha majmualar soni (filtr uchun). */
export const districtCounts = () =>
  VENUES.reduce((acc, v) => {
    acc[v.district] = (acc[v.district] || 0) + 1;
    return acc;
  }, {});
