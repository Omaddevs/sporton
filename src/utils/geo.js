// Toshkent markazi — joylashuv noma'lum bo'lganda xarita shu yerdan boshlanadi
export const TASHKENT = { lat: 41.3111, lng: 69.2797 };

const toRad = (d) => (d * Math.PI) / 180;

/** Ikki nuqta orasidagi masofa (km), Haversine formulasi. */
export function distanceKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const formatKm = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km < 10 ? km.toFixed(1) : Math.round(km)} km`);

/** Taxminiy yo'l vaqti: 3 km gacha piyoda (5 km/soat), undan uzoq — mashinada (~30 km/soat). */
export function travelTime(km) {
  if (km <= 3) return { icon: 'walk', text: `${Math.max(1, Math.round((km / 5) * 60))} daq` };
  const min = Math.max(1, Math.round((km / 30) * 60));
  return { icon: 'car', text: min >= 60 ? `${Math.floor(min / 60)} soat ${min % 60} daq` : `${min} daq` };
}
