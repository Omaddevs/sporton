import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SmartImage from '../components/SmartImage';
import { Badge, Button, EmptyState, IconButton, InfoRow } from '../components/ui';
import { colors, radius, shadow, type } from '../theme';
import { useApp } from '../context/AppContext';
import { getEvent } from '../data/events';
import { getSport } from '../data/sports';
import { formatDateLong, formatPrice, formatTime, pad } from '../utils/format';

export default function EventDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const event = getEvent(route.params?.id);
  const { registeredEvents, toggleEvent } = useApp();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  if (!event) return <EmptyState title="Tadbir topilmadi" actionLabel="Orqaga" onAction={() => navigation.goBack()} />;

  const registered = registeredEvents.includes(event.id);
  const sport = getSport(event.sport);
  const participants = event.participants + (registered ? 1 : 0);
  const left = Math.max(0, event.capacity - participants);
  const diff = Math.max(0, new Date(event.date).getTime() - now);
  const cd = { d: Math.floor(diff / 864e5), h: Math.floor((diff % 864e5) / 36e5), m: Math.floor((diff % 36e5) / 6e4) };

  const toggle = () => {
    if (registered) {
      Alert.alert('Ro\'yxatdan chiqish', 'Tadbirdagi ishtirokingizni bekor qilasizmi?', [
        { text: 'Yo\'q', style: 'cancel' },
        { text: 'Ha', style: 'destructive', onPress: () => toggleEvent(event.id) },
      ]);
    } else {
      toggleEvent(event.id);
      Alert.alert('Tabriklaymiz! 🎉', `Siz «${event.title}» tadbiriga ro'yxatdan o'tdingiz. Tadbir kuni eslatma yuboramiz.`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <SmartImage uri={event.image} style={{ height: 300 }} icon="trophy" iconSize={64} fade>
          <View style={[styles.bar, { top: insets.top + 8 }]}>
            <IconButton name="chevron-back" onPress={() => navigation.goBack()} />
            <IconButton
              name="share-social-outline"
              onPress={() => Share.share({ message: `${event.title} — ${formatDateLong(event.date)}, ${event.location}. SportON` })}
            />
          </View>
          <View style={styles.heroBottom}>
            <Badge label={sport.name} color={sport.color} />
            <Text style={styles.title}>{event.title}</Text>
          </View>
        </SmartImage>

        {/* Qayta sanoq */}
        <View style={styles.countdown}>
          <CD value={cd.d} label="kun" />
          <Text style={styles.colon}>:</Text>
          <CD value={pad(cd.h)} label="soat" />
          <Text style={styles.colon}>:</Text>
          <CD value={pad(cd.m)} label="daqiqa" />
        </View>

        <View style={styles.block}>
          <InfoRow icon="calendar-outline" label="Sana" value={formatDateLong(event.date)} />
          <InfoRow icon="time-outline" label="Boshlanish" value={formatTime(event.date)} />
          <InfoRow icon="location-outline" label="Manzil" value={event.location} />
          <InfoRow icon="ticket-outline" label="Ishtirok narxi" value={`${formatPrice(event.price)}${event.priceNote ? ` (${event.priceNote})` : ''}`} />
          <InfoRow icon="gift-outline" label="Mukofot" value={event.prize} />
          <InfoRow icon="people-outline" label="Tashkilotchi" value={event.organizer} last />
        </View>

        <View style={[styles.block, { padding: 16 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={type.label}>Ishtirokchilar</Text>
            <Text style={[type.label, { color: colors.primary }]}>
              {participants}/{event.capacity}
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.min(100, (participants / event.capacity) * 100)}%` }]} />
          </View>
          <Text style={[type.small, { marginTop: 8 }]}>{left > 0 ? `Yana ${left} ta joy qoldi` : 'Joylar tugagan'}</Text>
        </View>

        <Text style={[type.h2, { paddingHorizontal: 16, marginTop: 24 }]}>Tadbir haqida</Text>
        <Text style={[type.body, { paddingHorizontal: 16, marginTop: 8, color: colors.textMuted }]}>{event.description}</Text>

        {event.venueId && (
          <Button
            title="Majmua sahifasini ochish"
            variant="outline"
            icon="business-outline"
            size="md"
            onPress={() => navigation.navigate('VenueDetail', { id: event.venueId })}
            style={{ marginHorizontal: 16, marginTop: 20 }}
          />
        )}
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        {registered ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name="checkmark-circle" size={26} color={colors.success} />
            <Text style={[type.label, { marginLeft: 8, flex: 1, color: colors.success }]}>Siz ro'yxatdasiz</Text>
            <Button title="Bekor qilish" variant="danger" size="md" onPress={toggle} />
          </View>
        ) : (
          <Button title={left > 0 ? 'Ro\'yxatdan o\'tish' : 'Joylar tugagan'} icon="person-add-outline" disabled={left === 0} onPress={toggle} style={{ flex: 1 }} />
        )}
      </View>
    </View>
  );
}

function CD({ value, label }) {
  return (
    <View style={{ alignItems: 'center', minWidth: 60 }}>
      <Text style={styles.cdValue}>{value}</Text>
      <Text style={type.small}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  heroBottom: { position: 'absolute', left: 16, right: 16, bottom: 44 },
  title: { color: colors.white, fontSize: 26, fontWeight: '900', marginTop: 10 },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: -28,
    borderRadius: radius.lg,
    paddingVertical: 14,
    ...shadow,
  },
  cdValue: { fontSize: 26, fontWeight: '900', color: colors.primary },
  colon: { fontSize: 22, fontWeight: '900', color: colors.textLight, marginBottom: 14 },
  block: { backgroundColor: colors.white, marginHorizontal: 16, marginTop: 16, borderRadius: radius.lg, paddingHorizontal: 14, ...shadow },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.border, marginTop: 10, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...shadow,
  },
});
