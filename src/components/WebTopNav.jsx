import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import Logo from './Logo';
import SmartImage from './SmartImage';
import { colors, radius } from '../theme';
import { useApp } from '../context/AppContext';
import { useLayout, webTransition } from '../hooks/useLayout';
import { IMAGES } from '../data/images';
import { isBookingUpcoming } from '../utils/booking';

const LINKS = [
  { label: 'Bosh sahifa', tab: 'Home' },
  { label: 'Sport majmualari', tab: 'Venues' },
  { label: "Mashg'ulotlar", tab: 'Workouts' },
  { label: 'Sport tadbirlari', screen: 'Events' },
  { label: 'Yangiliklar', screen: 'News' },
  { label: 'Bronlarim', tab: 'Bookings' },
];

/** Desktop uchun yuqori menyu — bottom tab bar o'rniga `tabBar` sifatida ishlatiladi. */
export default function WebTopNav({ state, navigation }) {
  const { width, contentWidth } = useLayout();
  const { location, notifications, bookings } = useApp();
  const active = state.routes[state.index].name;
  const unread = notifications.filter((n) => !n.read).length;
  const upcoming = bookings.filter(isBookingUpcoming).length;
  const wideLocation = width >= 1320;

  return (
    <View style={styles.wrap}>
      <View style={[styles.bar, { width: contentWidth }]}>
        <Pressable onPress={() => navigation.navigate('Home')} accessibilityRole="link">
          <Logo size={30} light />
        </Pressable>

        <View style={styles.links}>
          {LINKS.map((l) => {
            const isActive = l.tab === active;
            return (
              <Pressable
                key={l.label}
                accessibilityRole="link"
                onPress={() => navigation.navigate(l.tab || l.screen)}
                style={({ hovered }) => [styles.link, webTransition, hovered && styles.linkHover, isActive && styles.linkActive]}
              >
                <Text style={styles.linkText}>{l.label}</Text>
                {l.tab === 'Bookings' && upcoming > 0 && (
                  <View style={styles.count}>
                    <Text style={styles.countText}>{upcoming}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.right}>
          <Pressable
            onPress={() => navigation.navigate('Location')}
            style={({ hovered }) => [styles.location, !wideLocation && styles.locationCompact, hovered && { opacity: 0.9 }]}
          >
            <Ionicons name="location" size={16} color={colors.primary} />
            {wideLocation && (
              <>
                <Text style={styles.locationText} numberOfLines={1}>
                  Toshkent, {location}
                </Text>
                <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
              </>
            )}
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            style={({ hovered }) => [styles.iconBtn, webTransition, hovered && styles.linkHover]}
            accessibilityLabel="Bildirishnomalar"
          >
            <Ionicons name="notifications-outline" size={23} color={colors.white} />
            {unread > 0 && <View style={styles.dot} />}
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Profile')} style={styles.profile} accessibilityLabel="Profil">
            <SmartImage uri={IMAGES.avatar} style={styles.avatar} icon="account" iconSize={20} />
            <Ionicons name="chevron-down" size={16} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.primary, paddingTop: 16, alignItems: 'center', zIndex: 10 },
  bar: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  links: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, marginHorizontal: 12 },
  link: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 40, borderRadius: radius.pill },
  linkHover: { backgroundColor: 'rgba(255,255,255,0.12)' },
  linkActive: { backgroundColor: 'rgba(255,255,255,0.24)' },
  linkText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  count: {
    marginLeft: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    maxWidth: 260,
  },
  locationCompact: { width: 40, paddingHorizontal: 0, justifyContent: 'center' },
  locationText: { fontSize: 13, fontWeight: '600', color: colors.text, flexShrink: 1 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  dot: {
    position: 'absolute',
    top: 9,
    right: 11,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)' },
});
