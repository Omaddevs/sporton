import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

const TAB_ICONS = {
  Home: 'home',
  SearchTab: 'search',
  Bookings: 'calendar',
  NotificationsTab: 'notifications',
  Profile: 'person',
};

// O'lchamlar (px)
const BAR_HEIGHT = 64;
const BAR_PAD = 8; // kapsula ichki chetlari
const PILL_HEIGHT = 48;
const PILL_PAD_L = 10;
const PILL_PAD_R = 16;
const ICON_CIRCLE = 30;
const LABEL_GAP = 8;
const LABEL_FONT = { fontFamily: fonts.sans, fontSize: 13, lineHeight: 18, fontWeight: '700', letterSpacing: -0.2 };

// Barcha spring'lar bir xil konfiguratsiya bilan yuradi: kapsula, kengliklar va ikonkalar sinxron harakatlanadi
const SPRING = { damping: 20, stiffness: 210, mass: 0.9, overshootClamping: false, useNativeDriver: false };

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

/**
 * Mobil uchun "suzuvchi" tab bar.
 * Qora kapsula ichida ikonkalar; faol tab oq kapsulaga kengayib ikonka + nom ko'rsatadi.
 * Tab almashganda oq kapsula spring bilan sirg'alib o'tadi, kengliklar, ikonka va nom
 * bir vaqtning o'zida silliq interpolyatsiya qilinadi.
 */
