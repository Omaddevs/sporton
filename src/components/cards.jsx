import React from 'react';
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import Text from './AppText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SmartImage from './SmartImage';
import { Badge, Rating } from './ui';
import { colors, radius, shadow, type } from '../theme';
import { useApp } from '../context/AppContext';
import { hoverLift, webTransition } from '../hooks/useLayout';
import { getSport } from '../data/sports';
import { isOpenNow, minPrice } from '../data/venues';
import { levelInfo } from '../data/workouts';
import { formatDate, formatPrice, formatTime, MONTHS_SHORT, timeAgo } from '../utils/format';

/* ---------------- Category (bosh sahifa) ---------------- */
// tone="soft" — mobil ekrandagi och kulrang kartalar; imageSize — desktop'da kattaroq ikonka.
export function CategoryCard({ title, subtitle, icon, image, colorsFrom, badge, badgeColor, onPress, wide, tone = 'card', imageSize, style }) {
  const img = imageSize || (wide ? 92 : 82);
  const badgeProps = { label: badge, color: badgeColor, icon: badgeColor === colors.blue ? 'flame' : undefined };
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.cat,
        tone === 'soft' && styles.catSoft,
        wide && { flexDirection: 'row' },
        webTransition,
        hovered && hoverLift,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={wide ? { flex: 1, justifyContent: 'space-between', zIndex: 1 } : { zIndex: 1 }}>
        <Text style={styles.catTitle} numberOfLines={wide ? 1 : 2}>
          {title}
        </Text>
        <Text style={styles.catSub}>{subtitle}</Text>
        {wide && badge && <Badge {...badgeProps} style={{ marginTop: 12 }} />}
      </View>
      <View style={wide ? { alignSelf: 'center' } : { alignSelf: 'flex-end', marginTop: 4 }}>
        {image ? (
          <Image
            source={image}
            style={[{ width: img, height: img }, wide ? { marginRight: -8 } : { marginRight: -6, marginBottom: -6 }]}
            resizeMode="contain"
          />
        ) : (
          <LinearGradient colors={colorsFrom} style={[styles.catIcon, wide && { width: 64, height: 64, borderRadius: 22 }]}>
            <MaterialCommunityIcons name={icon} size={wide ? 34 : 28} color={colors.white} />
          </LinearGradient>
        )}
      </View>
      {!wide && badge && <Badge {...badgeProps} style={styles.catBadge} />}
    </Pressable>
  );
}

/* ---------------- Venue (vertikal karta) ---------------- */
export function VenueCard({ venue, onPress, onBook, width = 230 }) {
  const { favorites, toggleFavorite } = useApp();
  const fav = favorites.includes(venue.id);
  const sport = getSport(venue.type);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [styles.venue, { width }, webTransition, hovered && hoverLift, pressed && styles.pressed]}
    >
      <SmartImage uri={venue.images[0]} style={styles.venueImg} icon={sport.icon}>
        <Pressable onPress={() => toggleFavorite(venue.id)} hitSlop={8} style={styles.heart}>
          <Ionicons name={fav ? 'heart' : 'heart-outline'} size={18} color={fav ? colors.danger : colors.white} />
        </Pressable>
        <View style={styles.distance}>
          <Ionicons name="location" size={12} color={colors.white} />
          <Text style={styles.distanceText}>{venue.distance} km</Text>
        </View>
      </SmartImage>
      <View style={{ padding: 12 }}>
        <Text style={type.h3} numberOfLines={1}>
          {venue.name}
        </Text>
        <View style={[styles.row, { marginTop: 6, justifyContent: 'space-between' }]}>
          <Rating value={venue.rating} count={venue.reviewsCount} size={13} />
          <Text style={[styles.sportTag, { color: sport.color }]}>{sport.name}</Text>
        </View>
        <View style={[styles.row, { marginTop: 6 }]}>
          <Ionicons name="location-outline" size={13} color={colors.textLight} />
          <Text style={[type.small, { marginLeft: 4, flex: 1 }]} numberOfLines={1}>
            {venue.district}
          </Text>
        </View>
        <Text style={styles.price}>
          {formatPrice(minPrice(venue))}
          <Text style={type.small}> dan / soat</Text>
        </Text>
        <Pressable onPress={onBook || onPress} style={({ pressed }) => [styles.bookBtn, pressed && { opacity: 0.85 }]}>
          <Text style={styles.bookText}>Bron qilish</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

