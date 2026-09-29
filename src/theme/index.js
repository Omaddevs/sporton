import { Platform } from 'react-native';

export const colors = {
  primary: '#0078FF',
  primaryDark: '#0062D6',
  primaryLight: '#3D9BFF',
  primarySoft: '#E6F2FF',
  // Logodagi "ON" yashil aksenti
  accent: '#8CD80B',
  blue: '#1F6BFF',
  blueDark: '#1554D6',
  blueSoft: '#EAF1FF',
  dark: '#141824',
  text: '#141824',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  bg: '#F5F6F8',
  card: '#FFFFFF',
  border: '#ECEEF2',
  // Noor uslubi: yumshoq kulrang yuzalar, ikkinchi darajali matn, binafsha aksent
  surface: '#F3F4F6',
  textSoft: '#8E9299',
  violet: '#7B5CFF',
  violetDark: '#6F4DF5',
  success: '#16A34A',
  successSoft: '#E8F7EE',
  danger: '#EF4444',
  dangerSoft: '#FDECEC',
  warning: '#F59E0B',
  star: '#FBBF24',
  white: '#FFFFFF',
  overlay: 'rgba(20,24,36,0.45)',
};

export const gradients = {
  primary: ['#3D9BFF', '#0078FF', '#0062D6'],
  dark: ['#232838', '#141824'],
  blue: ['#4C8DFF', '#1F6BFF'],
  violet: ['#8B6BFF', '#6F4DF5'],
  promo: ['#2E8FFF', '#0078FF'],
  imageFade: ['transparent', 'rgba(0,0,0,0.65)'],
};

// Butun ilova shrifti: sans-serif. Webda Inter (Google Fonts), iOS'da San Francisco, Android'da Roboto.
export const fonts = {
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: "Inter, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  }),
};

export const radius = { xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 28, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

export const shadow = Platform.select({
  ios: {
    shadowColor: '#1F2937',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  android: { elevation: 3 },
  default: { boxShadow: '0 6px 18px rgba(31,41,55,0.08)' },
});

export const shadowStrong = Platform.select({
  ios: {
    shadowColor: '#0078FF',
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  android: { elevation: 8 },
  default: { boxShadow: '0 8px 20px rgba(0,120,255,0.3)' },
});

export const type = {
  display: { fontFamily: fonts.sans, fontSize: 30, fontWeight: '900', letterSpacing: -0.5, color: colors.text },
  h1: { fontFamily: fonts.sans, fontSize: 24, fontWeight: '800', letterSpacing: -0.3, color: colors.text },
  h2: { fontFamily: fonts.sans, fontSize: 20, fontWeight: '800', color: colors.text },
  h3: { fontFamily: fonts.sans, fontSize: 16, fontWeight: '700', color: colors.text },
  body: { fontFamily: fonts.sans, fontSize: 14, fontWeight: '400', color: colors.text, lineHeight: 21 },
  small: { fontFamily: fonts.sans, fontSize: 12, fontWeight: '500', color: colors.textMuted },
  label: { fontFamily: fonts.sans, fontSize: 13, fontWeight: '600', color: colors.text },
};
