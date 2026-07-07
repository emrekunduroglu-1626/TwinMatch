import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { MainStackParamList } from '../../navigation/types';
import { useGiftStore } from '../../store/giftStore';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'GiftCheckout'>;

export function GiftCheckoutScreen({ navigation, route }: Props) {
  const product = useGiftStore((state) => state.catalog.find((item) => item.id === route.params.productId));
  const sendGift = useGiftStore((state) => state.sendGift);
  const discoveryProfiles = useSetupStore((state) => state.discoveryProfiles);

  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(discoveryProfiles[0]?.id ?? null);
  const [note, setNote] = useState('');

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
  const recipient = discoveryProfiles.find((profile) => profile.id === selectedRecipientId);

  const handlePayment = async () => {
    if (!recipient) {
      Alert.alert('Alıcı seç', 'Devam etmek için bir eşleşme seç.');
      return;
    }

    await sendGift(product.id, recipient.name, note || undefined);

    navigation.navigate('Success', {
      title: 'Hediye isteğiniz gönderildi!',
      description: 'Alıcı kabul ettiğinde sipariş oluşturulacak.',
      ctaLabel: 'Hediye takibine git',
      targetScreen: 'GiftTracking',
    });
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Body style={styles.eyebrow}>Hediye ödeme</Body>
          <Title>{product.name}</Title>
        </View>

        <View style={styles.section}>
          <Body style={styles.sectionTitle}>Alıcı seç</Body>
          {discoveryProfiles.map((profile) => {
            const selected = selectedRecipientId === profile.id;
            return (
              <Pressable
                key={profile.id}
                style={[styles.recipientCard, selected && styles.recipientCardSelected]}
                onPress={() => setSelectedRecipientId(profile.id)}
              >
                <Body style={selected ? styles.enabledText : styles.recipientName}>
                  {profile.name}, {profile.age}
                </Body>
                <Body>{profile.city}</Body>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.section}>
          <Body style={styles.sectionTitle}>Hediye notu (opsiyonel)</Body>
          <TextField label="" placeholder="Küçük bir not bırak..." value={note} onChangeText={setNote} multiline />
          <Body style={styles.warningText}>Notunuz moderasyondan geçecektir.</Body>
        </View>

        <View style={styles.priceCard}>
          <Body style={styles.sectionTitle}>Ödeme özeti</Body>
          <View style={styles.priceRow}>
            <Body>Ürün fiyatı</Body>
            <Body>{product.price} TL</Body>
          </View>
          <View style={styles.priceRow}>
            <Body>Hizmet bedeli</Body>
            <Body>{product.serviceFee} TL</Body>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Body style={styles.totalLabel}>Toplam</Body>
            <Body style={styles.totalLabel}>{total} TL</Body>
          </View>
        </View>

        <Button title="Ödemeyi Tamamla (İyzico)" onPress={handlePayment} />
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
  header: {
    gap: 12,
    marginTop: 24,
  },
  eyebrow: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  recipientCard: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 4,
  },
  recipientCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  recipientName: {
    color: colors.text,
    fontWeight: '700',
  },
  enabledText: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  warningText: {
    color: colors.gold,
  },
  priceCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 12,
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
