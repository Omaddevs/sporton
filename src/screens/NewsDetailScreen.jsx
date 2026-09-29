import React from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import Text from '../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SmartImage from '../components/SmartImage';
import { Badge, EmptyState, IconButton } from '../components/ui';
import { Meta, NewsCard } from '../components/cards';
import { colors, type } from '../theme';
import { getNews, NEWS } from '../data/news';
import { formatDateLong } from '../utils/format';

export default function NewsDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const item = getNews(route.params?.id);
  if (!item) return <EmptyState title="Maqola topilmadi" actionLabel="Orqaga" onAction={() => navigation.goBack()} />;
  const related = NEWS.filter((n) => n.id !== item.id).slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <SmartImage uri={item.image} style={{ height: 280 }} icon="bullhorn" iconSize={64}>
          <View style={[styles.bar, { top: insets.top + 8 }]}>
            <IconButton name="chevron-back" onPress={() => navigation.goBack()} />
            <IconButton name="share-social-outline" onPress={() => Share.share({ message: `${item.title} — SportON yangiliklari` })} />
          </View>
        </SmartImage>
        <View style={styles.body}>
          <Badge label={item.category} color={colors.blue} bg={colors.blueSoft} />
          <Text style={[type.h1, { marginTop: 12, lineHeight: 31 }]}>{item.title}</Text>
          <View style={{ flexDirection: 'row', gap: 14, marginTop: 10 }}>
            <Meta icon="calendar-outline" text={formatDateLong(item.date)} />
            <Meta icon="book-outline" text={`${item.readTime} daq`} />
            <Meta icon="eye-outline" text={item.views} />
          </View>
          <View style={styles.divider} />
          {item.body.map((p, i) => (
            <Text key={i} style={[type.body, styles.p]}>
              {p}
            </Text>
          ))}
        </View>
        <Text style={[type.h2, { paddingHorizontal: 16, marginTop: 12, marginBottom: 12 }]}>O'xshash yangiliklar</Text>
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          {related.map((n) => (
            <NewsCard key={n.id} item={n} onPress={() => navigation.push('NewsDetail', { id: n.id })} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  body: { backgroundColor: colors.white, marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 18 },
  p: { fontSize: 16, lineHeight: 26, marginBottom: 14, color: '#374151' },
});
