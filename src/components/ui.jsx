import React, { useCallback } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, shadowStrong, type } from '../theme';

export function Button({ title, onPress, variant = 'primary', icon, disabled, loading, style, size = 'lg' }) {
  const v = VARIANTS[variant];
  const height = size === 'sm' ? 38 : size === 'md' ? 46 : 54;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        { height, backgroundColor: v.bg, borderColor: v.border },
        variant === 'primary' && !disabled && shadowStrong,
        (pressed || disabled) && { opacity: disabled ? 0.45 : 0.85, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={size === 'sm' ? 16 : 19} color={v.fg} style={{ marginRight: 8 }} />}
          <Text style={[styles.btnText, { color: v.fg, fontSize: size === 'sm' ? 13 : 15 }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const VARIANTS = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary },
  blue: { bg: colors.blue, fg: colors.white, border: colors.blue },
  dark: { bg: colors.dark, fg: colors.white, border: colors.dark },
  outline: { bg: colors.white, fg: colors.text, border: colors.border },
  soft: { bg: colors.primarySoft, fg: colors.primary, border: colors.primarySoft },
  danger: { bg: colors.dangerSoft, fg: colors.danger, border: colors.dangerSoft },
};

export function IconButton({ name, onPress, size = 22, dim = 42, color = colors.text, bg = colors.white, style, badge, label }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.iconBtn,
        { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: bg },
        pressed && { opacity: 0.7, transform: [{ scale: 0.94 }] },
        style,
      ]}
    >
      <Ionicons name={name} size={size} color={color} />
      {!!badge && (
        <View style={styles.badgeDot}>
          <Text style={styles.badgeDotText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

/**
 * Xavfsiz "Orqaga": stack'da qaytish imkoni bo'lsa goBack, aks holda (masalan, tab
 * to'g'ridan-to'g'ri ochilgan bo'lsa) bosh sahifaga o'tadi. Tugma hech qachon "o'lik" bo'lmaydi.
 */
export function useSafeBack(fallback = { name: 'Tabs', params: { screen: 'Home' } }) {
  const navigation = useNavigation();
  return useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate(fallback.name, fallback.params);
  }, [navigation, fallback.name, fallback.params]);
}

export function BackButton({ onPress, style, ...rest }) {
  const safeBack = useSafeBack();
  return <IconButton name="chevron-back" label="Orqaga" onPress={onPress || safeBack} style={[shadow, style]} {...rest} />;
}

export function Chip({ label, active, onPress, icon, iconSet: IconSet = Ionicons, activeColor = colors.primary, count, style }) {
  const iconColor = active ? colors.white : activeColor === colors.primary ? colors.textMuted : activeColor;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [
        styles.chip,
        active && { backgroundColor: activeColor, borderColor: activeColor },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {icon && <IconSet name={icon} size={16} color={iconColor} style={{ marginRight: 6 }} />}
      <Text style={[styles.chipText, active && { color: colors.white }]}>{label}</Text>
      {count != null && (
        <View style={[styles.chipCount, active && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
          <Text style={[styles.chipCountText, active && { color: colors.white }]}>{count}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function ChipRow({ children, style }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[{ paddingHorizontal: 16, gap: 8 }, style]}
    >
      {children}
    </ScrollView>
  );
}

export function SectionHeader({ title, subtitle, actionLabel = 'Barchasi', onAction, style }) {
  return (
    <View style={[styles.section, style]}>
      <View style={{ flex: 1 }}>
        <Text style={type.h2}>{title}</Text>
        {!!subtitle && <Text style={[type.small, { marginTop: 2 }]}>{subtitle}</Text>}
      </View>
      {onAction && (
        <Pressable onPress={onAction} hitSlop={10} style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.blue} />
        </Pressable>
      )}
    </View>
  );
}

export function Rating({ value, count, size = 14, light }) {
  return (
    <View style={styles.row}>
      <Ionicons name="star" size={size} color={colors.star} />
      <Text style={[styles.ratingValue, { fontSize: size, color: light ? colors.white : colors.text }]}>
        {value.toFixed(1)}
      </Text>
      {count != null && (
        <Text style={[styles.ratingCount, { fontSize: size - 1, color: light ? 'rgba(255,255,255,0.8)' : colors.textLight }]}>
          ({count > 199 ? '200+' : count})
        </Text>
      )}
    </View>
  );
}

export function Badge({ label, color = colors.primary, bg, icon, style }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg || color }, style]}>
      {icon && <Ionicons name={icon} size={12} color={bg ? color : colors.white} style={{ marginRight: 4 }} />}
      <Text style={[styles.badgeText, { color: bg ? color : colors.white }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({ icon = 'search-outline', image, title, text, actionLabel, onAction }) {
  return (
    <View style={styles.empty}>
      {image ? (
        <Image source={image} style={{ width: 132, height: 132, marginBottom: 12 }} resizeMode="contain" />
      ) : (
        <View style={styles.emptyIcon}>
          <Ionicons name={icon} size={36} color={colors.primary} />
        </View>
      )}
      <Text style={[type.h3, { textAlign: 'center' }]}>{title}</Text>
      {!!text && <Text style={[type.small, { textAlign: 'center', marginTop: 6, lineHeight: 18 }]}>{text}</Text>}
      {actionLabel && <Button title={actionLabel} onPress={onAction} size="md" style={{ marginTop: 18, paddingHorizontal: 28 }} />}
    </View>
  );
}

export function ScreenHeader({ title, subtitle, right, back = true, onBack, transparent, style }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + 8 },
        transparent ? { backgroundColor: 'transparent' } : { backgroundColor: colors.bg },
        style,
      ]}
    >
      {back ? <BackButton onPress={onBack} /> : <View style={{ width: 0 }} />}
      <View style={{ flex: 1, marginHorizontal: back ? 12 : 0 }}>
        <Text style={type.h1} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && <Text style={[type.small, { marginTop: 2 }]}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

export function Segmented({ options, value, onChange, style }) {
  return (
    <View style={[styles.segment, style]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable key={o.value} onPress={() => onChange(o.value)} style={[styles.segmentItem, active && styles.segmentActive]}>
            <Text style={[styles.segmentText, active && { color: colors.text }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function InfoRow({ icon, label, value, last }) {
  return (
    <View style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={[type.small, { flex: 1 }]}>{label}</Text>
      <Text style={[type.label, { maxWidth: '60%', textAlign: 'right' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: {
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: 1,
  },
  btnText: { fontWeight: '700' },
  iconBtn: { alignItems: 'center', justifyContent: 'center' },
  badgeDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  badgeDotText: { color: colors.white, fontSize: 9, fontWeight: '800' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  chipCount: {
    marginLeft: 6,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipCountText: { fontSize: 11, fontWeight: '800', color: colors.textMuted },
  section: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, marginBottom: 12 },
  sectionAction: { flexDirection: 'row', alignItems: 'center', paddingBottom: 2 },
  sectionActionText: { color: colors.blue, fontWeight: '600', fontSize: 13, marginRight: 2 },
  ratingValue: { fontWeight: '700', marginLeft: 4 },
  ratingCount: { marginLeft: 3 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  segment: { flexDirection: 'row', backgroundColor: '#E9EBEF', borderRadius: radius.md, padding: 4 },
  segmentItem: { flex: 1, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: colors.white, ...shadow },
  segmentText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 16, ...shadow },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});
