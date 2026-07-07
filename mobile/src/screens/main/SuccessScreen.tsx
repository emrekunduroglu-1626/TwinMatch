import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'Success'>;

export function SuccessScreen({ navigation, route }: Props) {
  const title = route.params.title ?? 'İşlem tamamlandı';
  const description = route.params.description ?? 'Akış başarıyla tamamlandı.';
  const ctaLabel = route.params.ctaLabel ?? 'Keşfete dön';
  const targetScreen = route.params.targetScreen ?? 'Discover';

  const handleContinue = () => {
    if (targetScreen === 'Calendar' && route.params.profileId) {
      navigation.replace('Calendar', { profileId: route.params.profileId });
      return;
    }

    if (targetScreen === 'IdentityReveal' && route.params.profileId) {
      navigation.replace('IdentityReveal', { profileId: route.params.profileId });
      return;
    }

    if (targetScreen === 'TwinChat' && route.params.profileId) {
      navigation.replace('TwinChat', { profileId: route.params.profileId });
      return;
    }

    if (targetScreen === 'ProfileDetail' && route.params.profileId) {
      navigation.replace('ProfileDetail', { profileId: route.params.profileId });
      return;
    }

    navigation.replace(targetScreen as any);
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.badge}>
          <Body style={styles.badgeText}>Ekran 30</Body>
        </View>
        <Title>{title}</Title>
        <Body style={styles.description}>{description}</Body>
        <View style={styles.card}>
          <Body>• Güvenli akış tamamlandı</Body>
          <Body>• Sonraki adım hazırlandı</Body>
          <Body>• Kullanıcı deneyimi sprint 7-8 ile hizalandı</Body>
        </View>
        <Button title={ctaLabel} onPress={handleContinue} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: {
    color: colors.text,
    fontWeight: '700',
  },
  description: {
    maxWidth: 320,
  },
  card: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 10,
  },
});