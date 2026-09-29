import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Linking, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import Text from '../AppText';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../ui';
import { colors, radius, type } from '../../theme';

const BENEFITS = [
  { icon: 'navigate', text: 'Sizga eng yaqin majmualar birinchi chiqadi' },
  { icon: 'time-outline', text: 'Har bir joygacha masofa va yo\'l vaqti' },
  { icon: 'shield-checkmark-outline', text: 'Joylashuvingiz hech kimga uzatilmaydi' },
];

/**
 * Geolokatsiyani yoqishni so'raydigan pastki oyna.
 * status: idle | loading | denied | unavailable — har biriga mos matn va tugma.
 */
export default function LocationPermissionSheet({ visible, status, canAskAgain, onAllow, onClose }) {
  const insets = useSafeAreaInsets();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: Platform.OS !== 'web' })
    );
    loop.start();
    return () => loop.stop();
  }, [visible, pulse]);

  const denied = status === 'denied';
  const unavailable = status === 'unavailable';
  const loading = status === 'loading';
  const blocked = denied && (!canAskAgain || Platform.OS === 'web');

  const title = denied ? 'Joylashuvga ruxsat berilmagan' : unavailable ? 'Joylashuvni aniqlab bo\'lmadi' : 'Yaqin atrofdagi majmualarni toping';
  const text = blocked
    ? Platform.OS === 'web'
      ? 'Brauzer manzil qatoridagi 🔒 belgisini bosing va «Joylashuv» uchun ruxsat bering, so\'ng qayta urinib ko\'ring.'
      : 'Telefon sozlamalarida SportON ilovasi uchun joylashuvga ruxsat bering.'
    : unavailable
      ? 'Qurilmada GPS o\'chiq yoki signal yo\'q. Joylashuv xizmatini yoqib, qayta urinib ko\'ring.'
      : 'Geolokatsiyani yoqing — xaritada turgan joyingizni va sizga eng yaqin sport majmualarini ko\'rsatamiz.';

  const ring = (delay) => ({
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6 + delay, 1.35 + delay] }) }],
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Yopish" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.handle} />
          <Pressable onPress={onClose} hitSlop={10} style={styles.close} accessibilityLabel="Yopish">
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </Pressable>

          <View style={styles.hero}>
            <Animated.View style={[styles.ring, ring(0)]} />
            <Animated.View style={[styles.ring, ring(0.25)]} />
            <View style={[styles.core, (denied || unavailable) && { backgroundColor: colors.danger }]}>
              <Ionicons name={denied || unavailable ? 'location-outline' : 'location'} size={34} color={colors.white} />
            </View>
          </View>

          <Text style={[type.h2, { textAlign: 'center' }]}>{title}</Text>
          <Text style={[type.body, styles.text]}>{text}</Text>

          {!denied && !unavailable && (
            <View style={styles.benefits}>
              {BENEFITS.map((b) => (
                <View key={b.icon} style={styles.benefit}>
                  <View style={styles.benefitIcon}>
                    <Ionicons name={b.icon} size={16} color={colors.primary} />
                  </View>
                  <Text style={[type.label, { flex: 1 }]}>{b.text}</Text>
                </View>
              ))}
            </View>
          )}

          {blocked && Platform.OS !== 'web' ? (
            <Button title="Sozlamalarni ochish" icon="settings-outline" onPress={() => Linking.openSettings()} />
          ) : (
            <Button
              title={denied || unavailable ? 'Qayta urinish' : 'Joylashuvni yoqish'}
              icon={denied || unavailable ? 'refresh' : 'navigate'}
              loading={loading}
              onPress={onAllow}
            />
          )}
          <Pressable onPress={onClose} style={styles.later} hitSlop={6}>
            <Text style={styles.laterText}>Hozir emas</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 6 },
  close: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  hero: { height: 150, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 6 },
  ring: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: colors.primary },
  core: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: colors.white,
  },
  text: { textAlign: 'center', color: colors.textMuted, marginTop: 8, marginBottom: 18, paddingHorizontal: 6 },
  benefits: { backgroundColor: colors.bg, borderRadius: radius.lg, padding: 14, gap: 12, marginBottom: 20 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  later: { alignSelf: 'center', paddingVertical: 14 },
  laterText: { fontSize: 14, fontWeight: '700', color: colors.textMuted },
});
