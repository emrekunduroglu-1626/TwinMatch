import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'ProfileDetail'>;

export function ProfileDetailScreen({ navigation, route }: Props) {
  const profile = useSetupStore((state) => state.discoveryProfiles.find((item) => item.id === route.params.profileId));

  if (!profile) {
    return (
      <Screen>
        <View style={styles.emptyState}>
          <Title>Profil bulunamadı</Title>
          <Button title="Keşfete dön" onPress={() => navigation.navigate('Discover')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.heroCard}>
          <Body style={styles.score}>Uyumluluk %{profile.compatibilityScore}</Body>
          <Title>
            {profile.name}, {profile.age}
          </Title>
          <Body>{profile.headline}</Body>
        </View>

        <View style={styles.section}>
          <Body style={styles.sectionTitle}>Hakkında</Body>
          <Body>{profile.bio}</Body>
        </View>

        <View style={styles.section}>
          <Body style={styles.sectionTitle}>İlgi alanları</Body>
          <View style={styles.chips}>
            {profile.interests.map((interest) => (
              <View key={interest} style={styles.chip}>
                <Body style={styles.chipText}>{interest}</Body>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Body style={styles.sectionTitle}>İletişim stili</Body>
          <Body>{profile.communicationStyle}</Body>
        </View>

        <View style={styles.footer}>
          <Button title="Dijital ikiz sohbetini başlat" onPress={() => navigation.navigate('TwinChat', { profileId: profile.id })} />
          <Button title="Eşleme sürecini gör" variant="secondary" onPress={() => navigation.navigate('MatchProcess', { profileId: profile.id })} />
          <Button title="Gerçek kimlik açılımı" variant="secondary" onPress={() => navigation.navigate('IdentityReveal', { profileId: profile.id })} />
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
  heroCard: {
    marginTop: 24,
    borderRadius: 28,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 24,
    gap: 12,
  },
  score: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  section: {
    gap: 10,
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 18,
  },
  footer: {
    gap: 12,
  },
});