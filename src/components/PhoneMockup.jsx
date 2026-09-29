import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import Logo from './Logo';
import { colors } from '../theme';
import { ICONS } from '../data/icons';

/** Desktop hero'dagi telefon maketi: ilovaning bosh ekrani kichraytirilgan holda. */
export default function PhoneMockup({ width = 280, location = 'Yunusobod tumani', style }) {
  const s = width / 300; // barcha o'lchamlar 300px kenglikdagi dizayndan masshtablanadi
  const px = (n) => Math.round(n * s);

  return (
    <View style={[styles.frame, { width, height: px(610), borderRadius: px(48), padding: px(9) }, style]}>
      <View style={[styles.screen, { borderRadius: px(40), paddingHorizontal: px(14) }]}>
        {/* status bar */}
        <View style={[styles.row, { justifyContent: 'space-between', marginTop: px(14), paddingHorizontal: px(10) }]}>
          <Text style={{ fontSize: px(12), fontWeight: '700', color: colors.text }}>9:41</Text>
          <View style={[styles.row, { gap: px(4) }]}>
            <Ionicons name="cellular" size={px(12)} color={colors.text} />
            <Ionicons name="wifi" size={px(12)} color={colors.text} />
            <Ionicons name="battery-full" size={px(15)} color={colors.text} />
          </View>
        </View>
        <View style={[styles.islandWrap, { top: px(10) }]}>
          <View style={[styles.island, { width: px(92), height: px(26), borderRadius: px(14) }]} />
        </View>

        {/* header */}
        <View style={[styles.row, { justifyContent: 'space-between', marginTop: px(18) }]}>
          <Ionicons name="menu" size={px(20)} color={colors.text} />
          <Logo size={px(22)} />
          <Ionicons name="notifications-outline" size={px(18)} color={colors.text} />
        </View>
        <View style={[styles.row, { justifyContent: 'center', marginTop: px(4), gap: px(3) }]}>
          <Ionicons name="location" size={px(10)} color={colors.primary} />
          <Text style={{ fontSize: px(9), color: colors.text }} numberOfLines={1}>
            Toshkent, {location}
          </Text>
          <Ionicons name="chevron-forward" size={px(9)} color={colors.text} />
        </View>

        {/* kategoriyalar */}
        <View style={[styles.row, { gap: px(7), marginTop: px(14), alignItems: 'stretch' }]}>
          <View style={{ flex: 1 }}>
            <Tile px={px} title="Sport majmualari" sub="14 ta joy" icon={ICONS.stadium} />
          </View>
          <View style={{ flex: 1 }}>
            <Tile px={px} title="Mashg'ulotlar" sub="32 ta dastur" icon={ICONS.dumbbell} />
          </View>
          <View style={{ flex: 1 }}>
            <Tile px={px} title="Sport tadbirlari" sub="18 ta tadbir" icon={ICONS.trophy} />
          </View>
        </View>
        <View style={[styles.row, { gap: px(7), marginTop: px(7) }]}>
          <Tile px={px} wide title="Bron qilish" sub="30 soniyada" icon={ICONS.calendar} badge="Tezkor" badgeColor={colors.primary} />
          <Tile px={px} wide title="Yangiliklar" sub="Har kuni" icon={ICONS.megaphone} badge="Yangi" badgeColor={colors.blue} />
        </View>

        {/* qidiruv */}
        <View style={[styles.row, styles.search, { height: px(38), borderRadius: px(19), marginTop: px(12), paddingHorizontal: px(12), gap: px(8) }]}>
          <Ionicons name="search" size={px(14)} color={colors.textLight} />
          <Text style={{ flex: 1, fontSize: px(9), color: colors.textMuted }} numberOfLines={1}>
            Qaysi sport majmuasini qidirayapsiz?
          </Text>
          <Ionicons name="arrow-forward" size={px(13)} color={colors.textMuted} />
        </View>

        {/* yaqin atrofda */}
        <View style={[styles.row, { marginTop: px(12), gap: px(10) }]}>
          <View style={[styles.home, { width: px(34), height: px(34), borderRadius: px(10) }]}>
            <Ionicons name="home" size={px(15)} color={colors.textMuted} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: px(11), fontWeight: '800', color: colors.text }}>Yaqin atrofda</Text>
            <Text style={{ fontSize: px(8), color: colors.textLight }}>{location}, Toshkent</Text>
          </View>
          <Text style={{ fontSize: px(10), color: colors.textMuted }}>7 km</Text>
        </View>
      </View>
    </View>
  );
}

/** Maket ichidagi kategoriya kartasi (render ichida e'lon qilinmaydi — aks holda rasmlar har renderda qayta yuklanadi). */
function Tile({ px, title, sub, icon, wide, badge, badgeColor }) {
  return (
    <View style={[styles.tile, { borderRadius: px(16), padding: px(9), minHeight: px(wide ? 92 : 96) }, wide && { flex: 1 }]}>
      <Text style={[styles.tileTitle, { fontSize: px(10) }]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.tileSub, { fontSize: px(8) }]}>{sub}</Text>
      <Image
        source={icon}
        resizeMode="contain"
        style={{ width: px(wide ? 52 : 56), height: px(wide ? 52 : 56), position: 'absolute', right: px(4), bottom: px(4) }}
      />
      {badge && (
        <View style={[styles.badge, { backgroundColor: badgeColor, borderRadius: px(10), paddingHorizontal: px(8), paddingVertical: px(3), left: px(9), bottom: px(9) }]}>
          <Text style={{ color: colors.white, fontSize: px(8), fontWeight: '800' }}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  frame: {
    backgroundColor: '#1B1E27',
    borderWidth: 3,
    borderColor: '#C9CCD3',
    boxShadow: '0 40px 80px rgba(20,24,36,0.35)',
  },
  screen: { flex: 1, backgroundColor: colors.white, overflow: 'hidden' },
  islandWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  island: { backgroundColor: '#0B0C10' },
  tile: { backgroundColor: '#F3F4F6', overflow: 'hidden' },
  tileTitle: { fontWeight: '800', color: colors.text },
  tileSub: { color: colors.textLight, marginTop: 1 },
  badge: { position: 'absolute' },
  search: { backgroundColor: '#F3F4F6' },
  home: { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
});
