import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { colors, gradients, radius, shadow, type } from '../theme';
import { useApp } from '../context/AppContext';
import { initials } from '../utils/format';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, location, bookings, completedWorkouts, registeredEvents, favorites, notifications, reset } = useApp();
  const unread = notifications.filter((n) => !n.read).length;
  const activeBookings = bookings.filter((b) => b.status === 'active').length;

  const menu = [
    {
      title: 'Faoliyat',
      items: [
        { icon: 'calendar-outline', label: 'Bronlarim', value: activeBookings || null, onPress: () => navigation.navigate('Bookings') },
        { icon: 'heart-outline', label: 'Sevimli majmualar', value: favorites.length || null, onPress: () => navigation.navigate('Favorites') },
        { icon: 'trophy-outline', label: 'Tadbirlarim', value: registeredEvents.length || null, onPress: () => navigation.navigate('Events') },
        { icon: 'barbell-outline', label: 'Mashg\'ulotlar tarixi', value: completedWorkouts.length || null, onPress: () => navigation.navigate('Workouts') },
      ],
    },
    {
      title: 'Sozlamalar',
      items: [
        { icon: 'person-outline', label: 'Shaxsiy ma\'lumotlar', onPress: () => navigation.navigate('EditProfile') },
        { icon: 'location-outline', label: 'Manzil', value: location, onPress: () => navigation.navigate('Location') },
        { icon: 'notifications-outline', label: 'Bildirishnomalar', value: unread || null, onPress: () => navigation.navigate('Notifications') },
        { icon: 'language-outline', label: 'Til', value: 'O\'zbekcha', onPress: () => Alert.alert('Til', 'Rus va ingliz tillari tez orada qo\'shiladi.') },
      ],
    },
    {
      title: 'Yordam',
      items: [
        { icon: 'business-outline', label: 'Majmuangizni qo\'shing', onPress: () => Alert.alert('Hamkorlik', 'Sport majmuangizni SportON\'ga qo\'shish uchun: partners@sporton.uz') },
        { icon: 'help-circle-outline', label: 'Yordam markazi', onPress: () => Linking.openURL('tel:+998712000000') },
        { icon: 'information-circle-outline', label: 'Ilova haqida', value: 'v1.0.0', onPress: () => Alert.alert('SportON', 'Sport super app — majmualar, bron, mashg\'ulotlar, tadbirlar va yangiliklar bir joyda.') },
        {
          icon: 'refresh-outline',
          label: 'Ma\'lumotlarni tozalash',
          danger: true,
          onPress: () =>
            Alert.alert('Tozalash', 'Barcha bronlar, sevimlilar va natijalar o\'chiriladi. Davom etasizmi?', [
              { text: 'Bekor', style: 'cancel' },
              { text: 'Tozalash', style: 'destructive', onPress: reset },
            ]),
        },
      ],
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={gradients.primary} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <Logo size={22} light />
          <Pressable onPress={() => navigation.navigate('EditProfile')} style={styles.editBtn}>
            <Ionicons name="create-outline" size={18} color={colors.white} />
          </Pressable>
        </View>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user.name)}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.phone}>{user.phone}</Text>
            <View style={styles.level}>
              <Ionicons name="flash" size={12} color={colors.primary} />
              <Text style={styles.levelText}>{completedWorkouts.length >= 10 ? 'Sport ustasi' : completedWorkouts.length >= 3 ? 'Faol sportchi' : 'Yangi sportchi'}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.stats}>
        <Stat value={bookings.length} label="Bronlar" />
        <View style={styles.statSep} />
        <Stat value={completedWorkouts.length} label="Mashg'ulot" />
        <View style={styles.statSep} />
        <Stat value={completedWorkouts.reduce((s, c) => s + c.calories, 0)} label="Kkal" />
      </View>

      {menu.map((section) => (
        <View key={section.title} style={{ marginTop: 22 }}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.menu}>
            {section.items.map((it, i) => (
              <Pressable
                key={it.label}
                onPress={it.onPress}
                style={({ pressed }) => [styles.item, i < section.items.length - 1 && styles.itemBorder, pressed && { backgroundColor: colors.bg }]}
              >
                <View style={[styles.itemIcon, it.danger && { backgroundColor: colors.dangerSoft }]}>
                  <Ionicons name={it.icon} size={19} color={it.danger ? colors.danger : colors.primary} />
                </View>
                <Text style={[styles.itemLabel, it.danger && { color: colors.danger }]}>{it.label}</Text>
                {it.value != null && (
                  <Text style={[type.small, { marginRight: 6, maxWidth: 130 }]} numberOfLines={1}>
                    {it.value}
                  </Text>
                )}
                <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function Stat({ value, label }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>{value}</Text>
      <Text style={type.small}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 56, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  editBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: 26, fontWeight: '900', color: colors.primary },
  name: { color: colors.white, fontSize: 22, fontWeight: '900' },
  phone: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 2 },
  level: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  levelText: { color: colors.primary, fontSize: 11, fontWeight: '800', marginLeft: 4 },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: -32,
    borderRadius: radius.lg,
    paddingVertical: 16,
    ...shadow,
  },
  statSep: { width: 1, height: 32, backgroundColor: colors.border },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, paddingHorizontal: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  menu: { backgroundColor: colors.white, marginHorizontal: 16, borderRadius: radius.lg, overflow: 'hidden', ...shadow },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 58 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  itemIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600', color: colors.text },
});
