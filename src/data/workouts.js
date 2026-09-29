import { IMAGES } from './images';

// Mashqlar kutubxonasi
const EX = {
  jumpingJack: { name: 'Jumping Jack', icon: 'human-handsup', tip: 'Qo\'l va oyoqlarni bir vaqtda yoying, bir xil ritmni saqlang.' },
  squat: { name: 'Squat (o\'tirib-turish)', icon: 'human', tip: 'Tizzalar oyoq uchidan chiqmasin, orqa tekis bo\'lsin.' },
  pushUp: { name: 'Otjimaniya', icon: 'arm-flex', tip: 'Tana to\'g\'ri chiziq bo\'lsin, ko\'krak polga yaqin tushsin.' },
  plank: { name: 'Planka', icon: 'human-male', tip: 'Qorin mushaklarini tarang tuting, belni pastga tushirmang.' },
  lunge: { name: 'Hamla (Lunge)', icon: 'run', tip: 'Oldingi tizza 90° burchak hosil qilsin.' },
  burpee: { name: 'Berpi', icon: 'run-fast', tip: 'Tez, lekin texnikani buzmasdan bajaring.' },
  mountain: { name: 'Mountain climber', icon: 'run-fast', tip: 'Tizzalarni ko\'krakka navbat bilan tez torting.' },
  crunch: { name: 'Qorin press (Crunch)', icon: 'human-male', tip: 'Bo\'yinni qo\'llar bilan tortmang, qorin kuchi bilan ko\'taring.' },
  legRaise: { name: 'Oyoq ko\'tarish', icon: 'human-male', tip: 'Belni polga bosib turing, oyoqlarni sekin tushiring.' },
  highKnees: { name: 'Yuqori tizza bilan yugurish', icon: 'run', tip: 'Tizzalarni bel darajasigacha ko\'taring.' },
  jumpRope: { name: 'Arg\'amchi (imitatsiya)', icon: 'jump-rope', tip: 'Oyoq uchida yengil sakrang.' },
  glute: { name: 'Glute bridge', icon: 'human', tip: 'Tepada dumba mushaklarini 1 soniya siqib turing.' },
  wallSit: { name: 'Devor yonida o\'tirish', icon: 'human', tip: 'Tizzalar 90°, orqa devorga to\'liq tegsin.' },
  catCow: { name: 'Mushuk-sigir', icon: 'yoga', tip: 'Nafas olganda bel pastga, chiqarganda tepaga egiladi.' },
  downDog: { name: 'Pastga qaragan it', icon: 'yoga', tip: 'Tovonlarni polga yaqinlashtiring, umurtqa cho\'zilsin.' },
  warrior: { name: 'Jangchi pozasi', icon: 'yoga', tip: 'Qo\'llarni yon tomonga cho\'zing, nigoh oldinga.' },
  child: { name: 'Bola pozasi', icon: 'meditation', tip: 'Chuqur va sekin nafas oling, bo\'shashing.' },
  breathing: { name: 'Nafas mashqi', icon: 'meditation', tip: '4 soniya nafas oling, 4 soniya ushlang, 6 soniya chiqaring.' },
  hamstring: { name: 'Son orqa mushagini cho\'zish', icon: 'yoga', tip: 'Og\'riq emas, yengil taranglik sezilsin.' },
  shoulder: { name: 'Yelka cho\'zish', icon: 'human-handsup', tip: 'Har tomonga teng vaqt ajrating.' },
  shadowBox: { name: 'Soya boks', icon: 'karate', tip: 'Zarbalar tez va aniq, himoyani unutmang.' },
  sideShuffle: { name: 'Yon tomonga qadam', icon: 'run', tip: 'Past holatda, tez va yengil harakatlaning.' },
  skater: { name: 'Konkichi sakrashi', icon: 'run-fast', tip: 'Yon tomonga sakrab, bir oyoqda muvozanat saqlang.' },
  tricepDip: { name: 'Stul yordamida triceps', icon: 'arm-flex', tip: 'Tirsaklar orqaga qarasin.' },
};

const make = (ex, duration, rest = 15, reps) => ({ ...ex, duration, rest, reps });

const withTotals = (w) => {
  const seconds = w.exercises.reduce((s, e) => s + e.duration + e.rest, 0);
  return { ...w, minutes: Math.max(1, Math.round(seconds / 60)), exercisesCount: w.exercises.length };
};

export const WORKOUT_CATEGORIES = ['Hammasi', 'HIIT', 'Kuch', 'Kardio', 'Yoga', 'Cho\'zilish'];

