import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import SmartImage from '../components/SmartImage';
import { Badge, Chip, ChipRow, ScreenHeader, EmptyState } from '../components/ui';
import { Meta, NewsCard } from '../components/cards';
import { colors, radius, shadow } from '../theme';
import { NEWS, NEWS_CATEGORIES } from '../data/news';
import { timeAgo } from '../utils/format';
import { ICONS } from '../data/icons';

export default function NewsScreen({ navigation }) {
  const [cat, setCat] = useState('Hammasi');
  const list = cat === 'Hammasi' ? NEWS : NEWS.filter((n) => n.category === cat);
  const [top, ...rest] = list;
  const open = (id) => navigation.navigate('NewsDetail', { id });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Yangiliklar" subtitle="Sport olamidagi so'nggi xabarlar" />
      <View>
        <ChipRow>
          {NEWS_CATEGORIES.map((c) => (
            <Chip key={c} label={c} active={c === cat} onPress={() => setCat(c)} />
          ))}
        </ChipRow>
      </View>
      <FlatList
        data={rest}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          top ? (
            <Pressable onPress={() => open(top.id)} style={styles.featured}>
              <SmartImage uri={top.image} style={styles.featuredImg} icon="bullhorn" fade>
                <View style={styles.featuredBody}>
                  <Badge label={top.category} color={colors.blue} />
                  <Text style={styles.featuredTitle} numberOfLines={3}>
                    {top.title}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 14, marginTop: 8 }}>
                    <Meta icon="time-outline" text={timeAgo(top.date)} light />
                    <Meta icon="book-outline" text={`${top.readTime} daq o'qish`} light />
                    <Meta icon="eye-outline" text={top.views} light />
                  </View>
                </View>
              </SmartImage>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => <NewsCard item={item} onPress={() => open(item.id)} />}
        ListEmptyComponent={!top ? <EmptyState icon="newspaper-outline" image={ICONS.megaphone} title="Yangiliklar yo'q" /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  featured: { borderRadius: radius.lg, ...shadow, marginBottom: 4 },
  featuredImg: { height: 240, borderRadius: radius.lg },
  featuredBody: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  featuredTitle: { color: colors.white, fontSize: 20, fontWeight: '900', marginTop: 8, lineHeight: 26 },
});
