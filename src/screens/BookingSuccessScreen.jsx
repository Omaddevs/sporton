import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, Share, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui';
import { colors, radius, shadow, type } from '../theme';
import { formatDateLong, formatPrice, formatRange } from '../utils/format';

const PAY_LABELS = { cash: 'Naqd (joyida)', click: 'Click', payme: 'Payme', card: 'Uzcard / Humo' };

export default function BookingSuccessScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { booking } = route.params;
  const scale = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, [scale, fade]);

  const goHome = () => navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  const goBookings = () => navigation.reset({ index: 0, routes: [{ name: 'Tabs', params: { screen: 'Bookings' } }] });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24, paddingHorizontal: 20 }}
    >
      <Animated.View style={[styles.circleOuter, { transform: [{ scale }] }]}>
        <View style={styles.circle}>
          <Ionicons name="checkmark" size={56} color={colors.white} />
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: fade }}>
        <Text style={[type.h1, { textAlign: 'center', marginTop: 24 }]}>Bron tasdiqlandi!</Text>
        <Text style={[type.small, { textAlign: 'center', marginTop: 8, fontSize: 14, lineHeight: 20 }]}>
          Majmuaga kelganingizda quyidagi kodni ko'rsating. Tafsilotlar «Bronlarim» bo'limida saqlandi.
        </Text>

        <View style={styles.ticket}>
          <View style={styles.codeBox}>
            <Text style={type.small}>Bron kodi</Text>
            <Text style={styles.code}>{booking.code}</Text>
          </View>
          <View style={styles.cutRow}>
            <View style={[styles.cut, { left: -30 }]} />
            <View style={styles.dash} />
            <View style={[styles.cut, { right: -30 }]} />
          </View>
          <Row icon="business-outline" label="Majmua" value={booking.venueName} />
          <Row icon="football-outline" label="Maydon" value={booking.fieldName} />
          <Row icon="calendar-outline" label="Sana" value={formatDateLong(booking.date)} />
          <Row icon="time-outline" label="Vaqt" value={formatRange(booking.startHour, booking.duration)} />
          <Row icon="wallet-outline" label="To'lov" value={PAY_LABELS[booking.paymentMethod]} />
          <Row icon="cash-outline" label="Jami" value={formatPrice(booking.total)} highlight />
        </View>

        <Button title="Bronlarimga o'tish" icon="calendar" onPress={goBookings} style={{ marginTop: 24 }} />
        <Button
          title="Do'stlarga ulashish"
          icon="share-social-outline"
          variant="outline"
          onPress={() =>
            Share.share({
              message: `⚽ ${booking.venueName}\n📅 ${formatDateLong(booking.date)}, ${formatRange(booking.startHour, booking.duration)}\n📍 ${booking.address}\nKeling, birga o'ynaymiz! (SportON)`,
            })
          }
          style={{ marginTop: 12 }}
        />
        <Button title="Bosh sahifaga" variant="soft" onPress={goHome} style={{ marginTop: 12 }} />
      </Animated.View>
    </ScrollView>
  );
}

function Row({ icon, label, value, highlight }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={colors.textLight} />
      <Text style={[type.small, { marginLeft: 10, flex: 1 }]}>{label}</Text>
      <Text style={[type.label, highlight && { color: colors.primary, fontSize: 16, fontWeight: '900' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circleOuter: {
    alignSelf: 'center',
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticket: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 20, marginTop: 24, ...shadow, overflow: 'hidden' },
  codeBox: { alignItems: 'center' },
  code: { fontSize: 30, fontWeight: '900', color: colors.text, letterSpacing: 3, marginTop: 4 },
  cutRow: { height: 30, justifyContent: 'center', marginVertical: 6 },
  cut: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: colors.bg },
  dash: { borderTopWidth: 2, borderColor: colors.border, borderStyle: 'dashed' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
});