/* ---------------- Venue (ro'yxat elementi) ---------------- */
export function VenueListItem({ venue, onPress, onBook, style }) {
  const { favorites, toggleFavorite } = useApp();
  const fav = favorites.includes(venue.id);
  const sport = getSport(venue.type);
  const open = isOpenNow(venue);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${venue.name}, ${sport.name}, ${venue.district}`}
      style={({ pressed, hovered }) => [styles.listItem, webTransition, hovered && hoverLift, pressed && styles.pressed, style]}
    >
      <SmartImage uri={venue.images[0]} style={styles.listImg} icon={sport.icon} iconSize={28}>
        {venue.popular && (
          <View style={styles.topBadge}>
            <Ionicons name="flame" size={10} color={colors.white} />
            <Text style={styles.topBadgeText}>TOP</Text>
          </View>
        )}
        <View style={[styles.distance, { left: 8, bottom: 8 }]}>
          <Ionicons name="navigate" size={10} color={colors.white} />
          <Text style={styles.distanceText}>{venue.distance} km</Text>
        </View>
      </SmartImage>

      <View style={{ flex: 1, marginLeft: 12, justifyContent: 'space-between' }}>
        <View>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <View style={[styles.sportPill, { backgroundColor: `${sport.color}14` }]}>
              <MaterialCommunityIcons name={sport.icon} size={12} color={sport.color} />
              <Text style={[styles.sportTag, { color: sport.color, marginLeft: 4 }]}>{sport.name}</Text>
            </View>
            <Pressable
              onPress={() => toggleFavorite(venue.id)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={fav ? 'Sevimlilardan olib tashlash' : "Sevimlilarga qo'shish"}
              style={({ pressed }) => [styles.listHeart, fav && { backgroundColor: colors.dangerSoft }, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={17} color={fav ? colors.danger : colors.textMuted} />
            </Pressable>
          </View>
          <Text style={[type.h3, { marginTop: 6, lineHeight: 21 }]} numberOfLines={2}>
            {venue.name}
          </Text>
          <View style={[styles.row, { marginTop: 4 }]}>
            <Ionicons name="location-outline" size={13} color={colors.textLight} />
            <Text style={[type.small, { marginLeft: 3, flex: 1 }]} numberOfLines={1}>
              {venue.district}
            </Text>
          </View>
        </View>

        <View style={[styles.row, { justifyContent: 'space-between', marginTop: 10 }]}>
          <View style={styles.row}>
            <Rating value={venue.rating} count={venue.reviewsCount} size={13} />
            <View style={styles.dotSep} />
            <View style={[styles.statusDot, { backgroundColor: open ? colors.success : colors.danger }]} />
            <Text style={[styles.statusText, { color: open ? colors.success : colors.danger }]}>{open ? 'Ochiq' : 'Yopiq'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.price, { marginTop: 0, fontSize: 15 }]}>{formatPrice(minPrice(venue))}</Text>
            <Text style={styles.priceUnit}>dan / soat</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/* ---------------- Workout ---------------- */
export function WorkoutCard({ workout, onPress, width = 240, horizontal = true }) {
  const { completedWorkouts } = useApp();
  const done = completedWorkouts.some((c) => c.workoutId === workout.id);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.workout,
        horizontal ? { width } : { width: '100%' },
        webTransition,
        hovered && hoverLift,
        pressed && styles.pressed,
      ]}
    >
      <SmartImage uri={workout.image} style={[styles.workoutImg, !horizontal && { height: 170 }]} icon="dumbbell" fade>
        <View style={styles.workoutTop}>
          <Badge label={workout.category} bg="rgba(255,255,255,0.92)" color={colors.text} />
          {done && <Badge label="Bajarilgan" icon="checkmark" color={colors.success} />}
        </View>
        <View style={styles.playBtn}>
          <Ionicons name="play" size={18} color={colors.white} style={{ marginLeft: 2 }} />
        </View>
        <View style={styles.workoutBottom}>
          <Text style={styles.workoutTitle} numberOfLines={2}>
            {workout.title}
          </Text>
          <View style={[styles.row, { marginTop: 6, gap: 12 }]}>
            <Meta icon="time-outline" text={`${workout.minutes} daq`} light />
            <Meta icon="flame-outline" text={`${workout.calories} kkal`} light />
            <Meta icon="speedometer-outline" text={workout.level} light />
          </View>
        </View>
      </SmartImage>
    </Pressable>
  );
}

/* ---------------- Workout (ixcham ro'yxat elementi) ---------------- */
export function WorkoutListItem({ workout, onPress, onStart, style }) {
  const { completedWorkouts } = useApp();
  const doneCount = completedWorkouts.filter((c) => c.workoutId === workout.id).length;
  const lvl = levelInfo(workout.level);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${workout.title}, ${workout.minutes} daqiqa, ${workout.level}`}
      style={({ pressed, hovered }) => [styles.listItem, webTransition, hovered && hoverLift, pressed && styles.pressed, style]}
    >
      <SmartImage uri={workout.image} style={styles.wListImg} icon="dumbbell" iconSize={28}>
        <View style={styles.wListTime}>
          <Ionicons name="time" size={10} color={colors.white} />
          <Text style={styles.distanceText}>{workout.minutes} daq</Text>
        </View>
        {doneCount > 0 && (
          <View style={styles.wDone}>
            <Ionicons name="checkmark" size={12} color={colors.white} />
          </View>
        )}
      </SmartImage>
      <View style={{ flex: 1, marginLeft: 12, justifyContent: 'space-between' }}>
        <View>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Text style={[styles.sportTag, { color: colors.primary }]}>{workout.category}</Text>
            <View style={[styles.row, { gap: 2 }]}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.lvlBar, { height: 4 + i * 3, backgroundColor: i <= lvl.n ? lvl.color : colors.border }]} />
              ))}
            </View>
          </View>
          <Text style={[type.h3, { marginTop: 4, lineHeight: 21 }]} numberOfLines={2}>
            {workout.title}
          </Text>
          <Text style={[type.small, { marginTop: 3 }]} numberOfLines={1}>
            {workout.coach} · {workout.equipment}
          </Text>
        </View>
        <View style={[styles.row, { justifyContent: 'space-between', marginTop: 8 }]}>
          <View style={[styles.row, { gap: 10 }]}>
            <Meta icon="flame-outline" text={`${workout.calories} kkal`} />
            <Meta icon="list-outline" text={`${workout.exercisesCount} mashq`} />
          </View>
          <Pressable
            onPress={onStart || onPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Boshlash"
            style={({ pressed }) => [styles.wPlay, pressed && { opacity: 0.8, transform: [{ scale: 0.92 }] }]}
          >
            <Ionicons name="play" size={14} color={colors.white} style={{ marginLeft: 2 }} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export function Meta({ icon, text, light }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={13} color={light ? 'rgba(255,255,255,0.9)' : colors.textMuted} />
      <Text style={[styles.metaText, light && { color: 'rgba(255,255,255,0.95)' }]}>{text}</Text>
    </View>
  );
}

