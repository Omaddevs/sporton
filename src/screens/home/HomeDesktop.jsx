import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text, { TextInput } from '../../components/AppText';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Logo from '../../components/Logo';
import PhoneMockup from '../../components/PhoneMockup';
import SmartImage from '../../components/SmartImage';
import { CategoryCard, EventCard, NewsCard, VenueCard, WorkoutCard } from '../../components/cards';
import { colors, radius } from '../../theme';
import { useApp } from '../../context/AppContext';
import { hoverLift, useLayout, webTransition } from '../../hooks/useLayout';
import { WORKOUTS } from '../../data/workouts';
import { EVENTS } from '../../data/events';
import { NEWS } from '../../data/news';
import { SPORT_TYPES } from '../../data/sports';
import { IMAGES } from '../../data/images';
import { ICONS } from '../../data/icons';
import { NextBookingCard } from './HomeMobile';

const GAP = 20;

/** Keng ekran (sayt) uchun bosh sahifa. Yuqori menyu `WebTopNav` da — u tab navigator ichida chiziladi. */
export default function HomeDesktop({ go, categories, nearby, nextBooking }) {
  const { contentWidth, colWidth } = useLayout();
  const { location } = useApp();
  const [query, setQuery] = useState('');

  const showVisual = contentWidth >= 1100;
  const logoSize = contentWidth >= 1200 ? 84 : 68;
  const venueCols = contentWidth >= 1150 ? 5 : 4;
  const container = { width: contentWidth, alignSelf: 'center' };

  return (
    <ScrollView style={styles.page} showsVerticalScrollIndicator>
      {/* ---------- HERO ---------- */}
      <LinearGradient colors={['#0078FF', '#1A87FF', '#3D9BFF']} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={styles.hero}>
        <View style={styles.glow1} />
        <View style={styles.glow2} />

        <View style={[container, styles.heroRow]}>
          <View style={{ flex: showVisual ? 1.15 : 1, paddingTop: 36, zIndex: 2 }}>
            <View style={styles.tagline}>
              <Text style={styles.taglineText}>Tanishing, bu sport super app</Text>
            </View>
            <View style={{ marginTop: 10, marginLeft: -4 }}>
              <Logo size={logoSize} light />
            </View>
            <Text style={styles.heroSub}>
              Sport majmualarini toping, bron qiling,{'\n'}mashq qiling va sport bilan yashang!
            </Text>

            <View style={styles.search}>
              <Ionicons name="search" size={24} color={colors.text} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => go.search(query.trim())}
                placeholder="Qaysi sport majmuasini qidirayapsiz?"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                returnKeyType="search"
              />
              <View style={styles.searchDivider} />
              <Pressable onPress={() => go.venues()} style={styles.filterBtn} accessibilityLabel="Filtrlar">
                <Ionicons name="options-outline" size={24} color={colors.text} />
              </Pressable>
              <Pressable
                onPress={() => go.search(query.trim())}
                style={({ hovered }) => [styles.searchGo, webTransition, hovered && { backgroundColor: colors.primaryDark }]}
                accessibilityLabel="Qidirish"
              >
                <Ionicons name="arrow-forward" size={22} color={colors.white} />
              </Pressable>
            </View>

            <View style={styles.catRow}>
              {categories.map(({ key, ...c }) => (
                <CategoryCard key={key} imageSize={96} style={styles.catCard} {...c} />
              ))}
            </View>
          </View>

          {showVisual && <HeroVisual location={location} />}
        </View>
      </LinearGradient>
      {/* hero pastidagi oq to'lqin */}
      <View style={styles.waveWrap}>
        <View style={styles.wave} />
      </View>

      <View style={[container, { paddingBottom: 56 }]}>
        {nextBooking && <NextBookingCard booking={nextBooking} onPress={go.bookings} style={{ marginBottom: 32, maxWidth: 520 }} />}

        {/* ---------- YAQIN MAJMUALAR ---------- */}
        <Section title="Yaqin atrofdagi sport majmualari" subtitle="Sizga eng yaqin va mashhur sport majmualari" onAction={() => go.venues()}>
          <View style={styles.grid}>
            {nearby.slice(0, venueCols).map((v) => (
              <VenueCard key={v.id} venue={v} width={colWidth(venueCols, GAP)} onPress={() => go.venue(v.id)} onBook={() => go.book(v.id)} />
            ))}
          </View>
        </Section>

        {/* ---------- SPORT TURLARI ---------- */}
        <Section title="Sport turlari" subtitle="O'zingizga yoqqan sport turini tanlang">
          <View style={styles.grid}>
            {SPORT_TYPES.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => go.venues({ type: s.id })}
                style={({ hovered }) => [styles.sport, { width: colWidth(SPORT_TYPES.length, GAP) }, webTransition, hovered && hoverLift]}
              >
                <View style={[styles.sportIcon, { backgroundColor: `${s.color}18` }]}>
                  <MaterialCommunityIcons name={s.icon} size={30} color={s.color} />
                </View>
                <Text style={styles.sportName}>{s.name}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        {/* ---------- MASHG'ULOTLAR ---------- */}
        <Section title="Uyda mashg'ulot" subtitle="Ko'ring va murabbiy bilan birga bajaring" onAction={go.workouts}>
          <View style={styles.grid}>
            {WORKOUTS.slice(0, 4).map((w) => (
              <WorkoutCard key={w.id} workout={w} width={colWidth(4, GAP)} onPress={() => go.workout(w.id)} />
            ))}
          </View>
        </Section>

        {/* ---------- TADBIRLAR ---------- */}
        <Section title="Yaqinlashayotgan tadbirlar" subtitle="Turnirlar, marafonlar va ochiq mashg'ulotlar" onAction={go.events}>
          <View style={styles.grid}>
            {EVENTS.slice(0, 4).map((e) => (
              <EventCard key={e.id} event={e} width={colWidth(4, GAP)} onPress={() => go.event(e.id)} />
            ))}
          </View>
        </Section>

        {/* ---------- YANGILIKLAR ---------- */}
        <Section title="So'nggi yangiliklar" subtitle="Sport olamidagi eng muhim voqealar" onAction={go.news}>
          <View style={styles.grid}>
            {NEWS.slice(0, 6).map((n) => (
              <View key={n.id} style={{ width: colWidth(3, GAP) }}>
                <NewsCard item={n} onPress={() => go.newsItem(n.id)} />
              </View>
            ))}
          </View>
        </Section>

        <AppBanner location={location} />
      </View>

      <Footer go={go} container={container} />
    </ScrollView>
  );
}

