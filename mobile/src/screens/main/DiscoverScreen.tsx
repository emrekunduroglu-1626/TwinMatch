import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'Discover'>;

export function DiscoverScreen({ navigation }: Props) {
  const discoveryProfiles = useSetupStore((state) => state.discoveryProfiles);

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title>Keşfet</Title>
          <Body>AI eşleme motorunun senin için öne çıkardığı profilleri incele.</Body>
          <View style={styles.quickActions}>
            <Button title="Mesaj kutusu" variant="secondary" onPress={() => navigation.navigate('Inbox')} style={styles.quickButton} />
            <Button title="Premium" variant="secondary" onPress={() => navigation.navigate('Premium')} style={styles.quickButton} />
          </View>
          <View style={styles.quickActions}>
            <Button title="Hediye Gönder" variant="secondary" onPress={() => navigation.navigate('GiftCatalog')} style={styles.quickButton} />
            <Button title="Mekanlar" variant="secondary" onPress={() => navigation.navigate('VenueList')} style={styles.quickButton} />
          </View>
          <View style={styles.quickActions}>
            <Button title="Safe Date Spots" variant="secondary" onPress={() => navigation.navigate('SafeDateSpots')} style={styles.quickButton} />
            <Button title="Hediye Takibi" variant="secondary" onPress={() => navigation.navigate('GiftTracking')} style={styles.quickButton} />
          </View>
        </View>

        <View style={styles.list}>
          {discoveryProfiles.map((profile) => (
            <Pressable key={profile.id} style={styles.card} onPress={() => navigation.navigate('ProfileDetail', { profileId: profile.id })}>
              <View style={styles.cardTop}>
                <View style={styles.scoreBadge}>
                  <Body style={styles.scoreText}>%{profile.compatibilityScore}</Body>
                </View>
                <Body>{profile.city}</Body>
              </View>
              <Title style={styles.cardTitle}>
                {profile.name}, {profile.age}
              </Title>
              <Body>{profile.headline}</Body>
              <View style={styles.reasonList}>
                {profile.matchReasons.map((reason) => (
                  <View key={reason} style={styles.reasonChip}>
                    <Body style={styles.reasonText}>{reason}</Body>
                  </View>
                ))}
              </View>
              <Button title="Profili incele" onPress={() => navigation.navigate('ProfileDetail', { profileId: profile.id })} />
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
    gap: 24,
  },
  header: {
    gap: 12,
    marginTop: 24,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickButton: {
    flex: 1,
  },
  list: {
    gap: 18,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreBadge: {
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scoreText: {
    color: colors.text,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  reasonList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reasonChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reasonText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 18,
  },
});