import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, ScrollView, Share, StyleSheet, View, useWindowDimensions } from 'react-native';
import Text from '../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SmartImage from '../components/SmartImage';
import { BackButton, Badge, Button, EmptyState, IconButton, useSafeBack } from '../components/ui';
import { WorkoutCard } from '../components/cards';
import { colors, radius, shadow, type } from '../theme';
import { useApp } from '../context/AppContext';
import { useLayout } from '../hooks/useLayout';
import { getWorkout, levelInfo, similarWorkouts, workoutTiming } from '../data/workouts';
import { formatDate, formatSeconds } from '../utils/format';

const NATIVE_DRIVER = Platform.OS !== 'web';
const HISTORY_LIMIT = 3;

export default function WorkoutDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const { isDesktop, contentWidth } = useLayout();
  const workout = getWorkout(route.params?.id);
  const { completedWorkouts } = useApp();
  const goBack = useSafeBack({ name: 'Tabs', params: { screen: 'Workouts' } });

  const W = isDesktop ? Math.min(contentWidth, 880) : winW;
  const HERO_H = isDesktop ? 400 : 360;
  const HEADER_H = insets.top + 58;

  const [openIdx, setOpenIdx] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      const next = value > HERO_H - 100;
      setCollapsed((c) => (c === next ? c : next));
    });
    return () => scrollY.removeListener(id);
  }, [scrollY, HERO_H]);

  const similar = useMemo(() => (workout ? similarWorkouts(workout) : []), [workout]);

  if (!workout) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <EmptyState icon="barbell-outline" title="Mashg'ulot topilmadi" actionLabel="Orqaga" onAction={goBack} />
      </View>
    );
  }

  const history = completedWorkouts.filter((c) => c.workoutId === workout.id);
  const lvl = levelInfo(workout.level);
  const timing = workoutTiming(workout);
  const workPct = timing.total ? (timing.work / timing.total) * 100 : 0;
  const start = () => navigation.navigate('WorkoutPlayer', { id: workout.id });

  // Har bir mashq qachon boshlanishi (vaqt shkalasi uchun)
  let acc = 0;
  const startsAt = workout.exercises.map((e) => {
    const s = acc;
    acc += e.duration + e.rest;
    return s;
  });

  const headerOpacity = scrollY.interpolate({ inputRange: [HERO_H - 160, HERO_H - 80], outputRange: [0, 1], extrapolate: 'clamp' });
  const heroBtnOpacity = scrollY.interpolate({ inputRange: [HERO_H - 160, HERO_H - 100], outputRange: [1, 0], extrapolate: 'clamp' });
  const heroScale = scrollY.interpolate({ inputRange: [-240, 0], outputRange: [1.6, 1], extrapolateRight: 'clamp' });
  const heroShift = scrollY.interpolate({ inputRange: [-240, 0, HERO_H], outputRange: [-120, 0, HERO_H * 0.35] });

  const share = async () => {
    try {
      await Share.share({ message: `«${workout.title}» — ${workout.minutes} daqiqa, ${workout.calories} kkal. SportON ilovasida birga mashq qilamiz!` });
    } catch {
      /* bekor qilingan */
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: NATIVE_DRIVER })}
      >
        <View style={{ width: W, alignSelf: 'center' }}>
          {/* ---------- Hero ---------- */}
          <View style={{ height: HERO_H, overflow: 'hidden', borderBottomLeftRadius: isDesktop ? radius.xl : 0, borderBottomRightRadius: isDesktop ? radius.xl : 0 }}>
            <Animated.View style={{ height: HERO_H, transform: [{ translateY: heroShift }, { scale: heroScale }] }}>
              <SmartImage uri={workout.image} style={{ width: W, height: HERO_H }} icon="dumbbell" iconSize={64} fade />
            </Animated.View>
            <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent']} style={[styles.topFade, { height: HEADER_H + 30 }]} pointerEvents="none" />

            <View style={styles.heroBottom}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Badge label={workout.category} />
                <Badge label={workout.equipment} icon="cube-outline" bg="rgba(255,255,255,0.92)" color={colors.text} />
                {history.length > 0 && <Badge label={`${history.length}× bajarilgan`} icon="checkmark" color={colors.success} />}
              </View>
              <Text style={styles.title}>{workout.title}</Text>
              <View style={styles.coachRow}>
                <View style={styles.coachAvatar}>
                  <Text style={styles.coachInitial}>{workout.coach[0]}</Text>
                </View>
                <Text style={styles.coach}>Murabbiy: {workout.coach}</Text>
              </View>
            </View>
          </View>

          {/* ---------- Statistika ---------- */}
          <View style={styles.statsRow}>
            <Stat icon="time-outline" value={`${workout.minutes}`} label="daqiqa" />
            <View style={styles.statDiv} />
            <Stat icon="flame-outline" value={`${workout.calories}`} label="kkal" />
            <View style={styles.statDiv} />
            <Stat icon="list-outline" value={`${workout.exercisesCount}`} label="mashq" />
            <View style={styles.statDiv} />
            <View style={styles.stat}>
              <View style={styles.lvlBars}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={[styles.lvlBar, { height: 5 + i * 4, backgroundColor: i <= lvl.n ? lvl.color : colors.border }]} />
                ))}
              </View>
              <Text style={styles.statValue} numberOfLines={1}>
                {workout.level}
              </Text>
              <Text style={type.small}>daraja</Text>
            </View>
          </View>

          {/* ---------- Tavsif ---------- */}
          <Text style={[type.body, styles.desc]}>{workout.description}</Text>

          {/* ---------- Tuzilma ---------- */}
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={type.h3}>Mashg'ulot tuzilmasi</Text>
              <Text style={type.small}>{formatSeconds(timing.total)}</Text>
            </View>
            <View style={styles.split}>
              <View style={[styles.splitWork, { width: `${workPct}%` }]} />
              <View style={styles.splitRest} />
            </View>
            <View style={styles.legend}>
              <Legend color={colors.primary} label="Mashq" value={formatSeconds(timing.work)} />
              <Legend color={colors.blue} label="Dam olish" value={formatSeconds(timing.rest)} />
              <Legend color={colors.textLight} label="Jihoz" value={workout.equipment} icon />
            </View>
          </View>

          {/* ---------- Tarix ---------- */}
          {history.length > 0 && (
            <View style={styles.done}>
              <View style={styles.doneIcon}>
                <Ionicons name="trophy" size={18} color={colors.success} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[type.label, { color: colors.success }]}>{history.length} marta bajargansiz</Text>
                <Text style={type.small} numberOfLines={1}>
                  {history
                    .slice(0, HISTORY_LIMIT)
                    .map((h) => `${formatDate(h.date)} · ${h.minutes} daq`)
                    .join('   ')}
                </Text>
              </View>
            </View>
          )}

          {/* ---------- Mashqlar ---------- */}
          <View style={styles.sectionTitle}>
            <Text style={type.h2}>Mashqlar ro'yxati</Text>
            <Text style={type.small}>Batafsil uchun bosing</Text>
          </View>
          <View style={{ paddingHorizontal: 16 }}>
            {workout.exercises.map((e, i) => {
              const opened = openIdx === i;
              const lastItem = i === workout.exercises.length - 1;
              return (
                <View key={i} style={{ flexDirection: 'row' }}>
                  {/* Vaqt shkalasi */}
                  <View style={styles.rail}>
                    <View style={[styles.railDot, opened && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                      <Text style={[styles.railNum, opened && { color: colors.white }]}>{i + 1}</Text>
                    </View>
                    {!lastItem && <View style={styles.railLine} />}
                  </View>

                  <Pressable
                    onPress={() => setOpenIdx(opened ? null : i)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: opened }}
                    style={({ pressed }) => [styles.ex, opened && styles.exOpen, pressed && { opacity: 0.9 }]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={styles.exIcon}>
                        <MaterialCommunityIcons name={e.icon} size={24} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={type.label} numberOfLines={opened ? undefined : 1}>
                          {e.name}
                        </Text>
                        <Text style={type.small}>
                          {e.reps ? `${e.reps} marta · ` : ''}
                          {formatSeconds(startsAt[i])} dan
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                        <Text style={styles.exTime}>{e.duration} s</Text>
                        {e.rest ? <Text style={styles.exRest}>+{e.rest}s dam</Text> : <Text style={styles.exRest}>yakun</Text>}
                      </View>
                      <Ionicons name={opened ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textLight} style={{ marginLeft: 8 }} />
                    </View>
                    {opened && (
                      <View style={styles.tip}>
                        <Ionicons name="bulb-outline" size={16} color={colors.warning} />
                        <Text style={[type.small, { flex: 1, marginLeft: 8, color: colors.text, lineHeight: 18 }]}>{e.tip}</Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>

          {/* ---------- Maslahat ---------- */}
          <View style={styles.note}>
            <Ionicons name="information-circle-outline" size={20} color={colors.blue} />
            <Text style={[type.small, { flex: 1, marginLeft: 10, color: colors.text, lineHeight: 18 }]}>
              Boshlashdan oldin 3–5 daqiqa qizib oling va suv ichib turing. Og'riq sezsangiz — to'xtang.
            </Text>
          </View>

          {/* ---------- O'xshash ---------- */}
          {similar.length > 0 && (
            <>
              <View style={styles.sectionTitle}>
                <Text style={type.h2}>Boshqa mashg'ulotlar</Text>
                <Text style={type.small}>{workout.category}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 8 }}>
                {similar.map((w) => (
                  <WorkoutCard key={w.id} workout={w} width={250} onPress={() => navigation.push('WorkoutDetail', { id: w.id })} />
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </Animated.ScrollView>

      {/* ---------- Hero tugmalari ---------- */}
      <Animated.View style={[styles.heroBar, { top: insets.top + 8, width: W, alignSelf: 'center', opacity: heroBtnOpacity, pointerEvents: collapsed ? 'none' : 'auto' }]}>
        <BackButton onPress={goBack} bg="rgba(255,255,255,0.94)" />
        <IconButton name="share-social-outline" label="Ulashish" bg="rgba(255,255,255,0.94)" onPress={share} style={shadow} />
      </Animated.View>

      {/* ---------- Yig'iluvchi sarlavha ---------- */}
      <Animated.View style={[styles.header, { height: HEADER_H, paddingTop: insets.top + 8, opacity: headerOpacity, pointerEvents: collapsed ? 'auto' : 'none' }]}>
        <View style={[styles.headerInner, { width: W }]}>
          <BackButton onPress={goBack} bg={colors.surface} style={{ boxShadow: 'none', shadowOpacity: 0, elevation: 0 }} />
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={[type.h3, { fontSize: 15 }]} numberOfLines={1}>
              {workout.title}
            </Text>
            <Text style={type.small} numberOfLines={1}>
              {workout.minutes} daq · {workout.calories} kkal · {workout.level}
            </Text>
          </View>
          <IconButton name="share-social-outline" label="Ulashish" bg={colors.surface} onPress={share} />
        </View>
      </Animated.View>

      {/* ---------- Pastki panel ---------- */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <View style={[styles.bottomInner, { width: W }]}>
          <View>
            <Text style={type.small}>Davomiyligi</Text>
            <Text style={styles.bottomValue}>
              {workout.minutes} daq
              <Text style={type.small}> · {workout.exercisesCount} mashq</Text>
            </Text>
          </View>
          <Button
            title={history.length ? 'Yana boshlash' : 'Boshlash'}
            icon="play"
            onPress={start}
            style={{ flex: 1, marginLeft: 16, maxWidth: 360 }}
          />
        </View>
      </View>
    </View>
  );
}

function Stat({ icon, value, label }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={type.small}>{label}</Text>
    </View>
  );
}

function Legend({ color, label, value, icon }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon ? <Ionicons name="cube-outline" size={11} color={color} /> : <View style={[styles.legendDot, { backgroundColor: color }]} />}
        <Text style={[type.small, { marginLeft: 5, fontSize: 11 }]}>{label}</Text>
      </View>
      <Text style={[type.label, { marginTop: 2 }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topFade: { position: 'absolute', left: 0, right: 0, top: 0 },
  heroBar: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between' },
  heroBottom: { position: 'absolute', left: 16, right: 16, bottom: 48 },
  title: { color: colors.white, fontSize: 26, fontWeight: '900', marginTop: 10, letterSpacing: -0.3 },
  coachRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  coachAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  coachInitial: { color: colors.white, fontSize: 11, fontWeight: '800' },
  coach: { color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: '600', marginLeft: 8 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: radius.lg,
    paddingVertical: 14,
    ...shadow,
  },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: 2 },
  statDiv: { width: 1, backgroundColor: colors.border, marginVertical: 4 },
  statValue: { fontSize: 15, fontWeight: '900', color: colors.text, marginTop: 4 },
  lvlBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 18 },
  lvlBar: { width: 5, borderRadius: 2 },

  desc: { paddingHorizontal: 16, marginTop: 18, color: colors.textMuted },

  card: { backgroundColor: colors.white, marginHorizontal: 16, marginTop: 16, borderRadius: radius.lg, padding: 16, ...shadow },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  split: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginTop: 12, backgroundColor: colors.border },
  splitWork: { backgroundColor: colors.primary },
  splitRest: { flex: 1, backgroundColor: colors.blue, opacity: 0.8 },
  legend: { flexDirection: 'row', marginTop: 12 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },

  done: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.successSoft, marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: radius.md },
  doneIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },

  sectionTitle: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 24, marginBottom: 12 },
  rail: { width: 30, alignItems: 'center' },
  railDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  railNum: { fontSize: 11, fontWeight: '800', color: colors.textMuted },
  railLine: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 2 },
  ex: { flex: 1, backgroundColor: colors.white, padding: 12, borderRadius: radius.md, marginLeft: 8, marginBottom: 10, ...shadow },
  exOpen: { borderWidth: 1, borderColor: colors.primarySoft },
  exIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  exTime: { fontSize: 15, fontWeight: '800', color: colors.text },
  exRest: { fontSize: 11, color: colors.blue, fontWeight: '600', marginTop: 1 },
  tip: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF8E6', borderRadius: radius.sm, padding: 10, marginTop: 10 },

  note: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.blueSoft, marginHorizontal: 16, marginTop: 6, padding: 12, borderRadius: radius.md },

  header: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
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
  bottomValue: { fontSize: 18, fontWeight: '900', color: colors.text },
});