function Section({ title, subtitle, onAction, children }) {
  return (
    <View style={{ marginBottom: 48 }}>
      <View style={styles.sectionHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.sectionSub}>{subtitle}</Text>}
        </View>
        {onAction && (
          <Pressable onPress={onAction} style={({ hovered }) => [styles.sectionAction, hovered && { opacity: 0.7 }]}>
            <Text style={styles.sectionActionText}>Barchasini ko'rish</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.blue} />
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

/** Hero o'ng tomoni: sport majmuasi surati, telefon maketi va 3D buyumlar. */
function HeroVisual({ location }) {
  return (
    <View style={styles.visual}>
      <SmartImage uri={IMAGES.football[1]} style={styles.visualPhoto} icon="stadium-variant" iconSize={80}>
        <LinearGradient
          colors={['rgba(0,120,255,0.95)', 'rgba(0,120,255,0.25)', 'rgba(0,120,255,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.7, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </SmartImage>
      <PhoneMockup width={290} location={location} style={styles.phone} />
      <Image source={ICONS.trophy} style={styles.floatTrophy} resizeMode="contain" />
      <Image source={ICONS.dumbbell} style={styles.floatDumbbell} resizeMode="contain" />
      <View style={styles.floatBadge}>
        <MaterialCommunityIcons name="run-fast" size={40} color={colors.primary} />
      </View>
    </View>
  );
}

function AppBanner({ location }) {
  return (
    <LinearGradient colors={['#232838', '#141824']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
      <View style={styles.bannerGlow} />
      <View style={{ flex: 1, paddingVertical: 48, paddingLeft: 56, zIndex: 1 }}>
        <View style={[styles.tagline, { backgroundColor: colors.primary }]}>
          <Text style={styles.taglineText}>Mobil ilova</Text>
        </View>
        <Text style={styles.bannerTitle}>SportON har doim{'\n'}cho'ntagingizda</Text>
        <Text style={styles.bannerText}>
          Maydonni 30 soniyada bron qiling, mashg'ulotlarni kuzating va tadbirlardan birinchi bo'lib xabardor bo'ling.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 28 }}>
          <StoreButton icon="logo-apple" top="Yuklab oling" label="App Store" />
          <StoreButton icon="logo-google-playstore" top="Mavjud" label="Google Play" />
        </View>
      </View>
      <View style={styles.bannerPhone}>
        <PhoneMockup width={250} location={location} />
      </View>
    </LinearGradient>
  );
}

function StoreButton({ icon, top, label }) {
  return (
    <Pressable style={({ hovered }) => [styles.store, webTransition, hovered && { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
      <Ionicons name={icon} size={26} color={colors.white} />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.storeTop}>{top}</Text>
        <Text style={styles.storeLabel}>{label}</Text>
      </View>
    </Pressable>
  );
}

function Footer({ go, container }) {
  const cols = [
    { title: 'Xizmatlar', links: [['Sport majmualari', () => go.venues()], ["Mashg'ulotlar", go.workouts], ['Sport tadbirlari', go.events], ['Yangiliklar', go.news]] },
    { title: 'Hisob', links: [['Bronlarim', go.bookings], ['Profil', go.profile], ['Bildirishnomalar', go.notifications], ['Manzil', go.location]] },
  ];
  return (
    <View style={styles.footer}>
      <View style={[container, styles.footerRow]}>
        <View style={{ flex: 1.4, paddingRight: 48 }}>
          <Logo size={34} light />
          <Text style={styles.footerText}>
            Toshkentdagi sport majmualari, mashg'ulotlar va tadbirlar — hammasi bitta ilovada.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
            {['logo-instagram', 'paper-plane', 'logo-youtube', 'logo-facebook'].map((i) => (
              <View key={i} style={styles.social}>
                <Ionicons name={i} size={18} color={colors.white} />
              </View>
            ))}
          </View>
        </View>
        {cols.map((c) => (
          <View key={c.title} style={{ flex: 1 }}>
            <Text style={styles.footerHead}>{c.title}</Text>
            {c.links.map(([label, onPress]) => (
              <Pressable key={label} onPress={onPress}>
                {({ hovered }) => <Text style={[styles.footerLink, hovered && { color: colors.white }]}>{label}</Text>}
              </Pressable>
            ))}
          </View>
        ))}
        <View style={{ flex: 1 }}>
          <Text style={styles.footerHead}>Aloqa</Text>
          <Text style={styles.footerLink}>+998 71 200 00 00</Text>
          <Text style={styles.footerLink}>info@sporton.uz</Text>
          <Text style={styles.footerLink}>Toshkent, Yunusobod tumani</Text>
        </View>
      </View>
      <View style={[container, styles.footerBottom]}>
        <Text style={styles.copy}>© {new Date().getFullYear()} SportON. Barcha huquqlar himoyalangan.</Text>
        <Text style={styles.copy}>Sport bilan yashang 🧡</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FAFAFB' },
  hero: { paddingBottom: 110, overflow: 'hidden' },
  glow1: { position: 'absolute', width: 620, height: 620, borderRadius: 310, backgroundColor: 'rgba(255,255,255,0.07)', top: -260, left: -180 },
  glow2: { position: 'absolute', width: 420, height: 420, borderRadius: 210, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -200, left: '38%' },
  heroRow: { flexDirection: 'row', alignItems: 'stretch', gap: 24 },
  tagline: { alignSelf: 'flex-start', backgroundColor: colors.dark, borderRadius: radius.pill, paddingHorizontal: 20, paddingVertical: 9 },
  taglineText: { color: colors.white, fontSize: 17, fontWeight: '600' },
  heroSub: { color: colors.white, fontSize: 22, fontWeight: '700', lineHeight: 31, marginTop: 8 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 68,
    marginTop: 26,
    paddingLeft: 24,
    paddingRight: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    boxShadow: '0 18px 40px rgba(120,40,0,0.22)',
  },
  searchInput: { flex: 1, height: '100%', marginLeft: 14, fontSize: 17, color: colors.text, outlineStyle: 'none' },
  searchDivider: { width: 1, height: 34, backgroundColor: colors.border, marginHorizontal: 8 },
  filterBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  searchGo: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  catRow: { flexDirection: 'row', gap: 12, marginTop: 28 },
  catCard: { minHeight: 172, borderRadius: 22, padding: 14 },
  waveWrap: { height: 90, marginTop: -90, overflow: 'hidden' },
  wave: {
    position: 'absolute',
    left: '-10%',
    right: '-10%',
    top: 0,
    height: 400,
    borderTopLeftRadius: 1400,
    borderTopRightRadius: 1400,
    backgroundColor: '#FAFAFB',
  },
  visual: { flex: 1, minHeight: 560, marginTop: 10 },
  visualPhoto: { position: 'absolute', top: 0, bottom: 20, left: -40, right: -80, borderRadius: 40 },
  phone: { position: 'absolute', top: 6, right: 70, transform: [{ rotate: '6deg' }] },
  floatTrophy: { position: 'absolute', width: 150, height: 150, left: 0, bottom: 30, transform: [{ rotate: '-8deg' }] },
  floatDumbbell: { position: 'absolute', width: 170, height: 170, right: -10, bottom: -10, transform: [{ rotate: '-12deg' }] },
  floatBadge: {
    position: 'absolute',
    right: 0,
    top: 120,
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '12deg' }],
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 },
  sectionTitle: { fontSize: 30, fontWeight: '900', color: colors.text, letterSpacing: -0.6 },
  sectionSub: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 4 },
  sectionActionText: { color: colors.blue, fontSize: 15, fontWeight: '700' },
  sport: {
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: colors.white,
    boxShadow: '0 6px 18px rgba(31,41,55,0.06)',
  },
  sportIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sportName: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 10 },
  banner: { flexDirection: 'row', borderRadius: 36, overflow: 'hidden', minHeight: 380 },
  bannerGlow: { position: 'absolute', width: 520, height: 520, borderRadius: 260, backgroundColor: 'rgba(0,120,255,0.22)', right: -120, top: -140 },
  bannerTitle: { color: colors.white, fontSize: 40, fontWeight: '900', letterSpacing: -1, lineHeight: 46, marginTop: 18 },
  bannerText: { color: 'rgba(255,255,255,0.72)', fontSize: 16, lineHeight: 25, marginTop: 14, maxWidth: 480 },
  bannerPhone: { width: 380, alignItems: 'center', paddingTop: 40, marginBottom: -180 },
  store: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  storeTop: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  storeLabel: { color: colors.white, fontSize: 17, fontWeight: '800' },
  footer: { backgroundColor: colors.dark, paddingTop: 56 },
  footerRow: { flexDirection: 'row', gap: 32, paddingBottom: 40 },
  footerText: { color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 23, marginTop: 16, maxWidth: 360 },
  social: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  footerHead: { color: colors.white, fontSize: 16, fontWeight: '800', marginBottom: 14 },
  footerLink: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 10 },
  footerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 22,
  },
  copy: { color: 'rgba(255,255,255,0.45)', fontSize: 13 },
});
