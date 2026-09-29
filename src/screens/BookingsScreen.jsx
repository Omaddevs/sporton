import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Linking, Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import SmartImage from '../components/SmartImage';
import { Badge, EmptyState, ScreenHeader, Segmented } from '../components/ui';
import { colors, radius, shadow, type } from '../theme';
import { useApp } from '../context/AppContext';
import { getVenue } from '../data/venues';
import { getSport } from '../data/sports';
import { formatDateLong, formatPrice, formatRange } from '../utils/format';
import { bookingStart, isBookingUpcoming } from '../utils/booking';
import { openMaps } from '../utils/links';
import { ICONS } from '../data/icons';

export default function BookingsScreen({ navigation }) {
  const { bookings, cancelBooking } = useApp();
  const [tab, setTab] = useState('active');

  const data = useMemo(() => {
    const upcoming = bookings.filter(isBookingUpcoming).sort((a, b) => bookingStart(a) - bookingStart(b));
    const history = bookings.filter((b) => !isBookingUpcoming(b)).sort((a, b) => bookingStart(b) - bookingStart(a));
    return tab === 'active' ? upcoming : history;
  }, [bookings, tab]);

  const onCancel = (b) => {
    const hoursLeft = (bookingStart(b) - new Date()) / 36e5;
    Alert.alert(
      'Bronni bekor qilish',
      hoursLeft < 2
        ? 'Bron boshlanishiga 2 soatdan kam vaqt qoldi. Baribir bekor qilasizmi?'
        : `${b.venueName} dagi broningizni bekor qilmoqchimisiz?`,
      [
        { text: 'Yo\'q', style: 'cancel' },
        { text: 'Ha, bekor qilish', style: 'destructive', onPress: () => cancelBooking(b.id) },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader back={false} title="Bronlarim" subtitle="Sport majmualaridagi bronlaringiz" />
      <Segmented
        options={[
          { value: 'active', label: 'Faol' },
          { value: 'history', label: 'Tarix' },
        ]}
        value={tab}
        onChange={setTab}
        style={{ marginHorizontal: 16 }}
      />
      <FlatList
        data={data}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          tab === 'active' ? (
            <EmptyState
              icon="calendar-outline"
              image={ICONS.calendar}
              title="Faol bronlar yo'q"
              text="Yaqin atrofdagi sport majmuasini toping va bir necha soniyada bron qiling."
              actionLabel="Majmua topish"
              onAction={() => navigation.navigate('Venues')}
            />
          ) : (
            <EmptyState icon="time-outline" title="Tarix bo'sh" text="O'tgan va bekor qilingan bronlar shu yerda ko'rinadi." />
          )
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => navigation.navigate('VenueDetail', { id: item.venueId })}
            onCancel={() => onCancel(item)}
            onRebook={() => navigation.navigate('Booking', { venueId: item.venueId, fieldId: item.fieldId })}
          />
        )}
      />
    </View>
  );
}

function BookingCard({ booking: b, onPress, onCancel, onRebook }) {
  const upcoming = isBookingUpcoming(b);
  const venue = getVenue(b.venueId);
  const sport = getSport(b.venueType);
  const status =
    b.status === 'cancelled'
      ? { label: 'Bekor qilingan', color: colors.danger, bg: colors.dangerSoft }
      : upcoming
      ? { label: 'Tasdiqlangan', color: colors.success, bg: colors.successSoft }
      : { label: 'Yakunlangan', color: colors.textMuted, bg: colors.bg };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}>
      <View style={{ flexDirection: 'row' }}>
        <SmartImage uri={b.venueImage} style={styles.img} icon={sport.icon} iconSize={26} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Badge label={status.label} color={status.color} bg={status.bg} />
          <Text style={[type.h3, { marginTop: 6 }]} numberOfLines={1}>
            {b.venueName}
          </Text>
          <Text style={type.small} numberOfLines={1}>
            {b.fieldName}
          </Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <View style={styles.info}>
          <Ionicons name="calendar-outline" size={16} color={colors.primary} />
          <Text style={styles.infoText}>{formatDateLong(b.date)}</Text>
        </View>
        <View style={styles.info}>
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <Text style={styles.infoText}>{formatRange(b.startHour, b.duration)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={type.small}>Kod: <Text style={{ fontWeight: '800', color: colors.text }}>{b.code}</Text></Text>
          <Text style={styles.price}>{formatPrice(b.total)}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {upcoming ? (
            <>
              <SmallAction icon="call-outline" onPress={() => Linking.openURL(`tel:${b.phoneVenue}`)} />
              {venue && <SmallAction icon="navigate-outline" onPress={() => openMaps(venue)} />}
              <SmallAction icon="close" color={colors.danger} bg={colors.dangerSoft} onPress={onCancel} />
            </>
          ) : (
            <Pressable onPress={onRebook} style={styles.rebook}>
              <Ionicons name="refresh" size={16} color={colors.primary} />
              <Text style={styles.rebookText}>Qayta bron</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function SmallAction({ icon, onPress, color = colors.text, bg = colors.bg }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} style={[styles.small, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={18} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, ...shadow },
  img: { width: 72, height: 72, borderRadius: 14 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    justifyContent: 'space-between',
  },
  info: { flexDirection: 'row', alignItems: 'center' },
  infoText: { marginLeft: 6, fontSize: 13, fontWeight: '700', color: colors.text },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  price: { fontSize: 16, fontWeight: '900', color: colors.primary, marginTop: 2 },
  small: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rebook: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 12,
  },
  rebookText: { color: colors.primary, fontWeight: '700', marginLeft: 6, fontSize: 13 },
});
