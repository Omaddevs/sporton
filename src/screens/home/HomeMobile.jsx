import React, { useRef } from 'react';
import { Animated, Image, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Text from '../../components/AppText';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Logo from '../../components/Logo';
import SmartImage from '../../components/SmartImage';
import { colors, gradients, radius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { EVENTS } from '../../data/events';
import { ICONS } from '../../data/icons';
import { getSport } from '../../data/sports';
import { minPrice } from '../../data/venues';
import { formatDate, formatRange, formatTime, MONTHS } from '../../utils/format';

/* ------------------------------------------------------------------ */
/*  Dizayn tokenlari (Noor uslubi: yumshoq kulrang yuzalar, qora matn) */
/* ------------------------------------------------------------------ */
const TILE = '#F3F4F6'; // kategoriya kartalari va qidiruv foni
const SOFT = '#8E9299'; // ikkinchi darajali matn
const INK = '#111318'; // asosiy matn

/** Maket 390dp kenglik uchun; torroq ekranlarda shrift shunga mos kichrayadi. */
const DESIGN_WIDTH = 390;

/** Belgi ranglari (maketdagi to'q sariq «Tezkor» va ko'k «Yangi») */
const ORANGE = ['#FF7A2F', '#FF4F12'];
const BLUE = ['#4C8DFF', '#1F6BFF'];

/**
 * Kategoriya kartalari: katta 3D ikonka joylashuvi va belgi.
 * Yuqori qatorda ikonka pastda markazda, pastki qatorda o'ng tomonda turadi.
 */
const CATEGORY_META = {
  // ikonka pastki chetdan biroz chiqib, kesilib turadi (maketdagidek)
  venues: { art: { size: 112, center: true, bottom: -14 } },
  workouts: { art: { size: 104, center: true, bottom: -8 } },
  events: { art: { size: 102, center: true, bottom: -6 } },
  booking: { badge: 'Tezkor', badgeIcon: 'flash', badgeColors: ORANGE, art: { size: 112, right: 6, bottom: 6 } },
  news: { badge: 'Yangi', badgeIcon: 'flame', badgeColors: BLUE, art: { size: 98, right: -4, bottom: 20 } },
};

/** Ikkinchi (binafsha) reklama kartasidagi ro'yxat */
const UPCOMING_FEATURES = [
  { icon: 'account-tie', text: 'Murabbiy darslari' },
  { icon: 'credit-card-outline', text: "Onlayn to'lov" },
  { icon: 'account-group-outline', text: "Jamoa yig'ish" },
  { icon: 'trophy-outline', text: "Turnir ro'yxati" },
];

/** Telefon uchun bosh ekran — Noor ilovasi uslubida. */
export default function HomeMobile({ go, categories, nearby, nextBooking }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const k = Math.min(1, width / DESIGN_WIDTH);
  const { location, notifications } = useApp();
  const unread = notifications.filter((n) => !n.read).length;

  const byKey = Object.fromEntries(categories.map((c) => [c.key, c]));
  const topRow = ['venues', 'workouts', 'events'].map((key) => byKey[key]);
  const { key: _wk, ...wide } = byKey.booking;
  const { key: _nk, ...narrow } = byKey.news;
  const nearest = nearby.slice(0, 3);
  const popular = [...nearby].sort((a, b) => b.rating - a.rating).slice(0, 6);
  const upcomingEvents = EVENTS.slice(0, 2);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      {/* ---------- SARLAVHA: menyu · logotip · bildirishnoma ---------- */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Tap onPress={go.profile} style={styles.headerBtn} accessibilityLabel="Menyu">
          <View style={styles.burger}>
            <View style={styles.burgerBar} />
            <View style={styles.burgerBar} />
            <View style={styles.burgerBar} />
          </View>
        </Tap>
        <View style={styles.headerCenter}>
          <Logo size={22} />
          <Tap onPress={go.location} style={styles.location} scale={0.97}>
            <Text style={styles.locationText} numberOfLines={1}>
              {location}
            </Text>
            <Ionicons name="chevron-forward" size={13} color={SOFT} />
          </Tap>
        </View>
        <Tap onPress={go.notifications} style={styles.headerBtn} accessibilityLabel="Bildirishnomalar">
          <Ionicons name="notifications-outline" size={23} color={INK} />
          {unread > 0 && <View style={styles.dot} />}
        </Tap>
      </View>

      {/* ---------- KATEGORIYALAR (3 + 2) ---------- */}
      <View style={styles.grid}>
        <View style={styles.gridRow}>
          {topRow.map(({ key, ...c }) => (
            <CategoryTile key={key} {...c} {...CATEGORY_META[key]} k={k} style={{ flex: 1 }} />
          ))}
        </View>
        <View style={styles.gridRow}>
          <CategoryTile {...wide} {...CATEGORY_META.booking} k={k} style={{ flex: 1.25 }} />
          <CategoryTile {...narrow} {...CATEGORY_META.news} k={k} style={{ flex: 1 }} />
        </View>
      </View>

      {/* ---------- QIDIRUV ---------- */}
      <Tap onPress={() => go.search()} style={styles.search} scale={0.985}>
        <Ionicons name="search-outline" size={22} color={SOFT} />
        <Text style={styles.searchText} numberOfLines={1}>
          Qaysi sportni qidiryapsiz?
        </Text>
        <Ionicons name="arrow-forward" size={22} color={INK} />
      </Tap>

      {/* ---------- YAQIN MAJMUALAR RO'YXATI ---------- */}
      <View style={styles.list}>
        {nearest.map((v, i) => (
          <NearbyRow key={v.id} venue={v} last={i === nearest.length - 1} onPress={() => go.venue(v.id)} />
        ))}
      </View>

      {/* ---------- IKKI REKLAMA KARTASI ---------- */}
      <View style={styles.promoRow}>
        <Tap onPress={() => go.venues()} style={styles.promo} scale={0.98}>
          <LinearGradient colors={['#2E8FFF', '#0078FF']} start={{ x: 0, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
          <Text style={[styles.promoTitle, k < 1 && { fontSize: 18 * k, lineHeight: 22 * k }]}>{'Tez bron qiling\nSportON bilan'}</Text>
          <Image source={ICONS.stadium} style={styles.promoArt} resizeMode="contain" pointerEvents="none" />
          <View style={styles.promoBtn}>
            <Text style={styles.promoBtnText}>Sinab ko'ring</Text>
            <Ionicons name="arrow-forward" size={14} color={INK} />
          </View>
        </Tap>

        <Tap onPress={go.workouts} style={[styles.promo, styles.promoViolet]} scale={0.98}>
          <LinearGradient colors={['#8B6BFF', '#6F4DF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <Text style={[styles.promoTitle, k < 1 && { fontSize: 18 * k, lineHeight: 22 * k }]}>{'Tez orada yangi\nxizmatlar SportON da'}</Text>
          <View style={{ marginTop: 14, gap: 9 }}>
            {UPCOMING_FEATURES.map((f) => (
              <View key={f.text} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <MaterialCommunityIcons name={f.icon} size={12} color="#6F4DF5" />
                </View>
                <Text style={[styles.featureText, k < 1 && { fontSize: 13 * k }]} numberOfLines={1}>
                  {f.text}
                </Text>
              </View>
            ))}
          </View>
        </Tap>
      </View>

      {/* ---------- KEYINGI BRON ---------- */}
      {nextBooking && (
        <Tap onPress={go.bookings} style={styles.nextBooking} scale={0.985}>
          <View style={styles.nextIcon}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.nextLabel}>Keyingi broningiz</Text>
            <Text style={styles.nextTitle} numberOfLines={1}>
              {nextBooking.venueName}
            </Text>
            <Text style={styles.nextMeta}>
              {formatDate(nextBooking.date)} · {formatRange(nextBooking.startHour, nextBooking.duration)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={SOFT} />
        </Tap>
      )}

      {/* ---------- MASHHUR JOYLAR ---------- */}
      <SectionTitle title="Mashhur joylar" onAction={() => go.venues()} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
        {popular.map((v) => (
          <PopularVenueCard key={v.id} venue={v} onPress={() => go.venue(v.id)} />
        ))}
      </ScrollView>

      {/* ---------- KUTILAYOTGAN TADBIRLAR ---------- */}
      <SectionTitle title="Kutilayotgan tadbirlar" onAction={go.events} />
      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        {upcomingEvents.map((e) => (
          <UpcomingEventCard key={e.id} event={e} onPress={() => go.event(e.id)} />
        ))}
      </View>
    </ScrollView>
  );
}

/* ------------------------------------------------------------------ */
/*  Tap: bosilganda silliq kichrayadigan Pressable (spring animatsiya) */
/* ------------------------------------------------------------------ */
const USE_NATIVE = Platform.OS !== 'web';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Tap({ children, style, scale = 0.96, onPress, ...props }) {
  const anim = useRef(new Animated.Value(1)).current;
  const to = (v) =>
    Animated.spring(anim, { toValue: v, useNativeDriver: USE_NATIVE, speed: 40, bounciness: 4 }).start();
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => to(scale)}
      onPressOut={() => to(1)}
      style={[style, { transform: [{ scale: anim }] }]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Kategoriya kartasi: sarlavha, izoh, pastda belgi, o'ngda 3D ikonka */
/* ------------------------------------------------------------------ */
function CategoryTile({ title, subtitle, badge, badgeIcon, badgeColors, image, icon, colorsFrom, onPress, art, k = 1, style }) {
  const renderArt = (size) =>
    image ? (
      <Image source={image} style={{ width: size, height: size }} resizeMode="contain" />
    ) : (
      <LinearGradient colors={colorsFrom} style={[styles.tileIconFallback, { width: size * 0.6, height: size * 0.6 }]}>
        <MaterialCommunityIcons name={icon} size={size * 0.32} color={colors.white} />
      </LinearGradient>
    );

  // Yuqori qator: bir qatorli sarlavha, izoh va pastda markazda katta ikonka (maketdagidek)
  if (art.center) {
    return (
      <Tap onPress={onPress} style={[styles.tile, styles.tileCol, { height: 136 * k }, style]} scale={0.97}>
        <View style={[styles.tileArt, styles.tileArtCenter, { bottom: art.bottom * k }]} pointerEvents="none">
          {renderArt(art.size * k)}
        </View>
        <Text style={[styles.tileTitle, styles.tileTitleSm, k < 1 && { fontSize: 12.5 * k * k, lineHeight: 16 * k }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.tileSub, styles.tileSubSm, k < 1 && { fontSize: 10.5 * k }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </Tap>
    );
  }

  return (
    <Tap onPress={onPress} style={[styles.tile, style]} scale={0.97}>
      <View style={[styles.tileArt, { right: art.right * k, bottom: art.bottom * k }]} pointerEvents="none">
        {renderArt(art.size * k)}
      </View>

      <Text style={[styles.tileTitle, k < 1 && { fontSize: 15.5 * k, lineHeight: 19 * k }]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.tileSub, k < 1 && { fontSize: 12.5 * k }]} numberOfLines={1}>
        {subtitle}
      </Text>

      {badge && (
        <LinearGradient colors={badgeColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pill}>
          <Ionicons name={badgeIcon} size={14} color={colors.white} />
          <Text style={styles.pillText}>{badge}</Text>
        </LinearGradient>
      )}
    </Tap>
  );
}

/* ------------------------------------------------------------------ */
/*  Yaqin majmua qatori: kulrang doira ikonka, nom + tuman, masofa     */
/* ------------------------------------------------------------------ */
function NearbyRow({ venue, onPress, last }) {
  const sport = getSport(venue.type);
  return (
    <Tap onPress={onPress} style={[styles.row, !last && styles.rowBorder]} scale={0.985}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons name={sport.icon} size={18} color={SOFT} />
      </View>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {venue.name}
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {venue.district}
        </Text>
      </View>
      <Text style={styles.rowMeta}>{venue.distance} km</Text>
    </Tap>
  );
}

/* ------------------------------------------------------------------ */
/*  Bo'lim sarlavhasi                                                   */
/* ------------------------------------------------------------------ */
function SectionTitle({ title, onAction }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onAction && (
        <Pressable onPress={onAction} hitSlop={10} style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>Barchasi</Text>
          <Ionicons name="chevron-forward" size={15} color={SOFT} />
        </Pressable>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Mashhur joy kartasi                                                 */
/* ------------------------------------------------------------------ */
const formatPriceShort = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function PopularVenueCard({ venue, onPress }) {
  const { favorites, toggleFavorite } = useApp();
  const fav = favorites.includes(venue.id);
  const sport = getSport(venue.type);

  return (
    <Tap onPress={onPress} style={styles.venue} scale={0.975}>
      <SmartImage uri={venue.images[0]} style={styles.venueImg} icon={sport.icon}>
        <Pressable onPress={() => toggleFavorite(venue.id)} hitSlop={8} style={styles.heart} accessibilityLabel="Sevimlilar">
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={17} color={fav ? colors.danger : INK} />
        </Pressable>
        <View style={styles.venueDistance}>
          <Ionicons name="location" size={11} color={colors.white} />
          <Text style={styles.venueDistanceText}>{venue.distance} km</Text>
        </View>
      </SmartImage>

      <View style={styles.venueBody}>
        <Text style={styles.venueName} numberOfLines={1}>
          {venue.name}
        </Text>
        <Text style={styles.venueSub} numberOfLines={1}>
          {sport.name} · {venue.district.replace(' tumani', '')}
        </Text>
        <View style={styles.venueFooter}>
          <View style={styles.rating}>
            <Ionicons name="star" size={13} color={colors.primary} />
            <Text style={styles.ratingText}>{venue.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.venuePrice}>
            {formatPriceShort(minPrice(venue))}
            <Text style={styles.venuePriceUnit}> so'm/soat</Text>
          </Text>
        </View>
      </View>
    </Tap>
  );
}

/* ------------------------------------------------------------------ */
/*  Tadbir kartasi                                                      */
/* ------------------------------------------------------------------ */
function UpcomingEventCard({ event, onPress }) {
  const d = new Date(event.date);
  const sport = getSport(event.sport);
  const end = new Date(d.getTime() + (event.durationHours || 3) * 3600 * 1000);
  const month = MONTHS[d.getMonth()].slice(0, 3);

  return (
    <Tap onPress={onPress} style={styles.event} scale={0.98}>
      <SmartImage uri={event.image} style={styles.eventImg} icon="trophy">
        <View style={styles.eventDate}>
          <Text style={styles.eventDay}>{d.getDate()}</Text>
          <Text style={styles.eventMonth}>{month}</Text>
        </View>
      </SmartImage>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.eventTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={styles.eventMeta} numberOfLines={1}>
          {sport.name} · {formatTime(d)} – {formatTime(end)}
        </Text>
        <Text style={styles.eventMeta} numberOfLines={1}>
          {event.location}
        </Text>
      </View>
      <View style={styles.eventArrow}>
        <Ionicons name="arrow-forward" size={16} color={INK} />
      </View>
    </Tap>
  );
}

/* ------------------------------------------------------------------ */
/*  Keyingi bron kartasi (desktop bosh sahifasida ham ishlatiladi)      */
/* ------------------------------------------------------------------ */
export function NextBookingCard({ booking, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={[styles.nextBookingDark, style]}>
      <LinearGradient colors={gradients.dark} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.nextBookingDarkInner}>
        <View style={[styles.nextIcon, { backgroundColor: colors.primary }]}>
          <Ionicons name="calendar" size={22} color={colors.white} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.nextLabel, { color: 'rgba(255,255,255,0.6)' }]}>Keyingi broningiz</Text>
          <Text style={[styles.nextTitle, { color: colors.white }]} numberOfLines={1}>
            {booking.venueName}
          </Text>
          <Text style={[styles.nextMeta, { color: colors.primaryLight }]}>
            {formatDate(booking.date)} · {formatRange(booking.startHour, booking.duration)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
      </LinearGradient>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/*  Uslublar                                                            */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },

  /* sarlavha */
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 12, paddingBottom: 6 },
  headerBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  burger: { width: 20, gap: 4 },
  burgerBar: { height: 2.2, borderRadius: 2, backgroundColor: INK },
  dot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, borderWidth: 1.5, borderColor: colors.white },
  location: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, maxWidth: 240 },
  locationText: { fontSize: 13.5, color: SOFT, fontWeight: '500', flexShrink: 1 },

  /* kategoriyalar */
  grid: { paddingHorizontal: 14, marginTop: 14, gap: 10 },
  gridRow: { flexDirection: 'row', gap: 10 },
  tile: { height: 156, backgroundColor: TILE, borderRadius: 22, padding: 12, overflow: 'hidden' },
  // Sarlavhalar qidiruv matni bilan bir xil: oddiy (tik) Inter, 700 qalinlik
  tileTitle: { fontSize: 15.5, fontWeight: '700', letterSpacing: -0.2, fontStyle: 'normal', color: INK },
  tileSub: { fontSize: 12.5, color: SOFT, marginTop: 2, fontWeight: '500' },
  tileCol: { paddingHorizontal: 9, paddingTop: 10, borderRadius: 18 },
  tileTitleSm: { fontSize: 12.5, lineHeight: 16, fontWeight: '700', letterSpacing: -0.2 },
  tileSubSm: { fontSize: 10.5, marginTop: 1 },
  tileArtCenter: { left: -10, right: -10, alignItems: 'center' },
  tileArt: { position: 'absolute' },
  tileIconFallback: { borderRadius: 18, alignItems: 'center', justifyContent: 'center', margin: 12 },
  pill: {
    position: 'absolute',
    left: 13,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pillText: { color: colors.white, fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },

  /* qidiruv */
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 26,
    height: 60,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: TILE,
  },
  searchText: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', letterSpacing: -0.2, color: INK },

  /* yaqin majmualar ro'yxati */
  list: { marginHorizontal: 16, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', height: 66 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#EEF0F3' },
  rowIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: TILE, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2, color: INK },
  rowSub: { fontSize: 13, color: SOFT, marginTop: 1 },
  rowMeta: { fontSize: 13, color: SOFT, fontWeight: '500', marginLeft: 10 },

  /* reklama kartalari */
  promoRow: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginTop: 18 },
  promo: { flex: 1, height: 262, borderRadius: 24, padding: 16, overflow: 'hidden', backgroundColor: colors.primary },
  promoViolet: { backgroundColor: '#7B5CFF' },
  promoTitle: { color: colors.white, fontSize: 18, lineHeight: 22, fontWeight: '800', letterSpacing: -0.4 },
  promoArt: { position: 'absolute', width: 180, height: 180, right: -34, bottom: -22 },
  promoBtn: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  promoBtnText: { color: INK, fontSize: 13, fontWeight: '700' },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, color: colors.white, fontSize: 12.5, fontWeight: '600', letterSpacing: -0.2 },

  /* keyingi bron */
  nextBooking: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 14, padding: 12, borderRadius: 20, backgroundColor: TILE },
  nextIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  nextLabel: { fontSize: 11.5, fontWeight: '600', color: SOFT },
  nextTitle: { fontSize: 15, fontWeight: '800', color: INK, marginTop: 1, letterSpacing: -0.2 },
  nextMeta: { fontSize: 12.5, fontWeight: '600', color: colors.primary, marginTop: 2 },
  nextBookingDark: { borderRadius: radius.lg, overflow: 'hidden' },
  nextBookingDarkInner: { flexDirection: 'row', alignItems: 'center', padding: 14 },

  /* bo'lim sarlavhasi */
  section: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 30, marginBottom: 14 },
  sectionTitle: { flex: 1, fontSize: 21, fontWeight: '800', letterSpacing: -0.5, color: INK },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sectionActionText: { color: SOFT, fontSize: 13.5, fontWeight: '600' },

  /* mashhur joylar */
  hList: { paddingHorizontal: 16, gap: 12 },
  venue: { width: 210, backgroundColor: TILE, borderRadius: 20, overflow: 'hidden' },
  venueImg: { height: 124, borderRadius: 20 },
  heart: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  venueDistance: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 22,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(17,19,24,0.55)',
  },
  venueDistanceText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  venueBody: { padding: 12 },
  venueName: { fontSize: 15.5, fontWeight: '800', letterSpacing: -0.3, color: INK },
  venueSub: { fontSize: 12.5, color: SOFT, marginTop: 2, fontWeight: '500' },
  venueFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontWeight: '700', color: INK },
  venuePrice: { fontSize: 13.5, fontWeight: '800', color: INK, letterSpacing: -0.2 },
  venuePriceUnit: { fontSize: 11.5, fontWeight: '500', color: SOFT },

  /* tadbirlar */
  event: { flexDirection: 'row', alignItems: 'center', backgroundColor: TILE, borderRadius: 20, padding: 10 },
  eventImg: { width: 80, height: 80, borderRadius: 16 },
  eventDate: { position: 'absolute', left: 6, bottom: 6, backgroundColor: colors.white, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, alignItems: 'center' },
  eventDay: { fontSize: 14, fontWeight: '800', color: INK, lineHeight: 16 },
  eventMonth: { fontSize: 9.5, fontWeight: '700', color: SOFT, textTransform: 'uppercase', lineHeight: 11 },
  eventTitle: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3, color: INK, lineHeight: 19 },
  eventMeta: { fontSize: 12.5, color: SOFT, marginTop: 3, fontWeight: '500' },
  eventArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
