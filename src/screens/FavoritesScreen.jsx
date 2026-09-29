import React from 'react';
import { FlatList, View } from 'react-native';
import { EmptyState, ScreenHeader } from '../components/ui';
import { VenueListItem } from '../components/cards';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';
import { VENUES } from '../data/venues';
import { ICONS } from '../data/icons';

export default function FavoritesScreen({ navigation }) {
  const { favorites } = useApp();
  const data = favorites.map((id) => VENUES.find((v) => v.id === id)).filter(Boolean);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Sevimlilar" subtitle={`${data.length} ta majmua`} />
      <FlatList
        data={data}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
        renderItem={({ item }) => <VenueListItem venue={item} onPress={() => navigation.navigate('VenueDetail', { id: item.id })} />}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            image={ICONS.stadium}
            title="Sevimlilar bo'sh"
            text="Yoqqan majmualarni ♡ belgisi orqali saqlang — ular shu yerda chiqadi."
            actionLabel="Majmualarni ko'rish"
            onAction={() => navigation.navigate('Tabs', { screen: 'Venues' })}
          />
        }
      />
    </View>
  );
}
