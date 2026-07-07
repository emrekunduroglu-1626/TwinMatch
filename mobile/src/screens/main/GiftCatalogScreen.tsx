import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { MainStackParamList } from '../../navigation/types';
import { GiftCategory, useGiftStore } from '../../store/giftStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'GiftCatalog'>;

const categories: GiftCategory[] = ['Çiçek', 'Çikolata', 'Kahve', 'Kitap', 'Peluş', 'Mum', 'Kozmetik', 'Kupa', 'Aksesuar', 'Özel Gün'];

export function GiftCatalogScreen({ navigation }: Props) {
  const catalog = useGiftStore((state) => state.catalog);
  const [selectedCategory, setSelectedCategory] = useState<GiftCategory | null>(null);

  const filteredCatalog = useMemo(
    () => (selectedCategory ? catalog.filter((item) => item.category === selectedCategory) : catalog),
    [catalog, selectedCategory],
  );

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Body style={styles.eyebrow}>Hediye kataloğu</Body>
          <Title>Anonim hediye seç</Title>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          <Pressable
            style={[styles.categoryChip, selectedCategory === null && styles.categoryChipSelected]}
            onPress={() => setSelectedCategory(null)}
          >
            <Body style={selectedCategory === null ? styles.categoryTextSelected : styles.categoryText}>Tümü</Body>
          </Pressable>
          {categories.map((category) => {
            const selected = selectedCategory === category;
            return (
              <Pressable
                key={category}
                style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                onPress={() => setSelectedCategory(category)}
              >
                <Body style={selected ? styles.categoryTextSelected : styles.categoryText}>{category}</Body>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.grid}>
          {filteredCatalog.map((product) => (
            <Pressable
              key={product.id}
              style={styles.productCard}
              onPress={() => navigation.navigate('GiftDetail', { productId: product.id })}
            >
              <View style={styles.productImage}>
                <Body style={styles.productImageText}>{product.image}</Body>
              </View>
              <View style={[styles.tierBadge, product.tier === 'Platinum' ? styles.platinumBadge : styles.goldBadge]}>
                <Body style={styles.tierBadgeText}>{product.tier}</Body>
              </View>
              <Body style={styles.productName}>{product.name}</Body>
              <Body>Ürün: {product.price} TL</Body>
              <Body>Hizmet bedeli: {product.serviceFee} TL</Body>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    paddingBottom: 24,
  },
  header: {
    gap: 12,
    marginTop: 24,
  },
  eyebrow: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  categoryRow: {
    gap: 10,
    paddingRight: 12,
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.text,
  },
  categoryTextSelected: {
    color: colors.text,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  productCard: {
    width: '47%',
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  productImage: {
    height: 100,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  productImageText: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  goldBadge: {
    backgroundColor: colors.gold,
  },
  platinumBadge: {
    backgroundColor: colors.platinum,
  },
  tierBadgeText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 12,
  },
  productName: {
    color: colors.text,
    fontWeight: '700',
  },
});