export const WORKOUTS = [
  {
    id: 'w1',
    title: 'Butun tana uchun HIIT',
    category: 'HIIT',
    level: 'O\'rta',
    calories: 220,
    image: IMAGES.workout[0],
    coach: 'Aziz Karimov',
    equipment: 'Jihozsiz',
    featured: true,
    description: 'Yuqori intensivlikdagi interval mashg\'ulot: qisqa vaqtda maksimal kaloriya sarflang va chidamlilikni oshiring.',
    exercises: [
      make(EX.jumpingJack, 40), make(EX.squat, 40, 15, 20), make(EX.pushUp, 30, 20, 12),
      make(EX.mountain, 40), make(EX.lunge, 40), make(EX.burpee, 30, 20, 10),
      make(EX.plank, 45), make(EX.highKnees, 40, 0),
    ],
  },
  {
    id: 'w2',
    title: 'Boshlang\'ichlar uchun kuch mashqi',
    category: 'Kuch',
    level: 'Boshlang\'ich',
    calories: 140,
    image: IMAGES.workout[1],
    coach: 'Malika Yusupova',
    equipment: 'Jihozsiz',
    description: 'Sportni endi boshlayotganlar uchun: asosiy mushak guruhlarini xavfsiz mustahkamlash.',
    exercises: [
      make(EX.squat, 30, 20, 12), make(EX.pushUp, 30, 20, 8), make(EX.glute, 30, 20, 15),
      make(EX.tricepDip, 30, 20, 10), make(EX.wallSit, 30, 20), make(EX.plank, 30, 0),
    ],
  },
  {
    id: 'w3',
    title: 'Ertalabki yoga',
    category: 'Yoga',
    level: 'Boshlang\'ich',
    calories: 90,
    image: IMAGES.yoga[0],
    coach: 'Nigora Aliyeva',
    equipment: 'Gilamcha',
    featured: true,
    description: 'Kunni energiya bilan boshlang: yumshoq yoga pozalari va to\'g\'ri nafas olish.',
    exercises: [
      make(EX.breathing, 60, 10), make(EX.catCow, 45, 10), make(EX.downDog, 45, 10),
      make(EX.warrior, 45, 10), make(EX.child, 60, 0),
    ],
  },
  {
    id: 'w4',
    title: 'Qorin press — 15 daqiqa',
    category: 'Kuch',
    level: 'O\'rta',
    calories: 150,
    image: IMAGES.workout[2],
    coach: 'Aziz Karimov',
    equipment: 'Jihozsiz',
    description: 'Qorin mushaklarini kuchaytirish va tanani barqarorlashtirish uchun maqsadli kompleks.',
    exercises: [
      make(EX.crunch, 40, 15, 20), make(EX.legRaise, 40, 15, 15), make(EX.plank, 45),
      make(EX.mountain, 40), make(EX.crunch, 40, 15, 20), make(EX.plank, 60, 0),
    ],
  },
  {
    id: 'w5',
    title: 'Kardio: yog\' yoqish',
    category: 'Kardio',
    level: 'O\'rta',
    calories: 260,
    image: IMAGES.running[0],
    coach: 'Sherzod Nazarov',
    equipment: 'Jihozsiz',
    description: 'Yurak-qon tomir tizimini chiniqtiruvchi va ortiqcha vazndan xalos bo\'lishga yordam beruvchi kardio.',
    exercises: [
      make(EX.highKnees, 45), make(EX.jumpRope, 60), make(EX.skater, 45), make(EX.jumpingJack, 45),
      make(EX.sideShuffle, 45), make(EX.burpee, 30), make(EX.shadowBox, 60, 0),
    ],
  },
  {
    id: 'w6',
    title: 'Oyoq va dumba',
    category: 'Kuch',
    level: 'Yuqori',
    calories: 200,
    image: IMAGES.workout[3],
    coach: 'Malika Yusupova',
    equipment: 'Jihozsiz',
    description: 'Pastki tana uchun intensiv kompleks: kuch, shakl va chidamlilik.',
    exercises: [
      make(EX.squat, 45, 15, 25), make(EX.lunge, 45), make(EX.glute, 45, 15, 20),
      make(EX.wallSit, 60), make(EX.skater, 40), make(EX.squat, 45, 0, 25),
    ],
  },
  {
    id: 'w7',
    title: 'Kechki cho\'zilish',
    category: 'Cho\'zilish',
    level: 'Boshlang\'ich',
    calories: 60,
    image: IMAGES.yoga[1],
    coach: 'Nigora Aliyeva',
    equipment: 'Gilamcha',
    description: 'Kun davomida to\'plangan charchoqni chiqarib, yaxshi uxlashga tayyorlaydi.',
    exercises: [
      make(EX.shoulder, 45, 5), make(EX.hamstring, 60, 5), make(EX.catCow, 45, 5),
      make(EX.child, 60, 5), make(EX.breathing, 60, 0),
    ],
  },
  {
    id: 'w8',
    title: 'Futbolchilar uchun chaqqonlik',
    category: 'HIIT',
    level: 'Yuqori',
    calories: 240,
    image: IMAGES.football[0],
    coach: 'Sherzod Nazarov',
    equipment: 'Jihozsiz',
    description: 'Tezlik, portlovchi kuch va yo\'nalishni tez o\'zgartirish — maydonda ustunlik uchun.',
    exercises: [
      make(EX.highKnees, 40), make(EX.sideShuffle, 40), make(EX.skater, 40), make(EX.burpee, 30),
      make(EX.lunge, 40), make(EX.mountain, 40, 0),
    ],
  },
].map(withTotals);

export const getWorkout = (id) => WORKOUTS.find((w) => w.id === id);

export const WORKOUT_LEVELS = ['Boshlang\'ich', 'O\'rta', 'Yuqori'];

/** Daraja: 1..3 (indikator chiziqlari uchun) va rangi. */
export const levelInfo = (level) => {
  const n = Math.max(1, WORKOUT_LEVELS.indexOf(level) + 1);
  return { n, color: n === 1 ? '#16A34A' : n === 2 ? '#F59E0B' : '#EF4444' };
};

/** Mashq va dam olish soniyalari (tuzilma chizig'i uchun). */
export const workoutTiming = (w) => {
  const work = w.exercises.reduce((s, e) => s + e.duration, 0);
  const rest = w.exercises.reduce((s, e) => s + e.rest, 0);
  return { work, rest, total: work + rest };
};

/** Shu toifadagi boshqa mashg'ulotlar, yetmasa — qolganlari bilan to'ldiriladi. */
export const similarWorkouts = (w, limit = 5) => {
  const same = WORKOUTS.filter((x) => x.id !== w.id && x.category === w.category);
  const rest = WORKOUTS.filter((x) => x.id !== w.id && x.category !== w.category);
  return [...same, ...rest].slice(0, limit);
};
