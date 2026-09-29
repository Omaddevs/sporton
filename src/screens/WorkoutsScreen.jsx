import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text, { TextInput } from '../components/AppText';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Chip, ChipRow, EmptyState, ScreenHeader, Segmented } from '../components/ui';
import { WorkoutCard, WorkoutListItem } from '../components/cards';
import { colors, gradients, radius, shadow, type } from '../theme';
import { useApp } from '../context/AppContext';
import { useLayout } from '../hooks/useLayout';
import { WORKOUTS, WORKOUT_CATEGORIES } from '../data/workouts';
import { WEEKDAYS_SHORT, addDays, toDateKey } from '../utils/format';

const WEEKLY_GOAL = 3;

const LEVELS = [
  { value: 'all', label: 'Hammasi' },
  { value: "Boshlang'ich", label: "Boshlang'ich" },
  { value: "O'rta", label: "O'rta" },
  { value: 'Yuqori', label: 'Yuqori' },
];

export default function WorkoutsScreen({ navigation }) {
  const { completedWorkouts } = useApp();
  const { isDesktop, contentWidth, colWidth } = useLayout();
  const [cat, setCat] = useState('Hammasi');
  const [level, setLevel] = useState('all');
  const [query, setQuery] = useState('');

  const open = (id) => navigation.navigate('WorkoutDetail', { id });
  const start = (id) => navigation.navigate('WorkoutPlayer', { id });

  // Haftalik statistika + oxirgi 7 kun faolligi + ketma-ket kunlar (streak)
  const week = useMemo(() => {
    const since = Date.now() - 7 * 864e5;
    const list = completedWorkouts.filter((c) => new Date(c.date).getTime() > since);
    const doneDays = new Set(completedWorkouts.map((c) => toDateKey(new Date(c.date))));
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i - 6);
      return { key: toDateKey(d), label: WEEKDAYS_SHORT[d.getDay()], done: doneDays.has(toDateKey(d)), today: i === 6 };
    });
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const k = toDateKey(addDays(today, -i));
      if (doneDays.has(k)) streak++;
      else if (i > 0) break; // bugun hali bajarilmagan bo'lsa ham streak uzilmaydi
    }
    return {
      count: list.length,
      minutes: list.reduce((s, c) => s + c.minutes, 0),
      calories: list.reduce((s, c) => s + c.calories, 0),
      days,
      streak,
    };
  }, [completedWorkouts]);

  const counts = useMemo(
    () => WORKOUT_CATEGORIES.reduce((acc, c) => ({ ...acc, [c]: c === 'Hammasi' ? WORKOUTS.length : WORKOUTS.filter((w) => w.category === c).length }), {}),
    []
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WORKOUTS.filter((w) => cat === 'Hammasi' || w.category === cat)
      .filter((w) => level === 'all' || w.level === level)
      .filter((w) => !q || `${w.title} ${w.coach} ${w.category}`.toLowerCase().includes(q));
  }, [cat, level, query]);

  const featured = WORKOUTS.filter((w) => w.featured);
  const last = completedWorkouts[0] && WORKOUTS.find((w) => w.id === completedWorkouts[0].workoutId);
  const filtering = cat !== 'Hammasi' || level !== 'all' || !!query;
  const goalPct = Math.min(1, week.count / WEEKLY_GOAL);

  const container = isDesktop ? { width: contentWidth, alignSelf: 'center' } : null;
  const pad = isDesktop ? 0 : 16;
  const cols = isDesktop ? (contentWidth >= 1100 ? 3 : 2) : 1;

  const reset = () => {
    setCat('Hammasi');
    setLevel('all');
    setQuery('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={container}>
        <ScreenHeader title="Uyda mashg'ulot" subtitle="Ko'ring, takrorlang, natijaga erishing" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[{ paddingBottom: 32 }, container]} keyboardShouldPersistTaps="handled">
        {/* ---------- Haftalik natija ---------- */}
        <LinearGradient colors={gradients.dark} style={[styles.stats, { marginHorizontal: pad }]}>
          <View style={styles.statsHead}>
            <View style={{ flex: 1 }}>
              <Text style={styles.statsTitle}>Bu haftadagi natijangiz</Text>
              <Text style={styles.statsSub}>
                Maqsad: haftasiga {WEEKLY_GOAL} ta · {week.count >= WEEKLY_GOAL ? 'bajarildi 🎉' : `yana ${WEEKLY_GOAL - week.count} ta`}
              </Text>
            </View>
            <View style={styles.streak}>
              <Ionicons name="flame" size={16} color={colors.primary} />
              <Text style={styles.streakText}>{week.streak}</Text>
              <Text style={styles.streakLabel}>kun</Text>
            </View>
          </View>

          <View style={styles.goalTrack}>
            <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.goalFill, { width: `${Math.max(goalPct * 100, 3)}%` }]} />
          </View>

          <View style={styles.days}>
            {week.days.map((d) => (
              <View key={d.key} style={styles.day}>
                <View style={[styles.dayDot, d.done && styles.dayDone, d.today && !d.done && styles.dayToday]}>
                  {d.done && <Ionicons name="checkmark" size={13} color={colors.white} />}
                </View>
                <Text style={[styles.dayLabel, d.today && { color: colors.white }]}>{d.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.statRow}>
            <Stat value={week.count} label="Mashg'ulot" icon="barbell-outline" />
            <View style={styles.statDiv} />
            <Stat value={week.minutes} label="Daqiqa" icon="time-outline" />
            <View style={styles.statDiv} />
            <Stat value={week.calories} label="Kkal" icon="flame-outline" />
          </View>
        </LinearGradient>

        {/* ---------- Davom ettirish ---------- */}
        {last && !filtering && (
          <Pressable onPress={() => open(last.id)} style={({ pressed }) => [styles.resume, { marginHorizontal: pad }, pressed && { opacity: 0.85 }]}>
            <View style={styles.resumeIcon}>
              <Ionicons name="refresh" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={type.small}>Oxirgi mashg'ulot</Text>
              <Text style={type.label} numberOfLines={1}>
                {last.title}
              </Text>
            </View>
            <Pressable onPress={() => start(last.id)} style={styles.resumeBtn} hitSlop={6}>
              <Ionicons name="play" size={13} color={colors.white} />
              <Text style={styles.resumeBtnText}>Qayta</Text>
            </Pressable>
          </Pressable>
        )}

        {/* ---------- Qidiruv ---------- */}
        <View style={[styles.searchBox, { marginHorizontal: pad }]}>
          <Ionicons name="search" size={18} color={colors.textLight} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Mashg'ulot yoki murabbiy"
            placeholderTextColor={colors.textLight}
            style={styles.input}
            accessibilityLabel="Mashg'ulot qidirish"
          />
          {!!query && (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Tozalash">
              <Ionicons name="close-circle" size={18} color={colors.textLight} />
            </Pressable>
          )}
        </View>

        {/* ---------- Toifa va daraja ---------- */}
        <ChipRow style={[{ paddingVertical: 4 }, isDesktop && { paddingHorizontal: 0 }]}>
          {WORKOUT_CATEGORIES.map((c) => (
            <Chip key={c} label={c} count={counts[c]} active={cat === c} onPress={() => setCat(c)} />
          ))}
        </ChipRow>
        <Segmented options={LEVELS} value={level} onChange={setLevel} style={{ marginHorizontal: pad, marginTop: 10 }} />

        {/* ---------- Kun mashg'ulotlari (karusel) ---------- */}
        {!filtering && featured.length > 0 && (
          <>
            <SectionTitle title="🔥 Kun mashg'ulotlari" hint={`${featured.length} ta`} pad={pad} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={isDesktop ? undefined : 292}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: pad, gap: 12, paddingBottom: 6 }}
            >
              {featured.map((w) => (
                <WorkoutCard key={w.id} workout={w} width={isDesktop ? colWidth(2) : 280} onPress={() => open(w.id)} />
              ))}
            </ScrollView>
          </>
        )}

        {/* ---------- Barcha dasturlar ---------- */}
        <SectionTitle
          title={filtering ? 'Natijalar' : 'Barcha dasturlar'}
          hint={`${list.length} ta`}
          pad={pad}
          action={filtering ? { label: 'Tozalash', onPress: reset } : null}
        />
        {list.length ? (
          <View style={[styles.grid, { paddingHorizontal: pad, gap: cols > 1 ? 16 : 12 }]}>
            {list.map((w) => (
              <WorkoutListItem
                key={w.id}
                workout={w}
                onPress={() => open(w.id)}
                onStart={() => start(w.id)}
                style={cols > 1 ? { width: colWidth(cols, 16) } : { width: '100%' }}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="Mashg'ulot topilmadi" text="Boshqa toifa yoki darajani tanlab ko'ring" actionLabel="Filtrlarni tozalash" onAction={reset} />
        )}
      </ScrollView>
    </View>
  );
}

function SectionTitle({ title, hint, pad, action }) {
  return (
    <View style={[styles.section, { paddingHorizontal: pad }]}>
      <Text style={styles.label}>{title}</Text>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8}>
          <Text style={styles.link}>{action.label}</Text>
        </Pressable>
      ) : (
        !!hint && <Text style={type.small}>{hint}</Text>
      )}
    </View>
  );
}

