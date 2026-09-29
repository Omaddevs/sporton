import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Chip, ChipRow, EmptyState, ScreenHeader, Segmented } from '../components/ui';
import { EventCard } from '../components/cards';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';
import { EVENTS } from '../data/events';
import { SPORT_TYPES } from '../data/sports';
import { ICONS } from '../data/icons';

export default function EventsScreen({ navigation }) {
  const { registeredEvents } = useApp();
  const [sport, setSport] = useState('all');
  const [mode, setMode] = useState('all');

  const usedSports = SPORT_TYPES.filter((s) => EVENTS.some((e) => e.sport === s.id));
  const data = EVENTS.filter((e) => sport === 'all' || e.sport === sport)
    .filter((e) => mode === 'all' || (mode === 'mine' ? registeredEvents.includes(e.id) : e.price === 0))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Sport tadbirlari" subtitle="Turnirlar, marafonlar va festivallar" />
      <Segmented
        options={[
          { value: 'all', label: 'Hammasi' },
          { value: 'free', label: 'Bepul' },
          { value: 'mine', label: `Mening (${registeredEvents.length})` },
        ]}
        value={mode}
        onChange={setMode}
        style={{ marginHorizontal: 16, marginBottom: 12 }}
      />
      <View>
        <ChipRow>
          <Chip label="Hammasi" active={sport === 'all'} onPress={() => setSport('all')} />
          {usedSports.map((s) => (
            <Chip key={s.id} label={s.name} icon={s.icon} iconSet={MaterialCommunityIcons} active={sport === s.id} onPress={() => setSport(s.id)} />
          ))}
        </ChipRow>
      </View>
      <FlatList
        data={data}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <EventCard event={item} onPress={() => navigation.navigate('EventDetail', { id: item.id })} />}
        ListEmptyComponent={<EmptyState icon="trophy-outline" image={ICONS.trophy} title="Tadbirlar topilmadi" text="Boshqa filtrni tanlab ko'ring" />}
      />
    </View>
  );
}
