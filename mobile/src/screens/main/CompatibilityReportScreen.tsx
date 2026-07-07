import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'CompatibilityReport'>;

export function CompatibilityReportScreen({ navigation, route }: Props) {
  const profile = useSetupStore((state) => state.discoveryProfiles.find((item) => item.id === route.params.profileId));

  if (!profile) {
    return (
      <Screen>
        <View style={styles.emptyState}>
          <Title>Rapor bulunamadı</Title>
          <Button title="Keşfete dön" onPress={() => navigation.navigate('Discover')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Body style={styles.heroLabel}>Uyumluluk raporu</Body>
          <Title>%{profile.compatibilityScore} genel skor</Title>
          <Body>{profile.name} ile ilişki potansiyelinin öne çıkan başlıkları</Body>
        </View>

        <View style={styles.section}>
          <Body style={styles.sectionTitle}>Neden uyumlu?</Body>
          {profile.matchReasons.map((reason) => (
            <View key={reason} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Body style={styles.bulletText}>{reason}</Body>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Body style={styles.sectionTitle}>AI özet</Body>
          {profile.reportSummary.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Body style={styles.bulletText}>{item}</Body>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Button title="Keşfete devam et" onPress={() => navigation.navigate('Discover')} />
          <Button title="Sohbet özetine dön" variant="secondary" onPress={() => navigation.navigate('TwinChat', { profileId: profile.id })} />
          <Button title="Premium raporu aç" variant="secondary" onPress={() => navigation.navigate('Premium')} />
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
  heroLabel: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  section: {
    gap: 12,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
  },
  footer: {
    gap: 12,
  },
});