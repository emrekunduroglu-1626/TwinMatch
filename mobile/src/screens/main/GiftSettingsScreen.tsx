import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { useGiftStore, GiftReceivePermission } from '../../store/giftStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'GiftSettings'>;

const permissionOptions: { value: GiftReceivePermission; label: string }[] = [
  { value: 'none', label: 'Hiç kimseden' },
  { value: 'matchesOnly', label: 'Sadece eşleştiğim kişilerden' },
  { value: 'approvedOnly', label: 'Sadece benim onayladığım kişilerden' },
  { value: 'afterFirstDate', label: 'Sadece ilk buluşma sonrası' },
];

export function GiftSettingsScreen({ navigation }: Props) {
  const giftSettings = useGiftStore((state) => state.giftSettings);
  const updateGiftSettings = useGiftStore((state) => state.updateGiftSettings);
  const toggleBlockedSender = useGiftStore((state) => state.toggleBlockedSender);
  const userTier = useGiftStore((state) => state.userTier);

  const isPremiumTier = userTier === 'Gold' || userTier === 'Platinum';

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Body style={styles.eyebrow}>Hediye ayarları</Body>
          <Title>Hediye tercihlerini yönet</Title>
          <Body>Kimlerden hediye alabileceğini ve gönderim izinlerini belirle.</Body>
        </View>

        {!isPremiumTier && (
          <View style={styles.freemiumCard}>
            <Body style={styles.freemiumTitle}>Freemium uyarısı</Body>
            <Body>Hediye gönderme ve gelişmiş hediye özellikleri Gold ve Platinum üyelere özeldir. Devam etmek için planını yükselt.</Body>
            <Button title="Premium planları gör" variant="secondary" onPress={() => navigation.navigate('Premium')} />
          </View>
        )}

        <View style={styles.section}>
          <Pressable
            style={[styles.toggleCard, giftSettings.canReceiveGifts && styles.toggleCardEnabled]}
            onPress={() => updateGiftSettings({ canReceiveGifts: !giftSettings.canReceiveGifts })}
          >
            <View style={styles.toggleTop}>
              <Body style={styles.toggleTitle}>Hediye alma</Body>
              <Body style={giftSettings.canReceiveGifts ? styles.enabledText : undefined}>
                {giftSettings.canReceiveGifts ? 'Açık' : 'Kapalı'}
              </Body>
            </View>
            <Body>Diğer kullanıcıların sana anonim hediye göndermesine izin ver.</Body>
          </Pressable>

          <Pressable
            style={[styles.toggleCard, giftSettings.canSendGifts && styles.toggleCardEnabled, !isPremiumTier && styles.toggleCardDisabled]}
            onPress={() => isPremiumTier && updateGiftSettings({ canSendGifts: !giftSettings.canSendGifts })}
          >
            <View style={styles.toggleTop}>
              <Body style={styles.toggleTitle}>Hediye gönderme</Body>
              <Body style={giftSettings.canSendGifts ? styles.enabledText : undefined}>
                {giftSettings.canSendGifts ? 'Açık' : 'Kapalı'}
              </Body>
            </View>
            <Body>{isPremiumTier ? 'Eşleşmelerine anonim hediye gönderebilirsin.' : 'Gold/Platinum üyelik gerektirir.'}</Body>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Body style={styles.sectionTitle}>Kimlerden hediye alabilirim?</Body>
          {permissionOptions.map((option) => {
            const selected = giftSettings.receivePermission === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.optionCard, selected && styles.optionCardSelected]}
                onPress={() => updateGiftSettings({ receivePermission: option.value })}
              >
                <Body style={selected ? styles.enabledText : undefined}>{option.label}</Body>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.section}>
          <Body style={styles.sectionTitle}>Engellenen göndericiler</Body>
          {giftSettings.blockedSenders.length === 0 ? (
            <Body>Henüz engellenen gönderici yok.</Body>
          ) : (
            giftSettings.blockedSenders.map((sender) => (
              <View key={sender} style={styles.blockedRow}>
                <Body>{sender}</Body>
                <Pressable onPress={() => toggleBlockedSender(sender)}>
                  <Body style={styles.linkText}>Kaldır</Body>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Button title="Hediye kataloğuna git" onPress={() => navigation.navigate('GiftCatalog')} />
          <Button title="Adres kasasını yönet" variant="secondary" onPress={() => navigation.navigate('AddressVault')} />
          <Button title="Gelen hediye istekleri" variant="secondary" onPress={() => navigation.navigate('GiftNotification')} />
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
  freemiumCard: {
    borderRadius: 24,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 18,
    gap: 10,
  },
  freemiumTitle: {
    color: colors.gold,
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  toggleCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 8,
  },
  toggleCardEnabled: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  toggleCardDisabled: {
    opacity: 0.5,
  },
  toggleTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  enabledText: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  optionCard: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  blockedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  linkText: {
    color: colors.danger,
    fontWeight: '700',
  },
  footer: {
    gap: 12,
  },
});
