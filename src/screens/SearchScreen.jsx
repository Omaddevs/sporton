import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Text, { TextInput } from '../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { EmptyState, IconButton } from '../components/ui';
import { NewsCard, VenueListItem } from '../components/cards';
import SmartImage from '../components/SmartImage';
import { colors, radius, shadow, type } from '../theme';
import { VENUES } from '../data/venues';
import { WORKOUTS } from '../data/workouts';
import { EVENTS } from '../data/events';
import { NEWS } from '../data/news';
import { SPORT_TYPES, getSport } from '../data/sports';
import { formatDate } from '../utils/format';
import { distanceKm } from '../utils/geo';
import { useUserLocation } from '../hooks/useUserLocation';
import { useLayout } from '../hooks/useLayout';
import LocationPermissionSheet from '../components/map/LocationPermissionSheet';
import SearchMap from './search/SearchMap';

const POPULAR = ['Mini-futbol', 'Yunusobod', 'Basseyn', 'Yoga', 'Tennis', 'HIIT', 'Turnir'];

const norm = (s) => s.toLowerCase().replace(/[''`ʻʼ]/g, '');

// Ruxsat oynasi bir sessiyada faqat bir marta o'zi ochiladi
let permissionPrompted = false;

export default function SearchScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { isDesktop } = useLayout();
  const loc = useUserLocation();
  const [q, setQ] = useState(route.params?.q || '');
  const [mode, setMode] = useState(route.params?.mode || 'list');
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    if (route.params?.mode) setMode(route.params.mode);
  }, [route.params?.mode]);

  // Joylashuv bo'lsa — har bir majmuagacha haqiqiy masofa va eng yaqinidan saralash
  const venues = useMemo(() => {
    if (!loc.coords) return VENUES;
    return VENUES.map((v) => {
      const km = distanceKm(loc.coords, v.coords);
      return { ...v, km, distance: Math.round(km * 10) / 10 };
    }).sort((a, b) => a.km - b.km);
  }, [loc.coords]);

  const results = useMemo(() => {
    const t = norm(q.trim());
    if (!t) return null;
    const match = (...fields) => fields.some((f) => norm(String(f)).includes(t));
    return {
      venues: venues.filter((v) => match(v.name, v.district, v.address, getSport(v.type).name, v.description)),
      workouts: WORKOUTS.filter((w) => match(w.title, w.category, w.coach)),
      events: EVENTS.filter((e) => match(e.title, e.location, getSport(e.sport).name)),
      news: NEWS.filter((n) => match(n.title, n.category)),
    };
  }, [q, venues]);

  const total = results ? results.venues.length + results.workouts.length + results.events.length + results.news.length : 0;
  const isMap = mode === 'map';

  // Xarita rejimiga birinchi kirganda geolokatsiyani yoqishni taklif qilamiz
  useEffect(() => {
    if (isMap && loc.checked && loc.status === 'idle' && !permissionPrompted) {
      permissionPrompted = true;
      const t = setTimeout(() => setSheet(true), 500);
      return () => clearTimeout(t);
    }
  }, [isMap, loc.checked, loc.status]);

  // Joylashuv aniqlanishi bilan oyna o'zi yopiladi
  const prevStatus = useRef(loc.status);
  useEffect(() => {
    if (loc.status === 'granted' && prevStatus.current !== 'granted') setSheet(false);
    prevStatus.current = loc.status;
  }, [loc.status]);

  const openVenue = (id) => navigation.navigate('VenueDetail', { id });
  const askLocation = () => {
    if (loc.status !== 'loading') setSheet(true);
  };

  const header = (
    <View style={styles.top}>
      <IconButton
        name="chevron-back"
        label="Orqaga"
        onPress={() => (isMap ? setMode('list') : navigation.goBack())}
        style={shadow}
      />
      <View style={[styles.box, isMap && shadow]}>
        <Ionicons name="search" size={19} color={colors.primary} />
        <TextInput
          autoFocus={!isMap && !route.params?.mode}
          value={q}
          onChangeText={setQ}
          placeholder={isMap ? 'Majmua nomi yoki sport turi...' : "Majmua, mashg'ulot, tadbir..."}
          placeholderTextColor={colors.textLight}
          style={styles.input}
          returnKeyType="search"
        />
        {!!q && <Ionicons name="close-circle" size={19} color={colors.textLight} onPress={() => setQ('')} />}
      </View>
      <IconButton
        name={isMap ? 'list' : 'map-outline'}
        label={isMap ? "Ro'yxat ko'rinishi" : "Xarita ko'rinishi"}
        onPress={() => setMode(isMap ? 'list' : 'map')}
        color={isMap ? colors.text : colors.white}
        bg={isMap ? colors.white : colors.primary}
        style={shadow}
      />
    </View>
  );

  const permissionSheet = (
    <LocationPermissionSheet
      visible={sheet}
      status={loc.status}
      canAskAgain={loc.canAskAgain}
      onAllow={loc.request}
      onClose={() => setSheet(false)}
    />
  );

  if (isMap) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <SearchMap
          venues={results ? results.venues : venues}
          header={header}
          loc={loc}
          isDesktop={isDesktop}
          onAskLocation={askLocation}
          onOpenVenue={openVenue}
          onShowList={() => setMode('list')}
        />
        {permissionSheet}
      </View>
    );
  }

  const nearby = loc.coords ? venues.slice(0, 3) : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 8 }}>
      {header}

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {!results && (
          <>
            <MapPromo onPress={() => setMode('map')} located={!!loc.coords} />

            {nearby.length > 0 && (
              <Group title="Sizga eng yaqin" count={nearby.length}>
                {nearby.map((v) => (
                  <VenueListItem key={v.id} venue={v} onPress={() => openVenue(v.id)} />
                ))}
              </Group>
            )}

            <Text style={styles.h}>Ommabop qidiruvlar</Text>
            <View style={styles.tags}>
              {POPULAR.map((p) => (
                <Pressable key={p} onPress={() => setQ(p)} style={styles.tag}>
                  <Ionicons name="trending-up" size={14} color={colors.primary} />
                  <Text style={styles.tagText}>{p}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.h, { marginTop: 24 }]}>Sport turlari</Text>
            <View style={styles.grid}>
              {SPORT_TYPES.map((s) => (
                <Pressable
                  key={s.id}
                  style={styles.sport}
                  onPress={() => navigation.navigate('Tabs', { screen: 'Venues', params: { type: s.id } })}
                >
                  <View style={[styles.sportIcon, { backgroundColor: `${s.color}1A` }]}>
                    <MaterialCommunityIcons name={s.icon} size={24} color={s.color} />
                  </View>
                  <Text style={styles.sportText}>{s.name}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {results && total === 0 && <EmptyState title="Hech narsa topilmadi" text={`«${q}» bo'yicha natija yo'q. Boshqa so'z bilan urinib ko'ring.`} />}

        {results && results.venues.length > 0 && (
          <Group title="Sport majmualari" count={results.venues.length}>
            {results.venues.map((v) => (
              <VenueListItem key={v.id} venue={v} onPress={() => openVenue(v.id)} />
            ))}
          </Group>
        )}
        {results && results.workouts.length > 0 && (
          <Group title="Mashg'ulotlar" count={results.workouts.length}>
            {results.workouts.map((w) => (
              <MiniRow
                key={w.id}
                image={w.image}
                icon="dumbbell"
                title={w.title}
                sub={`${w.minutes} daq · ${w.level}`}
                onPress={() => navigation.navigate('WorkoutDetail', { id: w.id })}
              />
            ))}
          </Group>
        )}
        {results && results.events.length > 0 && (
          <Group title="Tadbirlar" count={results.events.length}>
            {results.events.map((e) => (
              <MiniRow
                key={e.id}
                image={e.image}
                icon="trophy"
                title={e.title}
                sub={`${formatDate(e.date)} · ${e.location}`}
                onPress={() => navigation.navigate('EventDetail', { id: e.id })}
              />
            ))}
          </Group>
        )}
        {results && results.news.length > 0 && (
          <Group title="Yangiliklar" count={results.news.length}>
            {results.news.map((n) => (
              <NewsCard key={n.id} item={n} onPress={() => navigation.navigate('NewsDetail', { id: n.id })} />
            ))}
          </Group>
        )}
      </ScrollView>
      {permissionSheet}
    </View>
  );
}

// Xaritaga taklif kartasi: qorong'i fon ustida "xarita" bezagi va sport pinlari
const PROMO_PINS = [
  { top: 14, right: 92, sport: 'football' },
  { top: 56, right: 26, sport: 'tennis' },
  { top: 92, right: 118, sport: 'swimming' },
  { top: 12, right: 16, sport: 'basketball' },
];

function MapPromo({ onPress, located }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.promo, pressed && { transform: [{ scale: 0.99 }] }]}>
      <LinearGradient colors={['#262B3D', '#141824']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={styles.promoArt} pointerEvents="none">
        <View style={[styles.promoRoad, { top: 44, transform: [{ rotate: '-12deg' }] }]} />
        <View style={[styles.promoRoad, { top: 104, transform: [{ rotate: '8deg' }] }]} />
        <View style={[styles.promoRoadV, { right: 70, transform: [{ rotate: '14deg' }] }]} />
        {PROMO_PINS.map((p) => {
          const s = getSport(p.sport);
          return (
            <View key={p.sport} style={[styles.promoPin, { top: p.top, right: p.right, backgroundColor: s.color }]}>
              <MaterialCommunityIcons name={s.icon} size={13} color={colors.white} />
            </View>
          );
        })}
        <View style={styles.promoMe}>
          <View style={styles.promoMeDot} />
        </View>
      </View>
      <View style={{ paddingRight: 130 }}>
        <View style={styles.promoBadge}>
          <Ionicons name={located ? 'navigate' : 'map'} size={11} color={colors.primary} />
          <Text style={styles.promoBadgeText}>{located ? 'Joylashuv aniqlandi' : 'Yangi'}</Text>
        </View>
        <Text style={styles.promoTitle}>Xaritadan qidirish</Text>
        <Text style={styles.promoText}>Turgan joyingizga eng yaqin sport majmualarini toping</Text>
        <View style={styles.promoBtn}>
          <Text style={styles.promoBtnText}>Xaritani ochish</Text>
          <Ionicons name="arrow-forward" size={15} color={colors.white} />
        </View>
      </View>
    </Pressable>
  );
}

function Group({ title, count, children }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.h}>
        {title} <Text style={{ color: colors.textLight }}>· {count}</Text>
      </Text>
      <View style={{ gap: 10 }}>{children}</View>
    </View>
  );
}

function MiniRow({ image, icon, title, sub, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.mini}>
      <SmartImage uri={image} style={styles.miniImg} icon={icon} iconSize={22} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={type.label} numberOfLines={1}>
          {title}
        </Text>
        <Text style={type.small} numberOfLines={1}>
          {sub}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10 },
  box: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.text, height: '100%', minWidth: 0 },
  promo: { borderRadius: radius.xl, overflow: 'hidden', padding: 18, marginBottom: 24 },
  promoArt: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 170 },
  promoRoad: { position: 'absolute', left: -20, right: -20, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.07)' },
  promoRoadV: { position: 'absolute', top: -20, bottom: -20, width: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.07)' },
  promoPin: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#1D2130',
  },
  promoMe: {
    position: 'absolute',
    top: 54,
    right: 66,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(31,107,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoMeDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.blue, borderWidth: 2.5, borderColor: colors.white },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: `${colors.primary}29`,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  promoBadgeText: { fontSize: 11, fontWeight: '800', color: colors.primary },
  promoTitle: { fontSize: 19, fontWeight: '800', color: colors.white, marginTop: 10 },
  promoText: { fontSize: 13, lineHeight: 18, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  promoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    height: 34,
    marginTop: 14,
  },
  promoBtnText: { fontSize: 13, fontWeight: '800', color: colors.white },
  h: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: { fontSize: 13, fontWeight: '600', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  sport: { width: '25%', alignItems: 'center', paddingHorizontal: 4, marginBottom: 16 },
  sportIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sportText: { fontSize: 12, fontWeight: '600', marginTop: 6, color: colors.text },
  mini: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: 10, borderRadius: radius.md, ...shadow },
  miniImg: { width: 54, height: 54, borderRadius: 12 },
});
