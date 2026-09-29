import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text from '../../components/AppText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SportMap from '../../components/map/SportMap';
import SmartImage from '../../components/SmartImage';
import { Rating } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { SPORT_TYPES, getSport } from '../../data/sports';
import { isOpenNow, minPrice } from '../../data/venues';
import { formatKm, travelTime } from '../../utils/geo';
import { formatPrice } from '../../utils/format';
import { colors, radius, shadow, type } from '../../theme';

const RADII = [1, 3, 5, 10];
const CARD_GAP = 12;
const SIDEBAR_W = 400;

/** Joylashuv aniqlangach eng kichik mazmunli radiusni tanlaymiz: kamida 3 ta majmua tushsin. */
const pickRadius = (list) => [3, 5, 10].find((r) => list.filter((v) => v.km <= r).length >= 3) ?? null;

/**
 * Xaritada qidiruv. `venues` — qidiruv so'zi bo'yicha saralangan majmualar
 * (joylashuv bo'lsa `km` maydoni bilan). Sport turi va radius filtrlari shu yerda.
 */
export default function SearchMap({ venues, header, loc, onAskLocation, onOpenVenue, onShowList, isDesktop }) {
  const insets = useSafeAreaInsets();
  const map = useRef(null);
  const carousel = useRef(null);
  const scrollTimer = useRef(null);

  const [sport, setSport] = useState(null);
  const [radiusKm, setRadiusKm] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [topH, setTopH] = useState(120);
  const [bottomH, setBottomH] = useState(0);
  const [boxW, setBoxW] = useState(0);

  const granted = loc.status === 'granted' && !!loc.coords;

  // Joylashuv endi aniqlandi — yaqin radiusni tanlab, xaritani foydalanuvchiga qaratamiz
  const wasGranted = useRef(granted);
  useEffect(() => {
    if (granted && !wasGranted.current) setRadiusKm(pickRadius(venues));
    wasGranted.current = granted;
  }, [granted, venues]);

  const visible = useMemo(
    () => venues.filter((v) => (!sport || v.type === sport) && (!radiusKm || !granted || v.km <= radiusKm)),
    [venues, sport, radiusKm, granted]
  );

  const sportCounts = useMemo(() => {
    const c = {};
    venues.forEach((v) => (c[v.type] = (c[v.type] || 0) + 1));
    return c;
  }, [venues]);

  const mapData = useMemo(
    () => ({
      venues: visible.map((v) => {
        const s = getSport(v.type);
        return { id: v.id, name: v.name, lat: v.coords.lat, lng: v.coords.lng, color: s.color, icon: s.icon, km: v.km != null ? formatKm(v.km) : '' };
      }),
      user: granted ? loc.coords : null,
      selectedId,
      radiusKm: granted ? radiusKm : null,
      accent: colors.primary,
    }),
    [visible, granted, loc.coords, selectedId, radiusKm]
  );

  // Filtr o'zgarganda barcha natijalar ko'rinadigan qilib xaritani moslaymiz
  const visibleKey = visible.map((v) => v.id).join(',');
  useEffect(() => {
    const t = setTimeout(() => map.current?.fit(), 60);
    return () => clearTimeout(t);
  }, [visibleKey, granted]);

  useEffect(() => {
    if (selectedId && !visible.some((v) => v.id === selectedId)) setSelectedId(null);
  }, [visible, selectedId]);

  const cardW = isDesktop ? SIDEBAR_W - 32 : Math.min(Math.max(boxW - 56, 260), 420);

  const focus = useCallback(
    (id, fromMap) => {
      const v = visible.find((x) => x.id === id);
      if (!v) return;
      setSelectedId(id);
      map.current?.flyTo(v.coords.lat, v.coords.lng, 15);
      if (fromMap) {
        const index = visible.indexOf(v);
        carousel.current?.scrollToIndex({ index, animated: true, viewPosition: isDesktop ? 0.3 : 0 });
      }
    },
    [visible, isDesktop]
  );

  // Karusel to'xtagan kartochka — xaritada tanlangan marker (web'da onMomentumScrollEnd yo'q)
  const onCarouselScroll = (e) => {
    if (isDesktop) return;
    const x = e.nativeEvent.contentOffset.x;
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const index = Math.max(0, Math.min(visible.length - 1, Math.round(x / (cardW + CARD_GAP))));
      const id = visible[index]?.id;
      if (id && id !== selectedId) focus(id, false);
    }, 140);
  };
  useEffect(() => () => clearTimeout(scrollTimer.current), []);

  const locate = () => {
    if (granted) map.current?.flyTo(loc.coords.lat, loc.coords.lng, 14);
    else onAskLocation();
  };

  const clearFilters = () => {
    setSport(null);
    setRadiusKm(null);
  };

  /* ---------- Bo'laklar ---------- */

  const sportChips = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsRow}
      style={{ flexGrow: 0 }}
    >
      <MapChip label="Hammasi" icon="view-grid-outline" active={!sport} onPress={() => setSport(null)} count={venues.length} />
      {SPORT_TYPES.map((s) => (
        <MapChip
          key={s.id}
          label={s.name}
          icon={s.icon}
          color={s.color}
          count={sportCounts[s.id] || 0}
          active={sport === s.id}
          onPress={() => setSport(sport === s.id ? null : s.id)}
        />
      ))}
    </ScrollView>
  );

  const radiusPills = [
    <View key="label" style={styles.radiusLabel}>
      <Ionicons name="radio-button-on" size={13} color={colors.primary} />
      <Text style={styles.radiusLabelText}>Radius</Text>
    </View>,
    ...[...RADII, null].map((r) => (
      <Pressable key={r ?? 'all'} onPress={() => setRadiusKm(r)} style={[styles.radiusPill, radiusKm === r && styles.radiusPillOn]}>
        <Text style={[styles.radiusText, radiusKm === r && { color: colors.white }]}>{r ? `${r} km` : 'Hammasi'}</Text>
      </Pressable>
    )),
  ];

  const radiusRow = granted ? (
    isDesktop ? (
      <View style={[styles.radiusRow, { paddingHorizontal: 0, flexDirection: 'row', flexWrap: 'wrap' }]}>{radiusPills}</View>
    ) : (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.radiusRow}>
        {radiusPills}
      </ScrollView>
    )
  ) : (
    <LocationBanner status={loc.status} onPress={onAskLocation} style={isDesktop ? null : { marginHorizontal: 16 }} />
  );

  const summary = (
    <View style={styles.summary}>
      <View style={[styles.summaryDot, { backgroundColor: granted ? colors.blue : colors.primary }]}>
        <Ionicons name={granted ? 'navigate' : 'location'} size={12} color={colors.white} />
      </View>
      <Text style={styles.summaryText}>
        {visible.length} ta majmua
        <Text style={{ color: colors.textMuted, fontWeight: '600' }}>
          {granted ? (radiusKm ? ` · ${radiusKm} km ichida` : ' · yaqinidan boshlab') : ' · Toshkent'}
        </Text>
      </Text>
    </View>
  );

  const empty = (
    <View style={[styles.empty, !isDesktop && { marginHorizontal: 16 }]}>
      <View style={styles.emptyIcon}>
        <MaterialCommunityIcons name="map-search-outline" size={26} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={type.h3}>Bu hududda majmua yo'q</Text>
        <Text style={[type.small, { marginTop: 2 }]}>Radiusni kengaytiring yoki filtrni tozalang</Text>
      </View>
      <Pressable onPress={clearFilters} style={styles.emptyBtn}>
        <Text style={styles.emptyBtnText}>Tozalash</Text>
      </Pressable>
    </View>
  );

  const fabs = (
    <View style={[styles.fabs, { top: (isDesktop ? 16 : topH) + 12 }]} pointerEvents="box-none">
      <Fab icon={granted ? 'navigate' : 'navigate-outline'} color={granted ? colors.blue : colors.text} loading={loc.status === 'loading'} onPress={locate} label="Mening joylashuvim" />
      <Fab icon="scan-outline" onPress={() => map.current?.fit()} label="Hammasini ko'rsatish" />
      {Platform.OS === 'web' && (
        <View style={[styles.zoom, shadow]}>
          <Pressable onPress={() => map.current?.zoom(1)} style={styles.zoomBtn} accessibilityLabel="Yaqinlashtirish">
            <Ionicons name="add" size={22} color={colors.text} />
          </Pressable>
          <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 8 }} />
          <Pressable onPress={() => map.current?.zoom(-1)} style={styles.zoomBtn} accessibilityLabel="Uzoqlashtirish">
            <Ionicons name="remove" size={22} color={colors.text} />
          </Pressable>
        </View>
      )}
    </View>
  );

  const renderCard = ({ item }) => (
    <MapVenueCard
      venue={item}
      width={cardW}
      active={item.id === selectedId}
      vertical={isDesktop}
      onPress={() => (isDesktop && item.id !== selectedId ? focus(item.id, false) : onOpenVenue(item.id))}
      onOpen={() => onOpenVenue(item.id)}
    />
  );

  /* ---------- Desktop: chapda ro'yxat, o'ngda xarita ---------- */
  if (isDesktop) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={styles.deskTop}>
          {header}
          <View style={{ marginTop: 12 }}>{sportChips}</View>
        </View>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={styles.sidebar}>
            <View style={{ padding: 16, gap: 12 }}>
              {summary}
              {radiusRow}
            </View>
            {visible.length === 0 ? (
              empty
            ) : (
              <FlatList
                ref={carousel}
                data={visible}
                keyExtractor={(v) => v.id}
                renderItem={renderCard}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}
                onScrollToIndexFailed={() => {}}
              />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <SportMap
              ref={map}
              data={mapData}
              insets={{ top: 0, bottom: 0 }}
              onSelect={(id) => focus(id, true)}
              onMapPress={() => setSelectedId(null)}
            />
            {fabs}
          </View>
        </View>
      </View>
    );
  }

  /* ---------- Mobil: to'liq ekran xarita + suzuvchi elementlar ---------- */
  return (
    <View style={{ flex: 1 }} onLayout={(e) => setBoxW(e.nativeEvent.layout.width)}>
      <SportMap
        ref={map}
        style={StyleSheet.absoluteFill}
        data={mapData}
        insets={{ top: topH, bottom: bottomH }}
        onSelect={(id) => focus(id, true)}
        onMapPress={() => setSelectedId(null)}
      />

      <View style={[styles.topOverlay, { paddingTop: insets.top + 8 }]} onLayout={(e) => setTopH(e.nativeEvent.layout.height)} pointerEvents="box-none">
        {header}
        <View style={{ marginTop: 12 }}>{sportChips}</View>
      </View>

      {fabs}

      <View style={styles.bottom} onLayout={(e) => setBottomH(e.nativeEvent.layout.height)} pointerEvents="box-none">
        <View style={styles.bottomHead} pointerEvents="box-none">
          {summary}
          <Pressable onPress={onShowList} style={({ pressed }) => [styles.listBtn, pressed && { opacity: 0.85 }]}>
            <Ionicons name="list" size={16} color={colors.white} />
            <Text style={styles.listBtnText}>Ro'yxat</Text>
          </Pressable>
        </View>
        <View style={{ marginBottom: 10 }}>{radiusRow}</View>
        {visible.length === 0 ? (
          empty
        ) : (
          <FlatList
            ref={carousel}
            horizontal
            data={visible}
            keyExtractor={(v) => v.id}
            renderItem={renderCard}
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardW + CARD_GAP}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 16, gap: CARD_GAP }}
            getItemLayout={(_, index) => ({ length: cardW + CARD_GAP, offset: (cardW + CARD_GAP) * index, index })}
            onScroll={onCarouselScroll}
            scrollEventThrottle={32}
            onScrollToIndexFailed={() => {}}
          />
        )}
      </View>
    </View>
  );
}

