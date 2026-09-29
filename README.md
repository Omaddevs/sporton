# SportON — sport super app 🏃‍♂️🧡

Sport majmualarini bir joyga jamlovchi mobil ilova (React Native + Expo).
Foydalanuvchi yaqin atrofdagi mini-futbol maydoni, tennis korti, basseyn, fitnes-zalni topadi,
ma'lumotlarini ko'radi va **bron qiladi**; uyda **murabbiy bilan mashg'ulot** bajaradi;
**sport tadbirlari** va **yangiliklar**ni kuzatadi.

## Ishga tushirish

```bash
cd sporton
npm install
npx expo install --fix     # paket versiyalarini Expo SDK ga moslaydi
npm run web                # brauzerda: http://localhost:8081
```

- Eng oson yo'l: **START.bat** faylini ikki marta bosing.
- Brauzer: `npm run web` → **http://localhost:8081**
- Telefonda: `npm start`, so'ng **Expo Go** bilan QR kodni skanerlang.
- Android emulyator: `npm run android`, iOS simulyator: `npm run ios`.

## 3D ikonkalar

```bash
pip install pillow "rembg[cpu]"
npm run icons
```

Skript rasmlardan fonni olib tashlab, `assets/icons/` ga 512×512 shaffof PNG saqlaydi va `src/data/icons.js` ni yangilaydi.
Manba rasmlarni `assets/icons/source/` ga `stadium.jpg`, `dumbbell.jpg`, `trophy.jpg`, `calendar.jpg`, `megaphone.jpg` nomlari bilan qo'ying.
Ikonkalar tayyor bo'lmaguncha ilova vektor ikonkalarni ko'rsataveradi.

## Imkoniyatlar

| Bo'lim | Nimalar bor |
|---|---|
| **Bosh sahifa** | Brend gradienti, manzil tanlash, global qidiruv, 5 ta kategoriya kartasi, sport turlari, yaqin majmualar, keyingi bron eslatmasi, mashg'ulotlar, tadbirlar, yangiliklar |
| **Sport majmualari** | Qidiruv, sport turi bo'yicha filtr, saralash (yaqin / reyting / arzon), sevimlilar |
| **Majmua sahifasi** | Rasm galereyasi, ochiq/yopiq holati, qo'ng'iroq, Google Maps, ulashish, maydonlar va narxlar, qulayliklar, sharhlar |
| **Bron qilish** | Maydon → sana (14 kun) → vaqt slotlari (bo'sh / band / o'tgan / sizniki) → davomiylik (1–4 soat) → aloqa → to'lov usuli (Naqd, Click, Payme, Uzcard/Humo) → tasdiq, bron kodi, chipta |
| **Bronlarim** | Faol / tarix, bekor qilish (2 soat qoidasi), qo'ng'iroq, xarita, qayta bron |
| **Uyda mashg'ulot** | 8 ta dastur (HIIT, kuch, kardio, yoga, cho'zilish), haftalik statistika, interaktiv pleer: tayyorgarlik, taymer halqasi, dam olish, pauza, oldingi/keyingi mashq, +15 soniya, maslahatlar, vibratsiya, yakuniy natija |
| **Tadbirlar** | Filtrlar, qayta sanoq, ishtirokchilar soni, ro'yxatdan o'tish / chiqish |
| **Yangiliklar** | Kategoriyalar, asosiy maqola, o'xshash yangiliklar |
| **Profil** | Statistika, daraja, shaxsiy ma'lumotlarni tahrirlash, manzil, bildirishnomalar, ma'lumotlarni tozalash |

Barcha holat (bronlar, sevimlilar, natijalar, profil) **AsyncStorage** da saqlanadi — ilova yopilsa ham yo'qolmaydi.

## Loyiha tuzilmasi

```
App.js                      # Provayderlar + navigatsiya
src/
  theme/                    # Ranglar, gradientlar, soyalar, tipografiya
  context/AppContext.js     # Global holat (useReducer + AsyncStorage)
  navigation/               # Stack + Bottom Tabs
  data/                     # Demo ma'lumotlar: majmualar, mashg'ulotlar, tadbirlar, yangiliklar
  utils/                    # Sana/narx formatlash, bron mantiqi, havolalar
  components/               # Logo, SmartImage, UI to'plami, kartalar
  screens/                  # 19 ta ekran
```

## Keyingi qadamlar (production uchun)

1. **Backend** — `src/data/*` va `src/utils/booking.js` dagi `isSlotTakenByOthers` ni haqiqiy API bilan almashtiring
   (masalan, NestJS/Node + PostgreSQL yoki Supabase/Firebase). Bron yaratish `BookingScreen.confirm` ichida.
2. **Autentifikatsiya** — SMS orqali telefon raqam bilan kirish (Eskiz.uz / Playmobile).
3. **To'lov** — Click va Payme merchant API integratsiyasi.
4. **Xarita** — `react-native-maps` + `expo-location` bilan haqiqiy masofa va xaritada ko'rish.
5. **Video mashg'ulotlar** — `expo-video` bilan har bir mashq uchun video (data'da `videoUrl` maydoni qo'shing).
6. **Push bildirishnomalar** — `expo-notifications` (bron eslatmasi, tadbir kuni).
7. **Majmua egalari paneli** — maydonlar, narxlar, jadval va bronlarni boshqarish uchun web admin.

> Ilovadagi majmualar, telefon raqamlar, tadbirlar va yangiliklar — **demo ma'lumotlar**.
