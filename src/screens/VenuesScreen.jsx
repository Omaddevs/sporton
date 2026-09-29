import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import Text, { TextInput } from '../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Chip, ChipRow, EmptyState, IconButton, ScreenHeader, Segmented } from '../components/ui';
import { VenueCard, VenueListItem } from '../components/cards';
import { colors, radius, shadow, type } from '../theme';
import { useApp } from '../context/AppContext';
import { useLayout } from '../hooks/useLayout';
import { VENUES, districtCounts, isOpenNow, minPrice } from '../data/venues';
import { AMENITIES, SPORT_TYPES } from '../data/sports';
import { formatPrice } from '../utils/format';

const SORTS = [
  { value: 'distance', label: 'Yaqin' },
  { value: 'rating', label: 'Reyting' },
  { value: 'price', label: 'Arzon' },
];

const PRICE_CAPS = [
  { value: 0, label: 'Hammasi' },
  { value: 100000, label: '≤ 100 ming' },
  { value: 200000, label: '≤ 200 ming' },
  { value: 300000, label: '≤ 300 ming' },
];

const DEFAULT_FILTERS = { districts: [], maxPrice: 0, openNow: false, amenities: [] };

const applyFilters = (list, { sport, query, filters }) => {
  const q = query.trim().toLowerCase();
  return list
    .filter((v) => sport === 'all' || v.type === sport)
    .filter((v) => !q || `${v.name} ${v.district} ${v.address}`.toLowerCase().includes(q))
    .filter((v) => !filters.districts.length || filters.districts.includes(v.district))
    .filter((v) => !filters.maxPrice || minPrice(v) <= filters.maxPrice)
    .filter((v) => !filters.openNow || isOpenNow(v))
    .filter((v) => !filters.amenities.length || filters.amenities.every((a) => v.amenities.includes(a)));
};

const countActive = (f) => f.districts.length + (f.maxPrice ? 1 : 0) + (f.openNow ? 1 : 0) + f.amenities.length;