/* ---------------- Kichik komponentlar ---------------- */

function MapChip({ label, icon, color = colors.primary, active, count, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [styles.chip, shadow, active && { backgroundColor: colors.dark, borderColor: colors.dark }, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.chipIcon, { backgroundColor: active ? color : `${color}1A` }]}>
        <MaterialCommunityIcons name={icon} size={14} color={active ? colors.white : color} />
      </View>
      <Text style={[styles.chipText, active && { color: colors.white }]}>{label}</Text>
      {count > 0 && <Text style={[styles.chipCount, active && { color: 'rgba(255,255,255,0.6)' }]}>{count}</Text>}
    </Pressable>
  );
}

function Fab({ icon, onPress, color = colors.text, loading, label }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.fab, shadow, pressed && { transform: [{ scale: 0.94 }] }]}
    >
      {loading ? <ActivityIndicator size="small" color={colors.blue} /> : <Ionicons name={icon} size={20} color={color} />}
    </Pressable>
  );
}

function LocationBanner({ status, onPress, style }) {
  const loading = status === 'loading';
  const denied = status === 'denied' || status === 'unavailable';
  return (
    <Pressable onPress={onPress} disabled={loading} style={({ pressed }) => [styles.banner, shadow, pressed && { opacity: 0.9 }, style]}>
      <View style={[styles.bannerIcon, denied && { backgroundColor: colors.dangerSoft }]}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name={denied ? 'location-outline' : 'locate'} size={18} color={denied ? colors.danger : colors.primary} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={type.label}>{loading ? 'Joylashuv aniqlanmoqda…' : denied ? 'Joylashuv o\'chirilgan' : 'Yaqin majmualarni ko\'rish'}</Text>
        <Text style={type.small} numberOfLines={1}>
          {loading ? 'Bir necha soniya kuting' : 'Geolokatsiyani yoqing — masofani ko\'rsatamiz'}
        </Text>
      </View>
      {!loading && (
        <View style={styles.bannerBtn}>
          <Text style={styles.bannerBtnText}>{denied ? 'Qayta' : 'Yoqish'}</Text>
        </View>
      )}
    </Pressable>
  );
}

