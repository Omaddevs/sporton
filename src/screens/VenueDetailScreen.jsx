import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, FlatList, Image, Modal, Platform, Pressable, ScrollView, Share, StyleSheet, View, useWindowDimensions } from 'react-native';
import Text from '../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SmartImage from '../components/SmartImage';
import { BackButton, Badge, Button, EmptyState, IconButton, Rating, useSafeBack } from '../components/ui';
import { VenueCard } from '../components/cards';
import { colors, radius, shadow, type } from '../theme';
import { useApp } from '../context/AppContext';
import { useLayout } from '../hooks/useLayout';
import { getVenue, minPrice, openStatus, similarVenues } from '../data/venues';
import { AMENITIES, getSport } from '../data/sports';
import { formatDate, formatHour, formatPrice } from '../utils/format';
import { callPhone, openMaps } from '../utils/links';

const NATIVE_DRIVER = Platform.OS !== 'web';
const AMENITY_LIMIT = 8;
const DESC_LIMIT = 150;

export default function VenueDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { width: winW, height: winH } = useWindowDimensions();
  const { isDesktop, contentWidth } = useLayout();
  const venue = getVenue(route.params?.id);
  const { favorites, toggleFavorite } = useApp();
  const goBack = useSafeBack();

  const W = isDesktop ? contentWidth : winW;
  const HERO_H = isDesktop ? 440 : 340;
  const HEADER_H = insets.top + 58;

  const [slide, setSlide] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [expandDesc, setExpandDesc] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Sarlavha yig'ilgan/yig'ilmagan holatini kuzatamiz (bosish uchun pointerEvents)
  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      const next = value > HERO_H - 100;
      setCollapsed((c) => (c === next ? c : next));
    });
    return () => scrollY.removeListener(id);
  }, [scrollY, HERO_H]);

  const stats = useMemo(() => {
    const list = venue?.reviews || [];
    return {
      total: list.length,
      dist: [5, 4, 3, 2, 1].map((star) => ({ star, count: list.filter((r) => r.rating === star).length })),
    };
  }, [venue]);
  const similar = useMemo(() => (venue ? similarVenues(venue) : []), [venue]);

  if (!venue) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <EmptyState icon="alert-circle-outline" title="Majmua topilmadi" text="Havola eskirgan yoki majmua o'chirilgan" actionLabel="Orqaga" onAction={goBack} />
      </View>
    );
  }

  const fav = favorites.includes(venue.id);
  const sport = getSport(venue.type);
  const status = openStatus(venue);
  const reviews = showAllReviews ? venue.reviews : venue.reviews.slice(0, 2);
  const amenities = showAllAmenities ? venue.amenities : venue.amenities.slice(0, AMENITY_LIMIT);
  const longDesc = venue.description.length > DESC_LIMIT;
  const cheapest = minPrice(venue);

  const headerOpacity = scrollY.interpolate({ inputRange: [HERO_H - 160, HERO_H - 80], outputRange: [0, 1], extrapolate: 'clamp' });
  const heroBtnOpacity = scrollY.interpolate({ inputRange: [HERO_H - 160, HERO_H - 100], outputRange: [1, 0], extrapolate: 'clamp' });
  const heroScale = scrollY.interpolate({ inputRange: [-240, 0], outputRange: [1.6, 1], extrapolateRight: 'clamp' });
  const heroShift = scrollY.interpolate({ inputRange: [-240, 0, HERO_H], outputRange: [-120, 0, HERO_H * 0.35] });

  const share = async () => {
    try {
      await Share.share({ message: `${venue.name} — ${venue.address}, ${venue.district}. SportON ilovasida bron qiling!` });
    } catch {
      /* web yoki bekor qilingan ulashish */
    }
  };
  const book = (fieldId) => navigation.navigate('Booking', { venueId: venue.id, fieldId });
  const onHeroScroll = (e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / W));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: NATIVE_DRIVER })}
      >
        <View style={{ width: W, alignSelf: 'center' }}>
          {/* ---------- Galereya ---------- */}
          <View style={{ height: HERO_H, overflow: 'hidden' }}>
            <Animated.View style={{ height: HERO_H, transform: [{ translateY: heroShift }, { scale: heroScale }] }}>
              <FlatList
                data={venue.images}
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(u, i) => `${i}`}
                onScroll={onHeroScroll}
                scrollEventThrottle={32}
                getItemLayout={(_, i) => ({ length: W, offset: W * i, index: i })}
                renderItem={({ item }) => (
                  <Pressable onPress={() => setLightbox(true)} accessibilityLabel="Rasmni kattalashtirish">
                    <SmartImage uri={item} style={{ width: W, height: HERO_H }} icon={sport.icon} iconSize={64} fade />
                  </Pressable>
                )}
              />
            </Animated.View>
            <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent']} style={[styles.topFade, { height: HEADER_H + 30 }]} pointerEvents="none" />

            {/* Rasm hisoblagichi va nuqtalar */}
            {venue.images.length > 1 && (
              <>
                <View style={styles.counter}>
                  <Ionicons name="images-outline" size={12} color={colors.white} />
                  <Text style={styles.counterText}>
                    {slide + 1} / {venue.images.length}
                  </Text>
                </View>
                <View style={styles.dots}>
                  {venue.images.map((_, i) => (
                    <View key={i} style={[styles.dot, i === slide && styles.dotActive]} />
                  ))}
                </View>
              </>
            )}
          </View>

          {/* ---------- Asosiy ma'lumot ---------- */}
          <View style={styles.sheet}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Badge label={sport.name} color={sport.color} bg={`${sport.color}1A`} />
              <Badge
                label={`${status.label} · ${status.hint}`}
                icon={status.open ? 'time' : 'time-outline'}
                color={status.open ? colors.success : colors.danger}
                bg={status.open ? colors.successSoft : colors.dangerSoft}
              />
              {venue.popular && <Badge label="Mashhur" icon="flame" color={colors.primary} bg={colors.primarySoft} />}
            </View>

            <Text style={[type.h1, { marginTop: 12 }]}>{venue.name}</Text>

            <View style={styles.metaRow}>
              <Rating value={venue.rating} count={venue.reviewsCount} />
              <View style={styles.sep} />
              <Ionicons name="navigate-outline" size={14} color={colors.textMuted} />
              <Text style={[type.small, { marginLeft: 4 }]}>{venue.distance} km</Text>
              <View style={styles.sep} />
              <Text style={type.small} numberOfLines={1}>
                {venue.district}
              </Text>
            </View>

            <Pressable onPress={() => openMaps(venue)} style={({ pressed }) => [styles.addressRow, pressed && { opacity: 0.7 }]}>
              <Ionicons name="location-outline" size={16} color={colors.blue} />
              <Text style={[type.small, { marginLeft: 6, flex: 1, color: colors.text }]} numberOfLines={2}>
                {venue.address}, {venue.district}
              </Text>
              <Text style={styles.link}>Xarita</Text>
            </Pressable>

            {/* Tezkor amallar */}
            <View style={styles.actions}>
              <QuickAction icon="call-outline" label="Qo'ng'iroq" onPress={() => callPhone(venue.phone)} />
              <QuickAction icon="map-outline" label="Yo'nalish" onPress={() => openMaps(venue)} />
              <QuickAction icon="share-social-outline" label="Ulashish" onPress={share} />
              <QuickAction
                icon={fav ? 'heart' : 'heart-outline'}
                label={fav ? 'Saqlandi' : 'Saqlash'}
                tint={fav ? colors.danger : undefined}
                onPress={() => toggleFavorite(venue.id)}
              />
            </View>
          </View>

          {/* ---------- Qisqa faktlar ---------- */}
          <View style={styles.facts}>
            <Fact icon="cash-outline" label="Narx" value={formatPrice(cheapest)} sub="dan / soat" />
            <View style={styles.factDivider} />
            <Fact icon="time-outline" label="Ish vaqti" value={`${formatHour(venue.open)} – ${formatHour(venue.close)}`} sub="har kuni" />
            <View style={styles.factDivider} />
            <Fact icon="grid-outline" label="Maydonlar" value={`${venue.fields.length} ta`} sub={venue.fields[0].surface} />
          </View>

          {/* ---------- Maydonlar ---------- */}
          <SectionTitle title="Maydonlar va xizmatlar" hint="Bron qilish uchun tanlang" />
          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {venue.fields.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => book(f.id)}
                accessibilityRole="button"
                accessibilityLabel={`${f.name}, ${formatPrice(f.price)} soatiga`}
                style={({ pressed }) => [styles.field, pressed && { opacity: 0.85 }]}
              >
                <View style={[styles.fieldIcon, { backgroundColor: `${sport.color}1A` }]}>
                  <MaterialCommunityIcons name={sport.icon} size={22} color={sport.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={type.h3}>{f.name}</Text>
                  <Text style={[type.small, { marginTop: 2 }]}>
                    {f.size} · {f.surface}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.fieldPrice}>{formatPrice(f.price)}</Text>
                  <Text style={styles.fieldUnit}>/ soat</Text>
                </View>
                <View style={styles.fieldGo}>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </View>
              </Pressable>
            ))}
          </View>

          {/* ---------- Qulayliklar ---------- */}
          <SectionTitle title="Qulayliklar" hint={`${venue.amenities.length} ta`} />
          <View style={styles.amenities}>
            {amenities.map((a) => (
              <View key={a} style={styles.amenity}>
                <View style={styles.amenityIcon}>
                  <MaterialCommunityIcons name={AMENITIES[a].icon} size={22} color={colors.primary} />
                </View>
                <Text style={styles.amenityText} numberOfLines={2}>
                  {AMENITIES[a].label}
                </Text>
              </View>
            ))}
          </View>
          {venue.amenities.length > AMENITY_LIMIT && (
            <Pressable onPress={() => setShowAllAmenities((s) => !s)} style={styles.moreBtn} hitSlop={6}>
              <Text style={styles.link}>{showAllAmenities ? 'Kamroq' : `Yana ${venue.amenities.length - AMENITY_LIMIT} ta`}</Text>
              <Ionicons name={showAllAmenities ? 'chevron-up' : 'chevron-down'} size={14} color={colors.blue} />
            </Pressable>
          )}

          {/* ---------- Tavsif ---------- */}
          <SectionTitle title="Majmua haqida" />
          <View style={styles.descCard}>
            <Text style={[type.body, { color: colors.textMuted }]} numberOfLines={longDesc && !expandDesc ? 3 : undefined}>
              {venue.description}
            </Text>
            {longDesc && (
              <Pressable onPress={() => setExpandDesc((s) => !s)} hitSlop={6} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                <Text style={styles.link}>{expandDesc ? 'Kamroq' : "To'liq o'qish"}</Text>
              </Pressable>
            )}
            <View style={styles.hoursRow}>
              <Ionicons name="calendar-outline" size={15} color={colors.textMuted} />
              <Text style={[type.small, { marginLeft: 6, flex: 1 }]}>Har kuni, dam olish kunlarisiz</Text>
              <Text style={[type.label, { fontSize: 12 }]}>
                {formatHour(venue.open)} – {formatHour(venue.close)}
              </Text>
            </View>
            <View style={[styles.hoursRow, { borderTopWidth: 0, paddingTop: 6 }]}>
              <Ionicons name="call-outline" size={15} color={colors.textMuted} />
              <Text style={[type.small, { marginLeft: 6, flex: 1 }]}>Telefon</Text>
              <Pressable onPress={() => callPhone(venue.phone)} hitSlop={6}>
                <Text style={[type.label, { fontSize: 12, color: colors.blue }]}>{venue.phone}</Text>
              </Pressable>
            </View>
          </View>

          {/* ---------- Xarita ---------- */}
          <Pressable onPress={() => openMaps(venue)} style={({ pressed }) => [styles.mapCard, pressed && { opacity: 0.85 }]}>
            <View style={styles.mapPin}>
              <Ionicons name="location" size={26} color={colors.white} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={type.h3}>Xaritada ko'rish</Text>
              <Text style={type.small} numberOfLines={1}>
                {venue.address} · {venue.distance} km
              </Text>
            </View>
            <Ionicons name="open-outline" size={20} color={colors.blue} />
          </Pressable>

          {/* ---------- Sharhlar ---------- */}
          <SectionTitle title="Sharhlar" hint={`${venue.reviewsCount} ta`} />
          <View style={styles.summary}>
            <View style={{ alignItems: 'center', width: 96 }}>
              <Text style={styles.bigNumber}>{venue.rating.toFixed(1)}</Text>
              <Stars value={Math.round(venue.rating)} size={13} />
              <Text style={[type.small, { marginTop: 4 }]}>{venue.reviewsCount} sharh</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              {stats.dist.map((d) => (
                <View key={d.star} style={styles.barRow}>
                  <Text style={styles.barLabel}>{d.star}</Text>
                  <Ionicons name="star" size={10} color={colors.star} />
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${stats.total ? (d.count / stats.total) * 100 : 0}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={{ paddingHorizontal: 16, gap: 10, marginTop: 10 }}>
            {reviews.map((r) => (
              <View key={r.id} style={styles.review}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.avatar}>
                    <Text style={{ color: colors.primary, fontWeight: '800' }}>{r.author[0]}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={type.label}>{r.author}</Text>
                    <Text style={type.small}>{formatDate(r.date)}</Text>
                  </View>
                  <Stars value={r.rating} size={12} />
                </View>
                <Text style={[type.body, { marginTop: 8, color: colors.textMuted }]}>{r.text}</Text>
              </View>
            ))}
            {venue.reviews.length > 2 && (
              <Button
                title={showAllReviews ? 'Kamroq ko\'rsatish' : `Barcha sharhlar (${venue.reviews.length})`}
                variant="outline"
                size="md"
                onPress={() => setShowAllReviews((s) => !s)}
              />
            )}
          </View>

          {/* ---------- O'xshash majmualar ---------- */}
          {similar.length > 0 && (
            <>
              <SectionTitle title="O'xshash majmualar" hint="Sizga yoqishi mumkin" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}>
                {similar.map((v) => (
                  <VenueCard
                    key={v.id}
                    venue={v}
                    width={230}
                    onPress={() => navigation.push('VenueDetail', { id: v.id })}
                    onBook={() => navigation.navigate('Booking', { venueId: v.id })}
                  />
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </Animated.ScrollView>

      {/* ---------- Galereya ustidagi tugmalar ---------- */}
      <Animated.View
        style={[styles.heroBar, { top: insets.top + 8, width: W, alignSelf: 'center', opacity: heroBtnOpacity, pointerEvents: collapsed ? 'none' : 'auto' }]}
      >
        <BackButton onPress={goBack} bg="rgba(255,255,255,0.94)" />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <IconButton name="share-social-outline" label="Ulashish" bg="rgba(255,255,255,0.94)" onPress={share} style={shadow} />
          <IconButton
            name={fav ? 'heart' : 'heart-outline'}
            label="Sevimlilar"
            bg="rgba(255,255,255,0.94)"
            color={fav ? colors.danger : colors.text}
            onPress={() => toggleFavorite(venue.id)}
            style={shadow}
          />
        </View>
      </Animated.View>

      {/* ---------- Yig'iluvchi sarlavha ---------- */}
      <Animated.View style={[styles.header, { height: HEADER_H, paddingTop: insets.top + 8, opacity: headerOpacity, pointerEvents: collapsed ? 'auto' : 'none' }]}>
        <View style={[styles.headerInner, { width: W }]}>
          <BackButton onPress={goBack} bg={colors.surface} style={{ boxShadow: 'none', shadowOpacity: 0, elevation: 0 }} />
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={[type.h3, { fontSize: 15 }]} numberOfLines={1}>
              {venue.name}
            </Text>
            <Text style={type.small} numberOfLines={1}>
              ★ {venue.rating.toFixed(1)} · {venue.district}
            </Text>
          </View>
          <IconButton
            name={fav ? 'heart' : 'heart-outline'}
            label="Sevimlilar"
            bg={colors.surface}
            color={fav ? colors.danger : colors.text}
            onPress={() => toggleFavorite(venue.id)}
          />
        </View>
      </Animated.View>

      {/* ---------- Pastki panel ---------- */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <View style={[styles.bottomInner, { width: W }]}>
          <View>
            <Text style={type.small}>Boshlang'ich narx</Text>
            <Text style={styles.bottomPrice}>
              {formatPrice(cheapest)}
              <Text style={type.small}> / soat</Text>
            </Text>
          </View>
          <Button title="Bron qilish" icon="calendar" onPress={() => book()} style={{ flex: 1, marginLeft: 16, maxWidth: 360 }} />
        </View>
      </View>

      {/* ---------- To'liq ekran galereya ---------- */}
      <Modal visible={lightbox} transparent={false} animationType="fade" onRequestClose={() => setLightbox(false)}>
        <View style={styles.lightbox}>
          <FlatList
            data={venue.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={Math.min(slide, venue.images.length - 1)}
            getItemLayout={(_, i) => ({ length: winW, offset: winW * i, index: i })}
            keyExtractor={(u, i) => `lb-${i}`}
            onScroll={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / winW))}
            scrollEventThrottle={32}
            renderItem={({ item }) => <Image source={{ uri: item }} style={{ width: winW, height: winH }} resizeMode="contain" />}
          />
          <View style={[styles.lightboxBar, { top: insets.top + 12 }]}>
            <Text style={styles.lightboxText}>
              {slide + 1} / {venue.images.length}
            </Text>
            <IconButton name="close" label="Yopish" bg="rgba(255,255,255,0.16)" color={colors.white} onPress={() => setLightbox(false)} />
          </View>
          <Text style={[styles.lightboxCaption, { bottom: insets.bottom + 20 }]} numberOfLines={1}>
            {venue.name}
          </Text>
        </View>
      </Modal>
    </View>
  );
}

/* ---------------- Kichik yordamchi komponentlar ---------------- */
function QuickAction({ icon, label, onPress, tint }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.qa, pressed && { opacity: 0.7 }]}>
      <View style={[styles.qaIcon, tint && { backgroundColor: colors.dangerSoft }]}>
        <Ionicons name={icon} size={20} color={tint || colors.primary} />
      </View>
      <Text style={styles.qaText}>{label}</Text>
    </Pressable>
  );
}

function Fact({ icon, label, value, sub }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={16} color={colors.textLight} />
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.factSub} numberOfLines={1}>
        {sub}
      </Text>
    </View>
  );
}

