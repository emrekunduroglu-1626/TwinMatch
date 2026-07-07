import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { MainStackParamList } from '../../navigation/types';
import { useVenueStore } from '../../store/venueStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'SafeDateSpots'>;

const safetyIcons: Record<string, string> = {
  Kalabalık: '👥',
  'Merkezi konum': '📍',
  'Gece güvenli': '🌙',
  'Toplu taşıma yakın': '🚌',
};

export function SafeDateSpotsScreen({ navigation }: Props) {
  const safeDateSpots = useVenueStore((state) => state.safeDateSpots);

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Body style={styles.eyebrow}>TwinMatch Safe Date Spots</Body>
          <Title>Güvenli buluşma noktaları</Title>
          <Body>Güvenli, merkezi ve yüksek puanlı buluşma noktaları</Body>
        </View>

        <View style={styles.list}>
          {safeDateSpots.map((venue) => (
            <Pressable key={venue.id} style={styles.card} onPress={() => navigation.navigate('VenueDetail', { venueId: venue.id })}>
              <View style={styles.cardTop}>
                <Body style={styles.venueName}>{venue.name}</Body>
                <View style={styles.scoreBadge}>
                  <Body style={styles.scoreText}>{venue.safetyScore}/10</Body>
                </View>
              </View>

              {venue.sponsored && (
                <View style={styles.dealBadge}>
                  <Body style={styles.dealBadgeText}>Anlaşmalı</Body>
                </View>
              )}

              <Body>{venue.category} · ⭐ {venue.rating} · {venue.distanceKm} km</Body>

              <View style={styles.iconsRow}>
                {venue.safetyFeatures.map((feature) => (
                  <View key={feature} style={styles.iconChip}>
                    <Body style={styles.iconText}>{safetyIcons[feature] ?? '✓'} {feature}</Body>
                  </View>
                ))}
              </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  venueName: {
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  scoreBadge: {
    borderRadius: 999,
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scoreText: {
    color: colors.background,
    fontWeight: '700',
  },
  dealBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dealBadgeText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 12,
  },
  iconsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconChip: {
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  iconText: {
    fontSize: 12,
  },
});