function MapVenueCard({ venue, width, active, vertical, onPress, onOpen }) {
  const { favorites, toggleFavorite } = useApp();
  const fav = favorites.includes(venue.id);
  const sport = getSport(venue.type);
  const open = isOpenNow(venue);
  const trip = venue.km != null ? travelTime(venue.km) : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${venue.name}, ${sport.name}`}
      style={({ pressed, hovered }) => [
        styles.card,
        shadow,
        { width },
        active && { borderColor: sport.color },
        hovered && vertical && { borderColor: colors.border },
        active && hovered && { borderColor: sport.color },
        pressed && { opacity: 0.95 },
      ]}
    >
      <SmartImage uri={venue.images[0]} style={styles.cardImg} icon={sport.icon} iconSize={26}>
        <View style={[styles.cardSport, { backgroundColor: sport.color }]}>
          <MaterialCommunityIcons name={sport.icon} size={12} color={colors.white} />
        </View>
      </SmartImage>

      <View style={{ flex: 1, marginLeft: 12, justifyContent: 'space-between' }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={[type.h3, { flex: 1, fontSize: 15 }]} numberOfLines={1}>
              {venue.name}
            </Text>
            <Pressable
              onPress={() => toggleFavorite(venue.id)}
              hitSlop={10}
              accessibilityLabel={fav ? 'Sevimlilardan olib tashlash' : "Sevimlilarga qo'shish"}
              style={{ marginLeft: 6 }}
            >
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={18} color={fav ? colors.danger : colors.textLight} />
            </Pressable>
          </View>
          <View style={[styles.row, { marginTop: 3 }]}>
            <Rating value={venue.rating} count={venue.reviewsCount} size={12} />
            <View style={styles.dotSep} />
            <View style={[styles.statusDot, { backgroundColor: open ? colors.success : colors.danger }]} />
            <Text style={[styles.statusText, { color: open ? colors.success : colors.danger }]}>{open ? 'Ochiq' : 'Yopiq'}</Text>
          </View>
          <Text style={[type.small, { marginTop: 3 }]} numberOfLines={1}>
            {venue.district}
          </Text>
        </View>

        <View style={[styles.row, { marginTop: 8 }]}>
          {trip ? (
            <>
              <View style={styles.kmPill}>
                <Ionicons name="navigate" size={11} color={colors.blue} />
                <Text style={styles.kmText}>{formatKm(venue.km)}</Text>
              </View>
              <MaterialCommunityIcons name={trip.icon} size={14} color={colors.textMuted} style={{ marginLeft: 8 }} />
              <Text style={[type.small, { marginLeft: 2 }]}>{trip.text}</Text>
            </>
          ) : (
            <Text style={styles.price}>
              {formatPrice(minPrice(venue))}
              <Text style={type.small}> dan</Text>
            </Text>
          )}
          <View style={{ flex: 1 }} />
          <Pressable onPress={onOpen} hitSlop={8} style={[styles.go, { backgroundColor: active ? sport.color : colors.primary }]} accessibilityLabel="Batafsil">
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  topOverlay: { position: 'absolute', left: 0, right: 0, top: 0 },
  deskTop: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.border },
  sidebar: { width: SIDEBAR_W, backgroundColor: colors.bg, borderRightWidth: 1, borderRightColor: colors.border },

  chipsRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 6, paddingTop: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingLeft: 5,
    paddingRight: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.white,
  },
  chipIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 7 },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.text },
  chipCount: { fontSize: 12, fontWeight: '700', color: colors.textLight, marginLeft: 6 },

  fabs: { position: 'absolute', right: 16, gap: 10, alignItems: 'center' },
  fab: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  zoom: { width: 44, borderRadius: 22, backgroundColor: colors.white, overflow: 'hidden' },
  zoomBtn: { height: 44, alignItems: 'center', justifyContent: 'center' },

  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: 14 },
  bottomHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 10 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingLeft: 5,
    paddingRight: 12,
    height: 34,
    ...shadow,
  },
  summaryDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  summaryText: { fontSize: 13, fontWeight: '800', color: colors.text },
  listBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.dark,
  },
  listBtnText: { color: colors.white, fontSize: 13, fontWeight: '700' },

  radiusRow: { paddingHorizontal: 16, gap: 6, alignItems: 'center' },
  radiusLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 2, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: radius.pill, paddingHorizontal: 10, height: 30 },
  radiusLabelText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  radiusPill: { height: 30, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.white, justifyContent: 'center', ...shadow },
  radiusPillOn: { backgroundColor: colors.primary },
  radiusText: { fontSize: 12, fontWeight: '700', color: colors.text },

  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, padding: 10, paddingRight: 10 },
  bannerIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  bannerBtn: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 14, height: 32, justifyContent: 'center' },
  bannerBtnText: { color: colors.white, fontSize: 13, fontWeight: '800' },

  empty: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, ...shadow },
  emptyIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  emptyBtn: { backgroundColor: colors.dark, borderRadius: radius.pill, paddingHorizontal: 14, height: 34, justifyContent: 'center' },
  emptyBtnText: { color: colors.white, fontSize: 13, fontWeight: '700' },

  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardImg: { width: 92, height: 100, borderRadius: 14 },
  cardSport: {
    position: 'absolute',
    left: 6,
    top: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  dotSep: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textLight, marginHorizontal: 7 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  kmPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.blueSoft, borderRadius: radius.pill, paddingHorizontal: 8, height: 22 },
  kmText: { fontSize: 12, fontWeight: '800', color: colors.blue },
  price: { fontSize: 13, fontWeight: '800', color: colors.text },
  go: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