function SectionTitle({ title, hint }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={type.h2}>{title}</Text>
      {!!hint && <Text style={type.small}>{hint}</Text>}
    </View>
  );
}

function Stars({ value, size = 12 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Ionicons key={s} name="star" size={size} color={s <= value ? colors.star : colors.border} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  topFade: { position: 'absolute', left: 0, right: 0, top: 0 },
  heroBar: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between' },
  counter: {
    position: 'absolute',
    right: 16,
    bottom: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,24,36,0.6)',
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  counterText: { color: colors.white, fontSize: 11, fontWeight: '700', marginLeft: 4 },
  dots: { position: 'absolute', bottom: 46, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { width: 22, backgroundColor: colors.white },

  sheet: {
    backgroundColor: colors.white,
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 16,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  sep: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textLight, marginHorizontal: 10 },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  link: { fontSize: 12, fontWeight: '700', color: colors.blue },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  qa: { alignItems: 'center', flex: 1 },
  qaIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  qaText: { fontSize: 12, fontWeight: '600', color: colors.text, marginTop: 6 },

  facts: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: radius.lg,
    paddingVertical: 14,
    ...shadow,
  },
  fact: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  factDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
  factLabel: { fontSize: 11, color: colors.textLight, fontWeight: '600', marginTop: 4 },
  factValue: { fontSize: 13, fontWeight: '800', color: colors.text, marginTop: 2 },
  factSub: { fontSize: 10, color: colors.textMuted, marginTop: 1 },

  sectionTitle: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 24, marginBottom: 12 },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, padding: 12, ...shadow },
  fieldIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  fieldPrice: { fontSize: 15, fontWeight: '800', color: colors.primary },
  fieldUnit: { fontSize: 11, color: colors.textLight, marginTop: 1 },
  fieldGo: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },

  amenities: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  amenity: { width: '25%', alignItems: 'center', paddingHorizontal: 4, marginBottom: 14 },
  amenityIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow },
  amenityText: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 6, fontWeight: '500' },
  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'center', paddingVertical: 4 },

  descCard: { backgroundColor: colors.white, marginHorizontal: 16, borderRadius: radius.lg, padding: 16, ...shadow },
  hoursRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },

  mapCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, padding: 14, backgroundColor: colors.blueSoft, borderRadius: radius.lg },
  mapPin: { width: 50, height: 50, borderRadius: 16, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },

  summary: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, marginHorizontal: 16, borderRadius: radius.lg, padding: 16, ...shadow },
  bigNumber: { fontSize: 40, fontWeight: '900', color: colors.text, lineHeight: 44, letterSpacing: -1 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  barLabel: { width: 10, fontSize: 11, fontWeight: '700', color: colors.textMuted, textAlign: 'right', marginRight: 3 },
  barTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border, marginLeft: 6, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3, backgroundColor: colors.star },
  review: { backgroundColor: colors.white, borderRadius: radius.md, padding: 14, ...shadow },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  headerInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },

  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    paddingTop: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    ...shadow,
  },
  bottomInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  bottomPrice: { fontSize: 18, fontWeight: '900', color: colors.text },

  lightbox: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  lightboxBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lightboxText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  lightboxCaption: { position: 'absolute', left: 16, right: 16, color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
