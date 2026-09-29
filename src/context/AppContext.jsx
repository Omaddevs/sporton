import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDate, formatRange } from '../utils/format';

const STORAGE_KEY = '@sporton/state/v1';
const PERSISTED_KEYS = ['user', 'location', 'favorites', 'bookings', 'registeredEvents', 'completedWorkouts', 'notifications'];

const now = Date.now();
const initialNotifications = [
  {
    id: 'welcome',
    title: 'SportON\'ga xush kelibsiz! 🎉',
    text: 'Sport majmualarini toping, bron qiling va uyda mashq qiling — hammasi bir ilovada.',
    icon: 'sparkles-outline',
    date: new Date(now - 1000 * 60 * 30).toISOString(),
    read: false,
  },
  {
    id: 'promo',
    title: 'Birinchi bron uchun 10% chegirma',
    text: 'Hafta ichi 10:00–16:00 oralig\'idagi bronlarda maxsus narxlar.',
    icon: 'pricetag-outline',
    date: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: 'event',
    title: 'Mini-futbol kubogiga ro\'yxatdan o\'tish ochildi',
    text: 'Jamoangizni yig\'ing va Toshkent kubogida ishtirok eting!',
    icon: 'trophy-outline',
    date: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
    read: true,
  },
];

const initialState = {
  hydrated: false,
  user: { name: 'Sportchi', phone: '+998 90 123 45 67', email: '' },
  location: 'Yunusobod tumani',
  favorites: ['v1', 'v4'],
  bookings: [],
  registeredEvents: [],
  completedWorkouts: [],
  notifications: initialNotifications,
};

const pushNotification = (state, n) => ({
  ...state,
  notifications: [
    { id: `n-${Date.now()}`, date: new Date().toISOString(), read: false, ...n },
    ...state.notifications,
  ].slice(0, 50),
});

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true };
    case 'TOGGLE_FAVORITE': {
      const has = state.favorites.includes(action.id);
      return {
        ...state,
        favorites: has ? state.favorites.filter((f) => f !== action.id) : [action.id, ...state.favorites],
      };
    }
    case 'ADD_BOOKING': {
      const b = action.booking;
      return pushNotification(
        { ...state, bookings: [b, ...state.bookings] },
        {
          title: 'Bron tasdiqlandi ✅',
          text: `${b.venueName} · ${formatDate(b.date)}, ${formatRange(b.startHour, b.duration)}. Kod: ${b.code}`,
          icon: 'checkmark-circle-outline',
        }
      );
    }
    case 'CANCEL_BOOKING': {
      const b = state.bookings.find((x) => x.id === action.id);
      return pushNotification(
        { ...state, bookings: state.bookings.map((x) => (x.id === action.id ? { ...x, status: 'cancelled' } : x)) },
        { title: 'Bron bekor qilindi', text: `${b?.venueName || ''} — ${b?.code || ''}`, icon: 'close-circle-outline' }
      );
    }
    case 'TOGGLE_EVENT': {
      const has = state.registeredEvents.includes(action.id);
      return {
        ...state,
        registeredEvents: has
          ? state.registeredEvents.filter((e) => e !== action.id)
          : [action.id, ...state.registeredEvents],
      };
    }
    case 'COMPLETE_WORKOUT':
      return pushNotification(
        { ...state, completedWorkouts: [action.entry, ...state.completedWorkouts] },
        { title: 'Barakalla! 💪', text: `«${action.entry.title}» mashg'uloti yakunlandi.`, icon: 'barbell-outline' }
      );
    case 'SET_LOCATION':
      return { ...state, location: action.location };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.user } };
    case 'READ_ALL_NOTIFICATIONS':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    case 'RESET':
      return { ...initialState, hydrated: true };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        dispatch({ type: 'HYDRATE', payload: raw ? JSON.parse(raw) : {} });
      } catch {
        dispatch({ type: 'HYDRATE', payload: {} });
      }
    })();
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const data = {};
    PERSISTED_KEYS.forEach((k) => (data[k] = state[k]));
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [state]);

  const actions = useMemo(
    () => ({
      toggleFavorite: (id) => dispatch({ type: 'TOGGLE_FAVORITE', id }),
      addBooking: (booking) => dispatch({ type: 'ADD_BOOKING', booking }),
      cancelBooking: (id) => dispatch({ type: 'CANCEL_BOOKING', id }),
      toggleEvent: (id) => dispatch({ type: 'TOGGLE_EVENT', id }),
      completeWorkout: (entry) => dispatch({ type: 'COMPLETE_WORKOUT', entry }),
      setLocation: (location) => dispatch({ type: 'SET_LOCATION', location }),
      updateUser: (user) => dispatch({ type: 'UPDATE_USER', user }),
      readAllNotifications: () => dispatch({ type: 'READ_ALL_NOTIFICATIONS' }),
      clearNotifications: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    []
  );

  const value = useMemo(() => ({ ...state, ...actions }), [state, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