export default function FloatingTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  const routes = useMemo(
    () => state.routes.filter((r) => descriptors[r.key].options.tabBarItemStyle?.display !== 'none'),
    [state.routes, descriptors]
  );
  const activeKey = state.routes[state.index].key;
  const activeIndex = Math.max(
    0,
    routes.findIndex((r) => r.key === activeKey)
  );
  const count = routes.length;

  const labelOf = (route) => {
    const { options } = descriptors[route.key];
    return String(options.tabBarLabel ?? options.title ?? route.name);
  };

  // --- O'lchovlar: kapsula kengligi va har bir nomning kengligi ---
  const [barWidth, setBarWidth] = useState(0);
  const [labelWidths, setLabelWidths] = useState({});
  const onLabelLayout = useCallback(
    (key) => (e) => {
      const w = Math.ceil(e.nativeEvent.layout.width);
      setLabelWidths((prev) => (prev[key] === w ? prev : { ...prev, [key]: w }));
    },
    []
  );
  const measured = barWidth > 0 && routes.every((r) => labelWidths[r.key] != null);

  // Faol elementning kengligi = ichki chetlar + doira + oraliq + nom
  const activeWidthOf = (route) => PILL_PAD_L + ICON_CIRCLE + LABEL_GAP + (labelWidths[route.key] || 0) + PILL_PAD_R;
  const inner = Math.max(0, barWidth - BAR_PAD * 2);
  const activeW = measured ? activeWidthOf(routes[activeIndex]) : 0;
  const inactiveW = measured && count > 1 ? (inner - activeW) / (count - 1) : 0;

  // --- Animatsiya qiymatlari ---
  // progress[key]: 0 = nofaol, 1 = faol. Bir tab 0→1, ikkinchisi 1→0 bir xil spring bilan yuradi,
  // shuning uchun kengliklar yig'indisi doim o'zgarmaydi va hech narsa "sakramaydi".
  const progress = useRef({}).current;
  routes.forEach((r, i) => {
    if (!progress[r.key]) progress[r.key] = new Animated.Value(i === activeIndex ? 1 : 0);
  });
  // Oq kapsulaning chap koordinatasi va kengligi
  const pillX = useRef(new Animated.Value(0)).current;
  const pillW = useRef(new Animated.Value(0)).current;
  const pillOpacity = useRef(new Animated.Value(0)).current;
  const firstLayout = useRef(true);

  useEffect(() => {
    if (!measured) return;
    const targetX = activeIndex * inactiveW;
    const targetW = activeW;

    if (firstLayout.current) {
      // Birinchi renderda animatsiyasiz, darhol to'g'ri joyga qo'yamiz
      firstLayout.current = false;
      pillX.setValue(targetX);
      pillW.setValue(targetW);
      pillOpacity.setValue(1);
      routes.forEach((r, i) => progress[r.key].setValue(i === activeIndex ? 1 : 0));
      return;
    }

    Animated.parallel([
      Animated.spring(pillX, { ...SPRING, toValue: targetX }),
      Animated.spring(pillW, { ...SPRING, toValue: targetW }),
      ...routes.map((r, i) => Animated.spring(progress[r.key], { ...SPRING, toValue: i === activeIndex ? 1 : 0 })),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, measured, inactiveW, activeW]);

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {/* Nom kengliklarini o'lchash uchun ko'rinmas matnlar */}
      <View
        style={styles.measure}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {routes.map((r) => (
          <Text key={r.key} style={[styles.measureText, LABEL_FONT]} onLayout={onLabelLayout(r.key)} numberOfLines={1}>
            {labelOf(r)}
          </Text>
        ))}
      </View>

      <View style={[styles.bar, !measured && styles.hidden]} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
        {/* Sirg'aluvchi oq kapsula */}
        <Animated.View
          pointerEvents="none"
          style={[styles.pill, { opacity: pillOpacity, width: pillW, transform: [{ translateX: pillX }] }]}
        />

        {routes.map((route, i) => {
          const { options } = descriptors[route.key];
          const focused = i === activeIndex;
          const label = labelOf(route);
          const badge = options.tabBarBadge;
          const icon = TAB_ICONS[route.name] || 'ellipse';
          const p = progress[route.key];
          const thisActiveW = measured ? activeWidthOf(route) : 0;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TabItem
              key={route.key}
              label={label}
              badge={badge}
              icon={icon}
              focused={focused}
              progress={p}
              width={measured ? p.interpolate({ inputRange: [0, 1], outputRange: [inactiveW, thisActiveW] }) : undefined}
              inactiveW={inactiveW}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

function TabItem({ label, badge, icon, focused, progress, width, inactiveW, onPress }) {
  // Bosganda ikonka biroz "siqiladi"
  const press = useRef(new Animated.Value(1)).current;
  const pressTo = (v) => Animated.spring(press, { ...SPRING, damping: 14, toValue: v }).start();

  // Ikonka joylashuvi: nofaol holatda markazda, faolda chapdan PILL_PAD_L masofada
  const iconLeft = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.max(0, (inactiveW - ICON_CIRCLE) / 2), PILL_PAD_L],
  });
  const circleScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const outlineOpacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });
  const filledOpacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const filledScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1.35, 1] });
  const labelOpacity = progress.interpolate({ inputRange: [0, 0.55, 1], outputRange: [0, 0, 1] });
  const labelShift = progress.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] });
  const badgeBg = progress.interpolate({ inputRange: [0, 1], outputRange: [colors.primary, colors.danger] });
  const badgeBorder = progress.interpolate({ inputRange: [0, 1], outputRange: [colors.dark, colors.white] });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => pressTo(0.88)}
      onPressOut={() => pressTo(1)}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={`${label}${badge ? `, ${badge}` : ''}`}
      hitSlop={6}
    >
      <Animated.View style={[styles.item, width != null && { width }]}>
        {/* Ikonka: doira (faol) + ikki xil ikonka krossfeyd */}
        <Animated.View style={[styles.iconWrap, { left: iconLeft, transform: [{ scale: press }] }]}>
          <Animated.View style={[styles.circle, { opacity: progress, transform: [{ scale: circleScale }] }]} />
          <AnimatedIonicons
            name={`${icon}-outline`}
            size={22}
            color="rgba(255,255,255,0.72)"
            style={[styles.iconAbs, { opacity: outlineOpacity }]}
          />
          <AnimatedIonicons
            name={icon}
            size={16}
            color={colors.white}
            style={[styles.iconAbs, { opacity: filledOpacity, transform: [{ scale: filledScale }] }]}
          />
          {!!badge && (
            <Animated.View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
              <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Nom: faqat faol holatda ko'rinadi, chapdan sirg'alib kiradi */}
        <Animated.Text
          numberOfLines={1}
          style={[
            styles.label,
            LABEL_FONT,
            {
              left: PILL_PAD_L + ICON_CIRCLE + LABEL_GAP,
              opacity: labelOpacity,
              transform: [{ translateX: labelShift }],
            },
          ]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // O'lchash konteyneri: juda keng, oqimdagi (absolute emas) matnlar o'z tabiiy kengligini oladi.
  // Absolute matnlar webda 0 kenglik bilan o'lchanardi, shu sabab nom kesilib qolardi.
  measure: {
    position: 'absolute',
    opacity: 0,
    top: 0,
    left: 0,
    right: 0,
    height: 0,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  measureText: {
    alignSelf: 'flex-start',
    color: colors.dark,
  },
  bar: {
    height: BAR_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: colors.dark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: BAR_PAD,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: colors.dark, shadowOpacity: 0.25, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 10 },
      default: { boxShadow: '0 8px 24px rgba(20,24,36,0.28)' },
    }),
  },
  hidden: {
    opacity: 0,
  },
  pill: {
    position: 'absolute',
    left: BAR_PAD,
    top: (BAR_HEIGHT - PILL_HEIGHT) / 2,
    height: PILL_HEIGHT,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  item: {
    height: PILL_HEIGHT,
    borderRadius: radius.pill,
    overflow: 'hidden',
    justifyContent: 'center',
    minWidth: 40,
  },
  iconWrap: {
    position: 'absolute',
    width: ICON_CIRCLE,
    height: ICON_CIRCLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: ICON_CIRCLE / 2,
    backgroundColor: colors.primary,
  },
  iconAbs: {
    position: 'absolute',
  },
  label: {
    position: 'absolute',
    color: colors.dark,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -9,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: '800',
    color: colors.white,
  },
});
