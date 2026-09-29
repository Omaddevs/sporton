import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Easing, Image, Pressable, StyleSheet, Vibration, View } from 'react-native';
import Text from '../components/AppText';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, EmptyState } from '../components/ui';
import { colors, radius } from '../theme';
import { useApp } from '../context/AppContext';
import { getWorkout } from '../data/workouts';
import { formatSeconds } from '../utils/format';
import { ICONS } from '../data/icons';

const READY_SECONDS = 5;
const TICKS = 48;
const RING = 250;

const buildSteps = (w) => {
  const steps = [{ kind: 'ready', duration: READY_SECONDS, ex: w.exercises[0], index: 0 }];
  w.exercises.forEach((ex, i) => {
    steps.push({ kind: 'work', duration: ex.duration, ex, index: i });
    const next = w.exercises[i + 1];
    if (next && ex.rest > 0) steps.push({ kind: 'rest', duration: ex.rest, ex: next, index: i + 1 });
  });
  return steps;
};

export default function WorkoutPlayerScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const workout = getWorkout(route.params?.id);
  const { completeWorkout } = useApp();

  const steps = useMemo(() => (workout ? buildSteps(workout) : []), [workout]);
  const [stepIdx, setStepIdx] = useState(0);
  const [remaining, setRemaining] = useState(steps[0]?.duration ?? 0);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const pulse = useRef(new Animated.Value(1)).current;

  const step = steps[stepIdx];

  // Taymer
  useEffect(() => {
    if (!running || finished) return undefined;
    const id = setInterval(() => {
      setRemaining((r) => r - 1);
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running, finished]);

  // Qadam tugaganda keyingisiga o'tish
  useEffect(() => {
    if (remaining > 0 || finished) return;
    goTo(stepIdx + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  // Ikonka "nafas olishi" animatsiyasi
  useEffect(() => {
    if (!running || step?.kind !== 'work') {
      pulse.setValue(1);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [running, step?.kind, pulse]);

  if (!workout) return <EmptyState title="Mashg'ulot topilmadi" actionLabel="Orqaga" onAction={() => navigation.goBack()} />;

  function goTo(idx) {
    if (idx >= steps.length) {
      setFinished(true);
      setRunning(false);
      Vibration.vibrate([0, 300, 150, 300]);
      return;
    }
    const target = Math.max(0, idx);
    setStepIdx(target);
    setRemaining(steps[target].duration);
    Vibration.vibrate(200);
  }

  const skipExercise = (dir) => {
    // Oldingi/keyingi "work" qadamiga o'tish
    let i = stepIdx + dir;
    while (i > 0 && i < steps.length && steps[i].kind !== 'work') i += dir;
    goTo(i);
  };

  const exit = () => {
    if (finished) return navigation.goBack();
    setRunning(false);
    Alert.alert('Mashg\'ulotni to\'xtatasizmi?', 'Natija saqlanmaydi.', [
      { text: 'Davom etish', onPress: () => setRunning(true) },
      { text: 'Chiqish', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  const save = () => {
    completeWorkout({
      id: `c-${Date.now()}`,
      workoutId: workout.id,
      title: workout.title,
      minutes: Math.max(1, Math.round(elapsed / 60)),
      calories: workout.calories,
      date: new Date().toISOString(),
    });
    navigation.goBack();
  };

  /* ------------ Yakun ekrani ------------ */
  if (finished) {
    return (
      <LinearGradient colors={[colors.primaryLight, colors.primary, '#0056C2']} style={[styles.fill, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
        {ICONS.trophy ? (
          <Image source={ICONS.trophy} style={{ width: 170, height: 170, alignSelf: 'center' }} resizeMode="contain" />
        ) : (
          <View style={styles.finishIcon}>
            <Ionicons name="trophy" size={64} color={colors.primary} />
          </View>
        )}
        <Text style={styles.finishTitle}>Ajoyib natija!</Text>
        <Text style={styles.finishSub}>«{workout.title}» mashg'ulotini muvaffaqiyatli yakunladingiz</Text>
        <View style={styles.finishStats}>
          <FinishStat value={formatSeconds(elapsed)} label="Vaqt" />
          <FinishStat value={workout.calories} label="Kkal" />
          <FinishStat value={workout.exercisesCount} label="Mashq" />
        </View>
        <View style={{ flex: 1 }} />
        <Button title="Natijani saqlash" variant="dark" icon="checkmark-circle" onPress={save} style={{ marginHorizontal: 20 }} />
      </LinearGradient>
    );
  }

  const isRest = step.kind === 'rest';
  const isReady = step.kind === 'ready';
  const progress = 1 - remaining / step.duration;
  const totalWork = steps.length - 1;
  const overall = Math.min(1, stepIdx / totalWork);
  const nextWork = steps.slice(stepIdx + 1).find((s) => s.kind === 'work');
  const accent = isRest ? colors.blue : isReady ? colors.warning : colors.primary;
  const headline = isReady ? 'Tayyorlaning!' : isRest ? 'Dam oling' : step.ex.name;

  return (
    <View style={[styles.fill, { backgroundColor: colors.dark, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      {/* Yuqori panel */}
      <View style={styles.top}>
        <Pressable onPress={exit} style={styles.topBtn} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.white} />
        </Pressable>
        <View style={{ flex: 1, marginHorizontal: 14 }}>
          <Text style={styles.topTitle} numberOfLines={1}>
            {workout.title}
          </Text>
          <View style={styles.overallTrack}>
            <View style={[styles.overallFill, { width: `${overall * 100}%` }]} />
          </View>
        </View>
        <Text style={styles.topCounter}>
          {Math.min(step.index + 1, workout.exercisesCount)}/{workout.exercisesCount}
        </Text>
      </View>

      {/* Holat */}
      <View style={{ alignItems: 'center', marginTop: 24 }}>
        <View style={[styles.phase, { backgroundColor: `${accent}33` }]}>
          <Text style={[styles.phaseText, { color: accent }]}>{isReady ? 'BOSHLANMOQDA' : isRest ? 'DAM OLISH' : 'MASHQ'}</Text>
        </View>
        <Text style={styles.headline} numberOfLines={2}>
          {headline}
        </Text>
        {!isRest && !isReady && step.ex.reps ? <Text style={styles.reps}>Maqsad: {step.ex.reps} marta</Text> : null}
        {(isRest || isReady) && <Text style={styles.reps}>Keyingisi: {step.ex.name}</Text>}
      </View>

      {/* Taymer halqasi */}
      <View style={styles.ringWrap}>
        {Array.from({ length: TICKS }).map((_, i) => {
          const active = i / TICKS < progress;
          return (
            <View
              key={i}
              style={[
                styles.tick,
                {
                  backgroundColor: active ? accent : 'rgba(255,255,255,0.12)',
                  transform: [{ rotate: `${(360 / TICKS) * i}deg` }, { translateY: -RING / 2 + 8 }],
                },
              ]}
            />
          );
        })}
        <Animated.View style={[styles.ringInner, { transform: [{ scale: pulse }] }]}>
          <MaterialCommunityIcons name={isRest ? 'meditation' : step.ex.icon} size={54} color={accent} />
          <Text style={styles.time}>{formatSeconds(Math.max(0, remaining))}</Text>
          {!running && <Text style={styles.paused}>PAUZA</Text>}
        </Animated.View>
      </View>

      {/* Maslahat */}
      <View style={styles.tip}>
        <Ionicons name="bulb-outline" size={18} color={colors.warning} />
        <Text style={styles.tipText}>{isRest ? 'Chuqur nafas oling va suv iching.' : step.ex.tip}</Text>
      </View>

      <View style={{ flex: 1 }} />

      {/* Keyingi mashq */}
      {nextWork && !isReady && (
        <View style={styles.next}>
          <View style={styles.nextIcon}>
            <MaterialCommunityIcons name={nextWork.ex.icon} size={22} color={colors.white} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.nextLabel}>Keyingi mashq</Text>
            <Text style={styles.nextName} numberOfLines={1}>
              {nextWork.ex.name}
            </Text>
          </View>
          <Text style={styles.nextLabel}>{nextWork.duration} s</Text>
        </View>
      )}

      {/* Boshqaruv */}
      <View style={styles.controls}>
        <Pressable onPress={() => skipExercise(-1)} style={styles.ctrl} hitSlop={8}>
          <Ionicons name="play-skip-back" size={24} color={colors.white} />
        </Pressable>
        <Pressable onPress={() => setRunning((r) => !r)} style={[styles.play, { backgroundColor: accent }]}>
          <Ionicons name={running ? 'pause' : 'play'} size={34} color={colors.white} style={!running && { marginLeft: 4 }} />
        </Pressable>
        <Pressable onPress={() => (isRest || isReady ? goTo(stepIdx + 1) : skipExercise(1))} style={styles.ctrl} hitSlop={8}>
          <Ionicons name="play-skip-forward" size={24} color={colors.white} />
        </Pressable>
      </View>
      {(isRest || isReady) && (
        <Pressable onPress={() => setRemaining((r) => r + 15)} style={styles.addTime}>
          <Text style={styles.addTimeText}>+15 soniya</Text>
        </Pressable>
      )}
    </View>
  );
}

function FinishStat({ value, label }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: colors.white, fontSize: 26, fontWeight: '900' }}>{value}</Text>
      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { color: colors.white, fontWeight: '700', fontSize: 14 },
  overallTrack: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 8, overflow: 'hidden' },
  overallFill: { height: 5, borderRadius: 3, backgroundColor: colors.primary },
  topCounter: { color: colors.white, fontWeight: '800', fontSize: 15 },
  phase: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.pill },
  phaseText: { fontWeight: '900', fontSize: 12, letterSpacing: 1.5 },
  headline: { color: colors.white, fontSize: 26, fontWeight: '900', marginTop: 12, textAlign: 'center', paddingHorizontal: 24 },
  reps: { color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: '600', marginTop: 6 },
  ringWrap: { width: RING, height: RING, alignSelf: 'center', marginTop: 24, alignItems: 'center', justifyContent: 'center' },
  tick: { position: 'absolute', width: 4, height: 16, borderRadius: 2 },
  ringInner: {
    width: RING - 60,
    height: RING - 60,
    borderRadius: (RING - 60) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: { color: colors.white, fontSize: 46, fontWeight: '900', marginTop: 6, fontVariant: ['tabular-nums'] },
  paused: { color: colors.warning, fontWeight: '800', fontSize: 12, letterSpacing: 2 },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 14,
    borderRadius: radius.md,
  },
  tipText: { color: 'rgba(255,255,255,0.85)', marginLeft: 10, flex: 1, fontSize: 13, lineHeight: 19 },
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 18,
  },
  nextIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: '600' },
  nextName: { color: colors.white, fontSize: 15, fontWeight: '700', marginTop: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 36 },
  ctrl: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  play: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center' },
  addTime: { alignSelf: 'center', marginTop: 14, paddingHorizontal: 16, paddingVertical: 6 },
  addTimeText: { color: colors.blue, fontWeight: '800' },
  finishIcon: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.white,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishTitle: { color: colors.white, fontSize: 32, fontWeight: '900', textAlign: 'center', marginTop: 24 },
  finishSub: { color: 'rgba(255,255,255,0.9)', fontSize: 15, textAlign: 'center', marginTop: 8, paddingHorizontal: 32, lineHeight: 21 },
  finishStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 20,
    marginTop: 32,
    borderRadius: radius.lg,
    paddingVertical: 18,
  },
});
