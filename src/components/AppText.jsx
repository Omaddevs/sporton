import React, { forwardRef } from 'react';
import { Platform, Text as RNText, TextInput as RNTextInput, StyleSheet } from 'react-native';
import { fonts } from '../theme';

/**
 * Loyihadagi barcha matnlar uchun yagona sans-serif shrift.
 * `react-native`dagi Text/TextInput o'rniga shu komponentlar ishlatiladi;
 * style orqali berilgan fontFamily bo'lsa, u ustun turadi.
 */
const Text = forwardRef(function Text({ style, ...props }, ref) {
  return <RNText ref={ref} {...props} style={[styles.base, style]} />;
});

export const TextInput = forwardRef(function TextInput({ style, ...props }, ref) {
  return <RNTextInput ref={ref} {...props} style={[styles.base, style, styles.noFocusRing]} />;
});

const styles = StyleSheet.create({
  base: { fontFamily: fonts.sans },
  // Webda fokusdagi brauzer chegarasini (outline) o'chiramiz — inputlar fokusda o'zgarmaydi
  noFocusRing: Platform.select({ web: { outlineStyle: 'none', outlineWidth: 0, boxShadow: 'none' }, default: {} }),
});

export default Text;
