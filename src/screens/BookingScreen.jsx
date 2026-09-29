import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text, { TextInput } from '../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SmartImage from '../components/SmartImage';
import { Button, EmptyState, ScreenHeader } from '../components/ui';
import { colors, radius, shadow, type } from '../theme';
import { useApp } from '../context/AppContext';
import { getVenue } from '../data/venues';
import { getSport } from '../data/sports';
import { addDays, formatDateLong, formatHour, formatPrice, formatRange, generateCode, toDateKey, WEEKDAYS_SHORT, MONTHS_SHORT } from '../utils/format';
import { canBookRange, getSlotStatus } from '../utils/booking';

const PAYMENTS = [
  { id: 'cash', label: 'Naqd pul', sub: 'Joyida to\'lash', icon: 'cash-outline', color: colors.success },
  { id: 'click', label: 'Click', sub: 'Onlayn to\'lov', icon: 'phone-portrait-outline', color: '#0099FF' },
  { id: 'payme', label: 'Payme', sub: 'Onlayn to\'lov', icon: 'wallet-outline', color: '#16B5B0' },
  { id: 'card', label: 'Uzcard / Humo', sub: 'Bank kartasi', icon: 'card-outline', color: colors.blue },
];

export default function BookingScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const venue = getVenue(route.params?.venueId);
  const { bookings, user, addBooking } = useApp();

  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)), []);
  const [fieldId, setFieldId] = useState(route.params?.fieldId || venue?.fields[0].id);
  const [dateKey, setDateKey] = useState(toDateKey(days[0]));
  const [start, setStart] = useState(null);
  const [duration, setDuration] = useState(1);
  const [payment, setPayment] = useState('cash');
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!venue) return <EmptyState title="Majmua topilmadi" actionLabel="Orqaga" onAction={() => navigation.goBack()} />;

  const field = venue.fields.find((f) => f.id === fieldId) || venue.fields[0];
  const sport = getSport(venue.type);
  const hours = [];
  for (let h = venue.open; h < venue.close; h++) hours.push(h);

  const selectionValid = start != null && canBookRange(bookings, venue, field.id, dateKey, start, duration);
  const total = field.price * duration;
  const freeCount = hours.filter((h) => getSlotStatus(bookings, venue.id, field.id, dateKey, h) === 'free').length;

  const resetTime = () => {
    setStart(null);
    setDuration(1);
  };

  const pickSlot = (h) => {
    // Agar tanlangan diapazon ichida bosilsa — tanlovni bekor qilamiz
    if (start != null && h >= start && h < start + duration) return resetTime();
    // Tanlangan slotdan keyingi bo'sh slot bosilsa — davomiylikni uzaytiramiz
    if (start != null && h >= start + duration && canBookRange(bookings, venue, field.id, dateKey, start, h - start + 1) && h - start + 1 <= 4) {
      return setDuration(h - start + 1);
    }
    setStart(h);
    setDuration(1);
  };

  const changeDuration = (d) => {
    if (start == null) return;
    const next = Math.max(1, Math.min(4, d));
    if (canBookRange(bookings, venue, field.id, dateKey, start, next)) setDuration(next);
    else Alert.alert('Vaqt band', 'Keyingi soat band yoki majmua yopiladi.');
  };

  const confirm = () => {
    if (!selectionValid) return Alert.alert('Vaqtni tanlang', 'Iltimos, bo\'sh vaqt oralig\'ini tanlang.');
    if (name.trim().length < 2) return Alert.alert('Ism kiritilmagan', 'Iltimos, ismingizni kiriting.');
    if (phone.replace(/\D/g, '').length < 9) return Alert.alert('Telefon raqam noto\'g\'ri', 'Iltimos, telefon raqamingizni tekshiring.');

    setSubmitting(true);
    // Backend ulanganda bu yerda API chaqiruvi bo'ladi
    setTimeout(() => {
      const booking = {
        id: `b-${Date.now()}`,
        code: generateCode(),
        venueId: venue.id,
        venueName: venue.name,
        venueImage: venue.images[0],
        venueType: venue.type,
        address: `${venue.address}, ${venue.district}`,
        phoneVenue: venue.phone,
        fieldId: field.id,
        fieldName: field.name,
        date: dateKey,
        startHour: start,
        duration,
        total,
        paymentMethod: payment,
        paid: payment !== 'cash',
        name: name.trim(),
        phone: phone.trim(),
        note: note.trim(),
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      addBooking(booking);
      setSubmitting(false);
      navigation.replace('BookingSuccess', { booking });
    }, 700);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Bron qilish" subtitle={venue.name} />
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Majmua */}
        <View style={styles.venueCard}>
          <SmartImage uri={venue.images[0]} style={styles.venueImg} icon={sport.icon} iconSize={24} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={type.h3} numberOfLines={1}>
              {venue.name}
            </Text>
            <Text style={type.small} numberOfLines={1}>
              {venue.address}
            </Text>
            <Text style={[type.small, { color: colors.primary, fontWeight: '700', marginTop: 2 }]}>
              {formatHour(venue.open)} – {formatHour(venue.close)}
            </Text>
          </View>
        </View>

        {/* Maydon */}
        {venue.fields.length > 1 && (
          <>
            <Step n={1} title="Maydonni tanlang" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
              {venue.fields.map((f) => {
                const active = f.id === field.id;
                return (
                  <Pressable
                    key={f.id}
                    onPress={() => {
                      setFieldId(f.id);
                      resetTime();
                    }}
                    style={[styles.fieldCard, active && styles.fieldActive]}
                  >
                    <Text style={[type.label, active && { color: colors.primary }]}>{f.name}</Text>
                    <Text style={type.small}>{f.size}</Text>
                    <Text style={[styles.fieldPrice, active && { color: colors.primary }]}>{formatPrice(f.price)}</Text>
                    {active && (
                      <View style={styles.check}>
                        <Ionicons name="checkmark" size={12} color={colors.white} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Sana */}
        <Step n={venue.fields.length > 1 ? 2 : 1} title="Sanani tanlang" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {days.map((d, i) => {
            const key = toDateKey(d);
            const active = key === dateKey;
            return (
              <Pressable
                key={key}
                onPress={() => {
                  setDateKey(key);
                  resetTime();
                }}
                style={[styles.day, active && styles.dayActive]}
              >
                <Text style={[styles.dayWeek, active && { color: 'rgba(255,255,255,0.85)' }]}>
                  {i === 0 ? 'Bugun' : i === 1 ? 'Ertaga' : WEEKDAYS_SHORT[d.getDay()]}
                </Text>
                <Text style={[styles.dayNum, active && { color: colors.white }]}>{d.getDate()}</Text>
                <Text style={[styles.dayMonth, active && { color: 'rgba(255,255,255,0.85)' }]}>{MONTHS_SHORT[d.getMonth()]}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Vaqt */}
        <Step n={venue.fields.length > 1 ? 3 : 2} title="Vaqtni tanlang" right={`${freeCount} ta bo'sh`} />
        <View style={styles.legend}>
          <Legend color={colors.white} border={colors.border} label="Bo'sh" />
          <Legend color={colors.primary} label="Tanlangan" />
          <Legend color="#E5E7EB" label="Band" />
          <Legend color={colors.blueSoft} border={colors.blue} label="Sizniki" />
        </View>
        <View style={styles.slots}>
          {hours.map((h) => {
            const status = getSlotStatus(bookings, venue.id, field.id, dateKey, h);
            const selected = start != null && h >= start && h < start + duration;
            const disabled = status !== 'free';
            return (
              <Pressable
                key={h}
                disabled={disabled}
                onPress={() => pickSlot(h)}
                style={[
                  styles.slot,
                  status === 'busy' && styles.slotBusy,
                  status === 'past' && styles.slotPast,
                  status === 'mine' && styles.slotMine,
                  selected && styles.slotSelected,
                ]}
              >
                <Text
                  style={[
                    styles.slotText,
                    disabled && { color: colors.textLight },
                    status === 'busy' && { textDecorationLine: 'line-through' },
                    status === 'mine' && { color: colors.blue },
                    selected && { color: colors.white },
                  ]}
                >
                  {formatHour(h)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {freeCount === 0 && (
          <Text style={[type.small, { paddingHorizontal: 16, marginTop: 6, color: colors.danger }]}>
            Bu kunda bo'sh vaqt qolmadi. Boshqa sana yoki maydonni tanlang.
          </Text>
        )}

        {/* Davomiylik */}
        {start != null && (
          <View style={styles.durationCard}>
            <View style={{ flex: 1 }}>
              <Text style={type.label}>Davomiylik</Text>
              <Text style={type.small}>{formatRange(start, duration)}</Text>
            </View>
            <Pressable onPress={() => changeDuration(duration - 1)} style={styles.stepBtn} disabled={duration <= 1}>
              <Ionicons name="remove" size={20} color={duration <= 1 ? colors.textLight : colors.text} />
            </Pressable>
            <Text style={styles.durationValue}>{duration} soat</Text>
            <Pressable onPress={() => changeDuration(duration + 1)} style={styles.stepBtn} disabled={duration >= 4}>
              <Ionicons name="add" size={20} color={duration >= 4 ? colors.textLight : colors.text} />
            </Pressable>
          </View>
        )}

        {/* Aloqa */}
        <Step n={venue.fields.length > 1 ? 4 : 3} title="Aloqa ma'lumotlari" />
        <View style={styles.form}>
          <Field icon="person-outline" value={name} onChangeText={setName} placeholder="Ismingiz" />
          <Field icon="call-outline" value={phone} onChangeText={setPhone} placeholder="+998 __ ___ __ __" keyboardType="phone-pad" />
          <Field icon="chatbubble-ellipses-outline" value={note} onChangeText={setNote} placeholder="Izoh (ixtiyoriy)" last />
        </View>

        {/* To'lov */}
        <Step n={venue.fields.length > 1 ? 5 : 4} title="To'lov usuli" />
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {PAYMENTS.map((p) => {
            const active = p.id === payment;
            return (
              <Pressable key={p.id} onPress={() => setPayment(p.id)} style={[styles.pay, active && styles.payActive]}>
                <View style={[styles.payIcon, { backgroundColor: `${p.color}18` }]}>
                  <Ionicons name={p.icon} size={20} color={p.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={type.label}>{p.label}</Text>
                  <Text style={type.small}>{p.sub}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>{active && <View style={styles.radioDot} />}</View>
              </Pressable>
            );
          })}
        </View>

        {/* Xulosa */}
        <View style={styles.summary}>
          <Text style={[type.h3, { marginBottom: 10 }]}>Buyurtma tafsilotlari</Text>
          <SummaryRow label="Maydon" value={field.name} />
          <SummaryRow label="Sana" value={formatDateLong(dateKey)} />
          <SummaryRow label="Vaqt" value={start != null ? formatRange(start, duration) : '—'} />
          <SummaryRow label="Narx" value={`${formatPrice(field.price)} × ${duration}`} />
          <View style={styles.divider} />
          <SummaryRow label="Jami" value={formatPrice(total)} bold />
        </View>
        <Text style={[type.small, { textAlign: 'center', marginTop: 12, paddingHorizontal: 24 }]}>
          Bronni boshlanishidan 2 soat oldin bepul bekor qilishingiz mumkin.
        </Text>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={type.small}>Jami</Text>
          <Text style={styles.total}>{start != null ? formatPrice(total) : '—'}</Text>
        </View>
        <Button
          title={start != null ? 'Tasdiqlash' : 'Vaqtni tanlang'}
          icon="checkmark-circle"
          disabled={!selectionValid}
          loading={submitting}
          onPress={confirm}
          style={{ flex: 1, marginLeft: 16 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

function Step({ n, title, right }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{n}</Text>
      </View>
      <Text style={[type.h3, { flex: 1 }]}>{title}</Text>
      {right && <Text style={[type.small, { color: colors.success, fontWeight: '700' }]}>{right}</Text>}
    </View>
  );
}

function Legend({ color, border, label }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: color, borderWidth: border ? 1 : 0, borderColor: border }} />
      <Text style={[type.small, { marginLeft: 5, fontSize: 11 }]}>{label}</Text>
    </View>
  );
}

function Field({ icon, last, ...props }) {
  return (
    <View style={[styles.field, !last && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
      <Ionicons name={icon} size={19} color={colors.textLight} />
      <TextInput {...props} placeholderTextColor={colors.textLight} style={styles.input} />
    </View>
  );
}

function SummaryRow({ label, value, bold }) {
  return (
    <View style={styles.sumRow}>
      <Text style={[type.small, bold && { color: colors.text, fontSize: 15, fontWeight: '800' }]}>{label}</Text>
      <Text style={[type.label, bold && { color: colors.primary, fontSize: 17, fontWeight: '900' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    padding: 10,
    borderRadius: radius.lg,
    ...shadow,
  },
  venueImg: { width: 64, height: 64, borderRadius: 14 },
  step: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 24, marginBottom: 12 },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepNumText: { color: colors.white, fontWeight: '800', fontSize: 12 },
  fieldCard: {
    width: 150,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.white,
    ...shadow,
  },
  fieldActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  fieldPrice: { fontSize: 14, fontWeight: '800', color: colors.text, marginTop: 8 },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: 64,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayWeek: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  dayNum: { fontSize: 20, fontWeight: '900', color: colors.text, marginVertical: 2 },
  dayMonth: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  legend: { flexDirection: 'row', gap: 14, paddingHorizontal: 16, marginBottom: 10, flexWrap: 'wrap' },
  slots: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  slot: {
    width: '23%',
    marginHorizontal: '1%',
    marginBottom: 8,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBusy: { backgroundColor: '#E5E7EB', borderColor: '#E5E7EB' },
  slotPast: { backgroundColor: colors.bg, borderColor: colors.bg },
  slotMine: { backgroundColor: colors.blueSoft, borderColor: colors.blue },
  slotSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { fontSize: 14, fontWeight: '700', color: colors.text },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: radius.lg,
    ...shadow,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationValue: { fontSize: 15, fontWeight: '800', marginHorizontal: 14, minWidth: 54, textAlign: 'center' },
  form: { backgroundColor: colors.white, marginHorizontal: 16, borderRadius: radius.lg, paddingHorizontal: 14, ...shadow },
  field: { flexDirection: 'row', alignItems: 'center', height: 54 },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.text, height: '100%' },
  pay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.white,
    ...shadow,
  },
  payActive: { borderColor: colors.primary },
  payIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  summary: { backgroundColor: colors.white, margin: 16, marginTop: 24, padding: 16, borderRadius: radius.lg, ...shadow },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8, borderStyle: 'dashed' },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...shadow,
  },
  total: { fontSize: 18, fontWeight: '900', color: colors.primary },
});