export default function VenuesScreen({ navigation, route }) {
  const { favorites } = useApp();
  const { isDesktop, contentWidth, colWidth } = useLayout();
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState(route.params?.type || 'all');
  const [sort, setSort] = useState('distance');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (route.params?.type) setSport(route.params.type);
  }, [route.params?.type]);

  const data = useMemo(
    () =>
      applyFilters(VENUES, { sport, query, filters }).sort((a, b) => {
        if (sort === 'rating') return b.rating - a.rating || a.distance - b.distance;
        if (sort === 'price') return minPrice(a) - minPrice(b) || a.distance - b.distance;
        return a.distance - b.distance;
      }),
    [query, sport, sort, filters]
  );

  const activeCount = countActive(filters);
  const hasAnyFilter = activeCount > 0 || sport !== 'all' || !!query;
  const sportName = sport === 'all' ? null : SPORT_TYPES.find((s) => s.id === sport)?.name;

  const resetAll = () => {
    setQuery('');
    setSport('all');
    setFilters(DEFAULT_FILTERS);
  };

  const container = isDesktop ? { width: contentWidth, alignSelf: 'center' } : null;
  const cols = isDesktop ? (contentWidth >= 1100 ? 4 : 3) : 1;
  const cardW = isDesktop ? colWidth(cols) : undefined;

  const header = (
    <View style={container}>
      <ScreenHeader
        title="Sport majmualari"
        subtitle={`${data.length} ta joy topildi${sportName ? ` · ${sportName}` : ''}`}
        right={
          <IconButton
            name={favorites.length ? 'heart' : 'heart-outline'}
            color={favorites.length ? colors.danger : colors.text}
            badge={favorites.length}
            label="Sevimlilar"
            onPress={() => navigation.navigate('Favorites')}
            style={shadow}
          />
        }
      />

      {/* Qidiruv + filtr */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={19} color={colors.textLight} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Nomi, tumani yoki manzili"
            placeholderTextColor={colors.textLight}
            style={styles.input}
            returnKeyType="search"
            accessibilityLabel="Majmua qidirish"
          />
          {!!query && (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Tozalash">
              <Ionicons name="close-circle" size={19} color={colors.textLight} />
            </Pressable>
          )}
        </View>
        <IconButton
          name="options-outline"
          dim={50}
          label="Filtrlar"
          badge={activeCount}
          bg={activeCount ? colors.primary : colors.white}
          color={activeCount ? colors.white : colors.text}
          onPress={() => setFilterOpen(true)}
          style={[styles.filterBtn, shadow]}
        />
      </View>

      {/* Sport turlari */}
      <View style={{ marginTop: 14 }}>
        <ChipRow style={isDesktop ? { paddingHorizontal: 0 } : null}>
          <Chip label="Hammasi" icon="apps" active={sport === 'all'} onPress={() => setSport('all')} />
          {SPORT_TYPES.map((s) => (
            <Chip
              key={s.id}
              label={s.name}
              icon={s.icon}
              iconSet={MaterialCommunityIcons}
              activeColor={s.color}
              active={sport === s.id}
              onPress={() => setSport(s.id)}
            />
          ))}
        </ChipRow>
      </View>

      <Segmented options={SORTS} value={sort} onChange={setSort} style={[{ marginTop: 12 }, isDesktop ? null : { marginHorizontal: 16 }]} />

      {/* Faol filtrlar */}
      {activeCount > 0 && (
        <ChipRow style={[{ paddingTop: 12, paddingBottom: 2 }, isDesktop ? { paddingHorizontal: 0 } : null]}>
          {filters.openNow && (
            <RemovableChip label="Hozir ochiq" onRemove={() => setFilters((f) => ({ ...f, openNow: false }))} />
          )}
          {!!filters.maxPrice && (
            <RemovableChip label={`≤ ${formatPrice(filters.maxPrice)}`} onRemove={() => setFilters((f) => ({ ...f, maxPrice: 0 }))} />
          )}
          {filters.districts.map((d) => (
            <RemovableChip
              key={d}
              label={d.replace(' tumani', '')}
              onRemove={() => setFilters((f) => ({ ...f, districts: f.districts.filter((x) => x !== d) }))}
            />
          ))}
          {filters.amenities.map((a) => (
            <RemovableChip
              key={a}
              label={AMENITIES[a].label}
              onRemove={() => setFilters((f) => ({ ...f, amenities: f.amenities.filter((x) => x !== a) }))}
            />
          ))}
          <Pressable onPress={() => setFilters(DEFAULT_FILTERS)} style={styles.clearAll} hitSlop={6}>
            <Text style={styles.clearAllText}>Tozalash</Text>
          </Pressable>
        </ChipRow>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {header}

      <FlatList
        key={`cols-${cols}`}
        data={data}
        numColumns={cols}
        keyExtractor={(v) => v.id}
        contentContainerStyle={[{ padding: 16, gap: 12, paddingBottom: 32, flexGrow: 1 }, isDesktop && { paddingHorizontal: 0, gap: 20, width: contentWidth, alignSelf: 'center' }]}
        columnWrapperStyle={cols > 1 ? { gap: 20 } : undefined}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) =>
          isDesktop ? (
            <VenueCard
              venue={item}
              width={cardW}
              onPress={() => navigation.navigate('VenueDetail', { id: item.id })}
              onBook={() => navigation.navigate('Booking', { venueId: item.id })}
            />
          ) : (
            <VenueListItem venue={item} onPress={() => navigation.navigate('VenueDetail', { id: item.id })} />
          )
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="Hech narsa topilmadi"
            text={hasAnyFilter ? 'Filtrlarni yumshating yoki boshqa kalit so\'zni sinab ko\'ring' : 'Hozircha majmualar yo\'q'}
            actionLabel={hasAnyFilter ? 'Filtrlarni tozalash' : undefined}
            onAction={resetAll}
          />
        }
      />

      <FilterSheet
        visible={filterOpen}
        initial={filters}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setFilters(f);
          setFilterOpen(false);
        }}
        preview={(f) => applyFilters(VENUES, { sport, query, filters: f }).length}
      />
    </View>
  );
}

function RemovableChip({ label, onRemove }) {
  return (
    <Pressable onPress={onRemove} style={styles.removable} accessibilityLabel={`${label} filtrini olib tashlash`}>
      <Text style={styles.removableText}>{label}</Text>
      <Ionicons name="close" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
    </Pressable>
  );
}

