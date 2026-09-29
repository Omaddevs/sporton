import React, { useCallback } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { EmptyState, ScreenHeader } from '../components/ui';
import { colors, radius, shadow, type } from '../theme';
import { useApp } from '../context/AppContext';
import { timeAgo } from '../utils/format';

export default function NotificationsScreen() {
  const { notifications, readAllNotifications, clearNotifications } = useApp();

  // Ekrandan chiqilganda (stack'da ham, tab'da ham) hammasini o'qilgan deb belgilaymiz
  useFocusEffect(useCallback(() => () => readAllNotifications(), [readAllNotifications]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader
        title="Bildirishnomalar"
        subtitle={`${notifications.filter((n) => !n.read).length} ta yangi`}
        right={
          notifications.length > 0 ? (
            <Pressable
              hitSlop={10}
              onPress={() =>
                Alert.alert('Tozalash', 'Barcha bildirishnomalar o\'chirilsinmi?', [
                  { text: 'Yo\'q', style: 'cancel' },
                  { text: 'Ha', style: 'destructive', onPress: clearNotifications },
                ])
              }
            >
              <Text style={{ color: colors.primary, fontWeight: '700' }}>Tozalash</Text>
            </Pressable>
          ) : null
        }
      />
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState icon="notifications-off-outline" title="Bildirishnomalar yo'q" text="Yangi xabarlar shu yerda paydo bo'ladi." />}
        renderItem={({ item }) => (
          <View style={[styles.item, !item.read && styles.unread]}>
            <View style={[styles.icon, !item.read && { backgroundColor: colors.primary }]}>
              <Ionicons name={item.icon || 'notifications-outline'} size={20} color={item.read ? colors.primary : colors.white} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={type.label}>{item.title}</Text>
              <Text style={[type.small, { marginTop: 3, lineHeight: 18 }]}>{item.text}</Text>
              <Text style={[type.small, { marginTop: 6, fontSize: 11, color: colors.textLight }]}>{timeAgo(item.date)}</Text>
            </View>
            {!item.read && <View style={styles.dot} />}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', backgroundColor: colors.white, padding: 14, borderRadius: radius.md, ...shadow },
  unread: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  icon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary, marginTop: 4 },
});
