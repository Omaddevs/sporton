import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/ui';
import { colors, radius } from '../theme';
import { useApp } from '../context/AppContext';
import { DISTRICTS } from '../data/sports';

export default function LocationScreen({ navigation }) {
  const { location, setLocation } = useApp();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Manzilni tanlang" subtitle="Toshkent shahri" />
      <FlatList
        data={DISTRICTS}
        keyExtractor={(d) => d}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        renderItem={({ item, index }) => {
          const active = item === location;
          return (
            <Pressable
              onPress={() => {
                setLocation(item);
                navigation.goBack();
              }}
              style={[
                styles.row,
                index === 0 && { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
                index === DISTRICTS.length - 1 && { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg, borderBottomWidth: 0 },
              ]}
            >
              <Ionicons name={active ? 'location' : 'location-outline'} size={20} color={active ? colors.primary : colors.textLight} />
              <Text style={[styles.text, active && { color: colors.primary, fontWeight: '800' }]}>{item}</Text>
              {active && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  text: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600', color: colors.text },
});
