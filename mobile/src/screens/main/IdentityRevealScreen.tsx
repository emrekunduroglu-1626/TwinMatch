import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'IdentityReveal'>;

export function IdentityRevealScreen({ navigation, route }: Props) {
  const profile = useSetupStore((state) => state.discoveryProfiles.find((item) => item.id === route.params.profileId));
  const unlocked = useSetupStore((state) => state.identityUnlockedProfiles.includes(route.params.profileId));
  const unlockIdentity = useSetupStore((state) => state.unlockIdentity);

  if (!profile) {
    return (
      <Screen>
        <View style={styles.emptyState}>
          <Title>Kimlik bilgisi bulunamadı</Title>
          <Button title="Keşfete dön" onPress={() => navigation.navigate('Discover')} />
        </View>
      </Screen>
    );
  }

  const handleUnlock = () => {
    unlockIdentity(profile.id);
    navigation.replace('Success', {
      title: 'Kimlik açılımı tamamlandı',
      description: `${profile.name} ile karşılıklı onay sonrası gerçek isim ve iletişim detayları paylaşıldı.`,
      ctaLabel: 'Takvim planla',
      targetScreen: 'Calendar',
      profileId: profile.id,
    });
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Body style={styles.eyebrow}>Ekran 21 · Gerçek kimlik açılımı</Body>
          <Title>{unlocked ? 'Kimlik paylaşımı aktif' : 'Karşılıklı onay bekleniyor'}</Title>
          <Body>
            {unlocked
              ? `${profile.name} ile güvenli paylaşım tamamlandı. Artık gerçek isim, şehir ve planlama detaylarını görebilirsin.`
              : `${profile.name} ile eşleşme sonrası güvenli kimlik açılımı için iki tarafın da onayı gerekiyor.`}
          </Body>
        </View>

        <View style={styles.card}>
          <Body style={styles.sectionTitle}>Paylaşılacak bilgiler</Body>
          <View style={styles.row}>
            <Body style={styles.label}>Ad Soyad</Body>
            <Body>{unlocked ? `${profile.name} A.` : 'Onay sonrası görünür'}</Body>
          </View>
          <View style={styles.row}>
            <Body style={styles.label}>Şehir</Body>
            <Body>{profile.city}</Body>
          </View>
          <View style={styles.row}>
            <Body style={styles.label}>İlk buluşma tercihi</Body>
            <Body>Sergi + kahve</Body>
          </View>
        </View>

        <View style={styles.card}>
          <Body style={styles.sectionTitle}>Güvenlik adımları</Body>
          <Body>• Selfie doğrulaması tamamlandı</Body>
          <Body>• Dijital ikiz görüşmesi olumlu sonuçlandı</Body>
          <Body>• İlk buluşma öncesi iletişim sınırları netleştirildi</Body>
        </View>

        <View style={styles.footer}>
          {!unlocked && <Button title="Kimlik açılımını onayla" onPress={handleUnlock} />}
          <Button
            title={unlocked ? 'Takvim ekranına geç' : 'Profili tekrar incele'}
            variant="secondary"
            onPress={() => navigation.navigate(unlocked ? 'Calendar' : 'ProfileDetail', unlocked ? { profileId: profile.id } : { profileId: profile.id })}
          />
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  hero: {
    marginTop: 24,
    borderRadius: 28,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 24,
    gap: 12,
  },
  eyebrow: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  card: {
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    color: colors.text,
    fontWeight: '700',
  },
  footer: {
    gap: 12,
  },
});