function Stat({ value, label, icon }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color="rgba(255,255,255,0.55)" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: { borderRadius: radius.xl, padding: 16 },
  statsHead: { flexDirection: 'row', alignItems: 'center' },
  statsTitle: { color: colors.white, fontWeight: '800', fontSize: 15 },
  statsSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '500', marginTop: 3 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,120,255,0.15)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  streakText: { color: colors.white, fontWeight: '900', fontSize: 15, marginLeft: 4 },
  streakLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600', marginLeft: 3 },
  goalTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 14, overflow: 'hidden' },
  goalFill: { height: 8, borderRadius: 4 },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  day: { alignItems: 'center', flex: 1 },
  dayDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDone: { backgroundColor: colors.primary },
  dayToday: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: 'transparent' },
  dayLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700', marginTop: 5 },
  statRow: { flexDirection: 'row', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  stat: { flex: 1, alignItems: 'center' },
  statDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  statValue: { color: colors.white, fontSize: 22, fontWeight: '900', marginTop: 4 },
  statLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '600' },

  resume: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.lg, padding: 12, marginTop: 12, ...shadow },
  resumeIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  resumeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 12, height: 32, gap: 4 },
  resumeBtnText: { color: colors.white, fontWeight: '700', fontSize: 12 },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 46,
    marginTop: 16,
    marginBottom: 12,
    ...shadow,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: colors.text, height: '100%' },

  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 12 },
  label: { fontSize: 17, fontWeight: '800', color: colors.text },
  link: { fontSize: 13, fontWeight: '700', color: colors.blue },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
