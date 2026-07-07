import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { useGiftStore } from '../../store/giftStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'GiftDetail'>;

export function GiftDetailScreen({ navigation, route }: Props) {
  const product = useGiftStore((state) => state.catalog.find((item) => item.id === route.params.productId));

  if (!product) {
    return (
      <Screen>
        <View style={styles.emptyState}>
          <Title>Ürün bulunamadı</Title>
          <Button title="Kataloğa dön" onPress={() => navigation.navigate('GiftCatalog')} />
        </View>
      </Screen>
    );
  }

  const total = product.price + product.serviceFee;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.imageBox}>
          <Body style={styles.imageText}>{product.image}</Body>
        </View>

        <View style={styles.header}>
          <View style={[styles.tierBadge, product.tier === 'Platinum' ? styles.platinumBadge : styles.goldBadge]}>
            <Body style={styles.tierBadgeText}>{product.tier}</Body>
          </View>
          <Title>{product.name}</Title>
          <Body>{product.description}</Body>
        </View>

        <View style={styles.priceCard}>
          <Body style={styles.sectionTitle}>Fiyat detayı</Body>
          <View style={styles.priceRow}>
            <Body>Ürün fiyatı</Body>
            <Body>{product.price} TL</Body>
          </View>
          <View style={styles.priceRow}>
            <Body>Anonim Güvenli Teslimat Hizmet Bedeli</Body>
            <Body>{product.serviceFee} TL</Body>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Body style={styles.totalLabel}>Toplam</Body>
            <Body style={styles.totalLabel}>{total} TL</Body>
          </View>
        </View>

        <Button title="Hediye Gönder" onPress={() => navigation.navigate('GiftCheckout', { productId: product.id })} />
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  imageBox: {
    marginTop: 24,
    height: 220,
    borderRadius: 24,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    gap: 10,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  priceCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  totalLabel: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
});
