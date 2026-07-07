import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { MainStackParamList } from '../../navigation/types';
import { VenueCategory, useVenueStore } from '../../store/venueStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'VenueList'>;

const categories: VenueCategory[] = ['Kafe', 'Restoran', 'Bar', 'Pub', 'Tatlıcı'];

export function VenueListScreen({ navigation }: Props) {
  const venues = useVenueStore((state) => state.venues);
  const [selectedCategory, setSelectedCategory] = useState<VenueCategory | null>(null);

  const filteredVenues = useMemo(() => {
    const base = selectedCategory ? venues.filter((venue) => venue.category === selectedCategory) : venues;
    return [...base].sort((a, b) => a.distanceKm - b.distanceKm);
  }, [venues, selectedCategory]);

  const sponsoredVenues = filteredVenues.filter((venue) => venue.sponsored);
  const nearbyVenues = filteredVenues;

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Body style={styles.eyebrow}>Mekanlar</Body>
          <Title>Buluşma noktanı seç</Title>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          <Pressable
            style={[styles.categoryChip, selectedCategory === null && styles.categoryChipSelected]}
            onPress={() => setSelectedCategory(null)}
          >
            <Body style={selectedCategory === null ? styles.categoryTextSelected : styles.categoryText}>Tümü</Body>
          </Pressable>
          {categories.map((category) => {
            const selected = selectedCategory === category;
            return (
              <Pressable
                key={category}
                style={[styles.categoryChip, selected && styles.categoryChipSelected]}
                onPress={() => setSelectedCategory(category)}
              >
                <Body style={selected ? styles.categoryTextSelected : styles.categoryText}>{category}</Body>
              </Pressable>
            );
          })}
        </ScrollView>

        {sponsoredVenues.length > 0 && (
          <View style={styles.section}>
            <Body style={styles.sectionTitle}>Öne Çıkan Anlaşmalı Mekanlar</Body>
            {sponsoredVenues.map((venue) => (
              <Pressable key={venue.id} style={styles.sponsoredCard} onPress={() => navigation.navigate('VenueDetail', { venueId: venue.id })}>
                <View style={styles.sponsoredBadge}>
                  <Body style={styles.sponsoredBadgeText}>Sponsorlu</Body>
                </View>
                <Body style={styles.venueName}>{venue.name}</Body>
                <Body>{venue.category} · ⭐ {venue.rating} · {venue.distanceKm} km</Body>
                <Body style={styles.discountText}>{venue.discount}</Body>
                <View style={styles.perksRow}>
                  {venue.perks?.map((perk) => (
                    <View key={perk} style={styles.perkChip}>
                      <Body style={styles.perkText}>{perk}</Body>
                    </View>
                  ))}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Body style={styles.sectionTitle}>Yakındaki Mekanlar</Body>
          {nearbyVenues.map((venue) => (
            <Pressable key={venue.id} style={styles.venueCard} onPress={() => navigation.navigate('VenueDetail', { venueId: venue.id })}>
              <Body style={styles.venueName}>{venue.name}</Body>
              <Body>{venue.category} · ⭐ {venue.rating} · {venue.distanceKm} km</Body>
              <Body>{venue.address}</Body>
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
  categoryRow: {
    gap: 10,
    paddingRight: 12,
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.text,
  },
  categoryTextSelected: {
    color: colors.text,
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  sponsoredCard: {
    borderRadius: 24,
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
  venueName: {
    color: colors.text,
    fontWeight: '700',
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
  venueCard: {
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
});
