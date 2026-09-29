import { Platform, useWindowDimensions } from 'react-native';

/** Shu kenglikdan boshlab sayt «desktop» ko'rinishida ochiladi (yuqori menyu, katta hero). */
export const DESKTOP_MIN = 960;
export const CONTENT_MAX = 1240;

/** Ekran o'lchamiga qarab maket parametrlari: desktop yoki mobil, kontent kengligi, ustun kengligi. */
export function useLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_MIN;
  const gutter = isDesktop ? 32 : 16;
  const contentWidth = Math.min(width - gutter * 2, CONTENT_MAX);
  const colWidth = (cols, gap = 20) => Math.floor((contentWidth - gap * (cols - 1)) / cols);
  return { width, isDesktop, gutter, contentWidth, colWidth };
}

/** Faqat brauzerda ishlaydigan silliq animatsiya (hover). */
export const webTransition = Platform.select({
  web: { transitionProperty: 'transform, box-shadow, background-color, opacity', transitionDuration: '180ms' },
  default: {},
});

export const hoverLift = Platform.select({
  web: { transform: [{ translateY: -4 }], boxShadow: '0 16px 32px rgba(31,41,55,0.14)' },
  default: {},
});
