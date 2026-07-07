import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { MainStackParamList } from '../../navigation/types';
import { GiftOrderStatus, useGiftStore } from '../../store/giftStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'GiftTracking'>;

const statusOrder: GiftOrderStatus[] = ['Onay Bekliyor', 'Hazırlanıyor', 'Yola Çıktı', 'Teslim Edildi'];

function getProgress(status: GiftOrderStatus) {
  const index = statusOrder.indexOf(status);
  return ((index + 1) / statusOrder.length) * 100;
}

export function GiftTrackingScreen({ }: Props) {
  const orders = useGiftStore((state) => state.orders);
  const [tab, setTab] = useState<'sent' | 'received'>('sent');

  const filteredOrders = orders.filter((order) => order.direction === tab);

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Body style={styles.eyebrow}>Hediye takibi</Body>
          <Title>Siparişlerin</Title>
        </View>

        <View style={styles.tabRow}>
          <Pressable style={[styles.tabButton, tab === 'sent' && styles.tabButtonActive]} onPress={() => setTab('sent')}>
            <Body style={tab === 'sent' ? styles.tabTextActive : styles.tabText}>Gönderilen</Body>
          </Pressable>
          <Pressable style={[styles.tabButton, tab === 'received' && styles.tabButtonActive]} onPress={() => setTab('received')}>
            <Body style={tab === 'received' ? styles.tabTextActive : styles.tabText}>Alınan</Body>
          </Pressable>
        </View>

        <View style={styles.list}>
          {filteredOrders.length === 0 ? (
            <Body>Bu kategoride sipariş bulunmuyor.</Body>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.imageBox}>
                    <Body style={styles.imageText}>{order.image || order.productName}</Body>
                  </View>
                  <View style={styles.cardInfo}>
                    <Body style={styles.productName}>{order.productName}</Body>
                    <Body>{tab === 'sent' ? `Alıcı: ${order.counterpartName}` : `Gönderen: ${order.counterpartName}`}</Body>
                  </View>
                </View>

                <Body style={styles.statusText}>{order.status}</Body>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${getProgress(order.status)}%` }]} />
                </View>

                {order.direction === 'received' && (
                  <Body style={styles.privacyNote}>
                    Gönderen adres, telefon, teslimat saati ve kargo detaylarını göremezsin.
                  </Body>
                )}
              </View>
            ))
          )}
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
  tabRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tabButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.text,
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  list: {
    gap: 16,
  },
  card: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  imageBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  productName: {
    color: colors.text,
    fontWeight: '700',
  },
  statusText: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  privacyNote: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
