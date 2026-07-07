import React from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { useVenueStore } from '../../store/venueStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'VenueDetail'>;

export function VenueDetailScreen({ navigation, route }: Props) {
  const venue = useVenueStore((state) => state.venues.find((item) => item.id === route.params.venueId));

  if (!venue) {
    return (
      <Screen>
        <View style={styles.emptyState}>
          <Title>Mekan bulunamadı</Title>
          <Button title="Mekan listesine dön" onPress={() => navigation.navigate('VenueList')} />
        </View>
      </Screen>
    );
  }

  const handleDirections = () => {
    const query = encodeURIComponent(venue.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const handleReservation = () => {
    Alert.alert('Rezervasyon isteği alındı', `${venue.name} için rezervasyon talebin işleme alındı.`);
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.imageBox}>
          <Body style={styles.imageText}>{venue.image}</Body>
        </View>

        <View style={styles.header}>
          <Title>{venue.name}</Title>
          <Body>{venue.category} · ⭐ {venue.rating}</Body>
        </View>

        <View style={styles.section}>
          <Body style={styles.sectionTitle}>İletişim</Body>
          <Body>{venue.address}</Body>
          <Body>{venue.phone}</Body>
          <Body>{venue.website}</Body>
        </View>

        <View style={styles.section}>
          <Body style={styles.sectionTitle}>Açılış saatleri</Body>
          <Body>{venue.openingHours}</Body>
        </View>

        {venue.sponsored && (
          <View style={styles.dealCard}>
            <View style={styles.sponsoredBadge}>
              <Body style={styles.sponsoredBadgeText}>Sponsorlu</Body>
            </View>
            <Body style={styles.discountText}>{venue.discount}</Body>
            <View style={styles.perksRow}>
              {venue.perks?.map((perk) => (
                <View key={perk} style={styles.perkChip}>
                  <Body style={styles.perkText}>{perk}</Body>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Button title="Yol Tarifi" onPress={handleDirections} />
          <Button title="Rezervasyon Yap" variant="secondary" onPress={handleReservation} />
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
  imageBox: {
    marginTop: 24,
    height: 200,
    borderRadius: 24,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    gap: 8,
  },
  section: {
    gap: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  dealCard: {
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: 18,
    gap: 8,
  },
  sponsoredBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sponsoredBadgeText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 12,
  },
  discountText: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  perksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  perkChip: {
    borderRadius: 999,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  perkText: {
    fontSize: 12,
  },
  footer: {
    gap: 12,
  },
});
