import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const settings = useSetupStore((state) => state.settings);
  const updateSettings = useSetupStore((state) => state.updateSettings);

  const items = [
    {
      key: 'pushNotifications' as const,
      title: 'Push bildirimleri',
      description: 'Takvim ve eşleşme güncellemelerini anlık al.',
    },
    {
      key: 'emailNotifications' as const,
      title: 'E-posta özetleri',
      description: 'Haftalık premium ve keşfet özetlerini mail ile al.',
    },
    {
      key: 'profileVisible' as const,
      title: 'Profil görünürlüğü',
      description: 'Keşfet akışında görünürlüğünü açık tut.',
    },
  ];

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Body style={styles.eyebrow}>Ekran 28 · Ayarlar</Body>
          <Title>Hesap tercihleri</Title>
          <Body>Bildirim, gizlilik ve görünürlük ayarlarını tek ekrandan yönet.</Body>
        </View>

        <View style={styles.list}>
          {items.map((item) => {
            const enabled = settings[item.key];
            return (
              <Pressable
                key={item.key}
                style={[styles.settingCard, enabled && styles.settingCardEnabled]}
                onPress={() => updateSettings({ [item.key]: !enabled })}
              >
                <View style={styles.settingTop}>
                  <Body style={styles.settingTitle}>{item.title}</Body>
                  <Body style={enabled ? styles.enabledText : undefined}>{enabled ? 'Açık' : 'Kapalı'}</Body>
                </View>
                <Body>{item.description}</Body>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button title="Kaydet ve devam et" onPress={() => navigation.navigate('Success', { title: 'Ayarlar kaydedildi', description: 'Tercihlerin hesabına uygulandı.', ctaLabel: 'Keşfete dön', targetScreen: 'Discover' })} />
          <Button title="Premium planı yönet" variant="secondary" onPress={() => navigation.navigate('Premium')} />
          <Button title="Hediye ayarları" variant="secondary" onPress={() => navigation.navigate('GiftSettings')} />
          <Button title="Adres kasası" variant="secondary" onPress={() => navigation.navigate('AddressVault')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
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
  list: {
    gap: 14,
  },
  settingCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 10,
  },
  settingCardEnabled: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  settingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  settingTitle: {
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  enabledText: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  footer: {
    gap: 12,
  },
});