/* ---------------- Filtr paneli (pastdan chiqadigan) ---------------- */
function FilterSheet({ visible, initial, onClose, onApply, preview }) {
  const insets = useSafeAreaInsets();
  const { isDesktop } = useLayout();
  const [draft, setDraft] = useState(initial);
  const counts = useMemo(districtCounts, []);
  const districts = useMemo(() => Object.keys(counts).sort((a, b) => counts[b] - counts[a]), [counts]);

  useEffect(() => {
    if (visible) setDraft(initial);
  }, [visible, initial]);

  const toggleIn = (key, value) =>
    setDraft((d) => ({ ...d, [key]: d[key].includes(value) ? d[key].filter((x) => x !== value) : [...d[key], value] }));

  const results = preview(draft);
  const active = countActive(draft);

  return (
    <Modal visible={visible} transparent animationType={isDesktop ? 'fade' : 'slide'} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Yopish" />
        <View style={[styles.sheet, isDesktop && styles.sheetDesktop, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.grabber} />
          <View style={styles.sheetHead}>
            <Text style={type.h2}>Filtrlar</Text>
            <IconButton name="close" dim={36} size={20} bg={colors.surface} onPress={onClose} label="Yopish" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
            {/* Hozir ochiq */}
            <View style={styles.switchRow}>
              <View style={styles.switchIcon}>
                <Ionicons name="time-outline" size={18} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={type.label}>Hozir ochiq</Text>
                <Text style={type.small}>Faqat shu daqiqada ishlayotganlar</Text>
              </View>
              <Switch
                value={draft.openNow}
                onValueChange={(v) => setDraft((d) => ({ ...d, openNow: v }))}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={colors.white}
              />
            </View>

            {/* Narx */}
            <Text style={styles.sheetLabel}>Soatlik narx</Text>
            <View style={styles.wrap}>
              {PRICE_CAPS.map((p) => (
                <Chip key={p.value} label={p.label} active={draft.maxPrice === p.value} onPress={() => setDraft((d) => ({ ...d, maxPrice: p.value }))} />
              ))}
            </View>

            {/* Tuman */}
            <Text style={styles.sheetLabel}>Tuman</Text>
            <View style={styles.wrap}>
              {districts.map((d) => (
                <Chip
                  key={d}
                  label={d.replace(' tumani', '')}
                  count={counts[d]}
                  active={draft.districts.includes(d)}
                  onPress={() => toggleIn('districts', d)}
                />
              ))}
            </View>

            {/* Qulayliklar */}
            <Text style={styles.sheetLabel}>Qulayliklar</Text>
            <View style={styles.wrap}>
              {Object.keys(AMENITIES).map((a) => (
                <Chip
                  key={a}
                  label={AMENITIES[a].label}
                  icon={AMENITIES[a].icon}
                  iconSet={MaterialCommunityIcons}
                  active={draft.amenities.includes(a)}
                  onPress={() => toggleIn('amenities', a)}
                />
              ))}
            </View>
          </ScrollView>

          <View style={styles.sheetFoot}>
            <Button
              title="Tozalash"
              variant="outline"
              size="md"
              disabled={!active}
              onPress={() => setDraft(DEFAULT_FILTERS)}
              style={{ paddingHorizontal: 22 }}
            />
            <Button
              title={results ? `${results} ta natijani ko'rsatish` : 'Natija yo\'q'}
              size="md"
              disabled={!results}
              onPress={() => onApply(draft)}
              style={{ flex: 1, marginLeft: 12 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 50,
    ...shadow,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: colors.text, height: '100%' },
  filterBtn: { borderRadius: radius.md },
  removable: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  removableText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  clearAll: { height: 32, justifyContent: 'center', paddingHorizontal: 6 },
  clearAllText: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textDecorationLine: 'underline' },

  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: 16,
    maxHeight: '88%',
  },
  sheetDesktop: {
    alignSelf: 'center',
    width: 560,
    borderRadius: radius.xxl,
    marginBottom: 40,
    maxHeight: '86%',
  },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, alignSelf: 'center', marginTop: 10 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  sheetLabel: { ...type.label, fontSize: 14, marginTop: 18, marginBottom: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 12,
    gap: 12,
    ...shadow,
  },
  switchIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' },
  sheetFoot: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
});