/* ---------------- Event ---------------- */
export function EventCard({ event, onPress, width }) {
  const { registeredEvents } = useApp();
  const registered = registeredEvents.includes(event.id);
  const d = new Date(event.date);
  const fill = Math.min(1, event.participants / event.capacity);
  const sport = getSport(event.sport);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [styles.event, width && { width }, webTransition, hovered && hoverLift, pressed && styles.pressed]}
    >
      <SmartImage uri={event.image} style={styles.eventImg} icon="trophy">
        <View style={styles.dateBadge}>
          <Text style={styles.dateDay}>{d.getDate()}</Text>
          <Text style={styles.dateMonth}>{MONTHS_SHORT[d.getMonth()]}</Text>
        </View>
        {registered && <Badge label="Ro'yxatdasiz" icon="checkmark" color={colors.success} style={styles.eventReg} />}
      </SmartImage>
      <View style={{ padding: 12 }}>
        <Text style={[styles.sportTag, { color: sport.color }]}>{sport.name}</Text>
        <Text style={[type.h3, { marginTop: 2 }]} numberOfLines={1}>
          {event.title}
        </Text>
        <View style={[styles.row, { marginTop: 6 }]}>
          <Ionicons name="location-outline" size={13} color={colors.textLight} />
          <Text style={[type.small, { marginLeft: 4, flex: 1 }]} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
        <View style={[styles.row, { marginTop: 4 }]}>
          <Ionicons name="time-outline" size={13} color={colors.textLight} />
          <Text style={[type.small, { marginLeft: 4 }]}>
            {formatDate(event.date)}, {formatTime(event.date)}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${fill * 100}%` }]} />
        </View>
        <View style={[styles.row, { justifyContent: 'space-between', marginTop: 6 }]}>
          <Text style={type.small}>
            {event.participants}/{event.capacity} ishtirokchi
          </Text>
          <Text style={[styles.price, { marginTop: 0, fontSize: 13 }]}>{formatPrice(event.price)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

/* ---------------- News ---------------- */
export function NewsCard({ item, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed, hovered }) => [styles.news, webTransition, hovered && hoverLift, pressed && styles.pressed]}>
      <SmartImage uri={item.image} style={styles.newsImg} icon="bullhorn" iconSize={26} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={[styles.row, { gap: 6 }]}>
          <Text style={[styles.sportTag, { color: colors.blue }]}>{item.category}</Text>
          {item.isNew && <Badge label="Yangi" icon="flame" color={colors.blue} style={{ paddingVertical: 2, paddingHorizontal: 7 }} />}
        </View>
        <Text style={[type.label, { marginTop: 4, lineHeight: 19 }]} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={[styles.row, { marginTop: 6, gap: 12 }]}>
          <Meta icon="time-outline" text={timeAgo(item.date)} />
          <Meta icon="eye-outline" text={item.views} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  pressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
  cat: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 12,
    minHeight: 124,
    justifyContent: 'space-between',
    ...shadow,
  },
  catSoft: {
    backgroundColor: '#F3F4F6',
    ...Platform.select({ web: { boxShadow: 'none' }, default: { shadowOpacity: 0, elevation: 0 } }),
  },
  catTitle: { fontSize: 13, fontWeight: '800', color: colors.text },
  catSub: { fontSize: 11, color: colors.textLight, marginTop: 2 },
  catBadge: { position: 'absolute', left: 12, bottom: 12, zIndex: 2 },
  catIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  venue: { backgroundColor: colors.white, borderRadius: radius.lg, ...shadow },
  venueImg: { height: 130, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distance: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,24,36,0.75)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  distanceText: { color: colors.white, fontSize: 11, fontWeight: '700', marginLeft: 3 },
  sportTag: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  price: { fontSize: 15, fontWeight: '800', color: colors.primary, marginTop: 8 },
  bookBtn: {
    marginTop: 10,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  listItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 10,
    ...shadow,
  },
  listImg: { width: 118, height: 128, borderRadius: radius.lg },
  topBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  topBadgeText: { color: colors.white, fontSize: 9, fontWeight: '900', marginLeft: 3, letterSpacing: 0.5 },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  listHeart: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSep: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textLight, marginHorizontal: 7 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  wListImg: { width: 104, height: 112, borderRadius: radius.lg },
  wListTime: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,24,36,0.75)',
    borderRadius: radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  wDone: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  lvlBar: { width: 4, borderRadius: 2 },
  wPlay: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  priceUnit: { fontSize: 10, color: colors.textLight, fontWeight: '500', marginTop: 1 },
  workout: { borderRadius: radius.lg, ...shadow, backgroundColor: colors.white },
  workoutImg: { height: 190, borderRadius: radius.lg },
  workoutTop: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between' },
  playBtn: {
    position: 'absolute',
    right: 12,
    top: 70,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutBottom: { position: 'absolute', left: 14, right: 14, bottom: 14 },
  workoutTitle: { color: colors.white, fontSize: 17, fontWeight: '800' },
  metaText: { fontSize: 12, color: colors.textMuted, marginLeft: 4, fontWeight: '500' },
  event: { backgroundColor: colors.white, borderRadius: radius.lg, ...shadow },
  eventImg: { height: 140, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  dateBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  dateDay: { fontSize: 18, fontWeight: '900', color: colors.primary, lineHeight: 20 },
  dateMonth: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  eventReg: { position: 'absolute', top: 12, right: 10 },
  progressTrack: { height: 6, backgroundColor: colors.border, borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  news: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: radius.lg, padding: 10, ...shadow },
  newsImg: { width: 92, height: 92, borderRadius: radius.md },
});
