import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

/**
 * Foydalanuvchi geolokatsiyasi. Holat modul darajasida saqlanadi — ekranlar almashganda
 * ruxsat qayta so'ralmaydi va koordinatalar yo'qolmaydi.
 * status: idle | loading | granted | denied | unavailable
 */
let shared = { status: 'idle', coords: null, canAskAgain: true, checked: false };
const listeners = new Set();

const setShared = (patch) => {
  shared = { ...shared, ...patch };
  listeners.forEach((l) => l(shared));
};

async function readPosition() {
  try {
    const pos = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000)),
    ]);
    return { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
  } catch {
    const last = await Location.getLastKnownPositionAsync().catch(() => null);
    return last ? { lat: last.coords.latitude, lng: last.coords.longitude, accuracy: last.coords.accuracy } : null;
  }
}

async function locate() {
  setShared({ status: 'loading' });
  const coords = await readPosition();
  setShared(coords ? { status: 'granted', coords } : { status: 'unavailable' });
  return coords;
}

export function useUserLocation() {
  const [state, setState] = useState(shared);

  useEffect(() => {
    listeners.add(setState);
    // Ruxsat avval berilgan bo'lsa — hech narsa so'ramasdan joylashuvni jimgina aniqlaymiz
    if (!shared.checked && !shared.checking) {
      shared.checking = true;
      Location.getForegroundPermissionsAsync()
        .then((p) => {
          if (p.granted) locate();
          else if (p.status === 'denied') setShared({ status: 'denied', canAskAgain: p.canAskAgain !== false });
        })
        .catch(() => {})
        .finally(() => setShared({ checked: true }));
    }
    return () => listeners.delete(setState);
  }, []);

  const request = useCallback(async () => {
    setShared({ status: 'loading' });
    try {
      const enabled = await Location.hasServicesEnabledAsync().catch(() => true);
      if (!enabled) {
        setShared({ status: 'unavailable' });
        return null;
      }
      const p = await Location.requestForegroundPermissionsAsync();
      if (!p.granted) {
        setShared({ status: 'denied', canAskAgain: p.canAskAgain !== false });
        return null;
      }
      return await locate();
    } catch {
      setShared({ status: 'unavailable' });
      return null;
    }
  }, []);

  return { ...state, request, refresh: locate };
}
