import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'Calendar'>;

export function CalendarScreen({ navigation, route }: Props) {
  const profile = useSetupStore((state) => state.discoveryProfiles.find((item) => item.id === route.params.profileId));
  const calendarSlots = useSetupStore((state) => state.calendarSlots);
  const selectedCalendarSlotId = useSetupStore((state) => state.selectedCalendarSlotId);
  const selectCalendarSlot = useSetupStore((state) => state.selectCalendarSlot);

  const selectedSlot = calendarSlots.find((slot) => slot.id === selectedCalendarSlotId) ?? calendarSlots[0];

  const handleContinue = () => {
    navigation.navigate('Success', {
      title: 'Görüşme planlandı',
      description: `${profile?.name ?? 'Eşleşmen'} ile ${selectedSlot?.date} ${selectedSlot?.timeRange} için takvim daveti oluşturuldu.`,
      ctaLabel: 'Mesaj kutusuna git',
      targetScreen: 'Inbox',
    });
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Body style={styles.eyebrow}>Ekran 22 · Takvim</Body>
          <Title>Uygun zamanı eşleştir</Title>
          <Body>{profile ? `${profile.name} ile ortak uygunluklara göre önerilen zamanlar` : 'Önerilen zamanlar'}</Body>
        </View>

        <View style={styles.list}>
          {calendarSlots.map((slot) => {
            const selected = slot.id === selectedCalendarSlotId;
            return (
              <Pressable
                key={slot.id}
                style={[styles.slotCard, selected && styles.slotCardSelected, !slot.available && styles.slotCardDisabled]}
                onPress={() => slot.available && selectCalendarSlot(slot.id)}
              >
                <View style={styles.slotHeader}>
                  <Body style={styles.slotTitle}>{slot.label}</Body>
                  <Body style={selected ? styles.selectedText : undefined}>{selected ? 'Seçildi' : slot.available ? 'Uygun' : 'Dolu'}</Body>
                </View>
                <Body>{slot.date}</Body>
                <Body>{slot.timeRange}</Body>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.summaryCard}>
          <Body style={styles.sectionTitle}>Plan özeti</Body>
          <Body>Konum önerisi: Karaköy sanat rotası</Body>
          <Body>Süre: 60-90 dakika</Body>
          <Body>Hatırlatma: 2 saat önce push bildirimi</Body>
        </View>

        <View style={styles.footer}>
          <Button title="Takvimi onayla" onPress={handleContinue} />
          <Button title="Premium avantajlarını gör" variant="secondary" onPress={() => navigation.navigate('Premium')} />
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
  list: {
    gap: 12,
  },
  slotCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 8,
  },
  slotCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  slotCardDisabled: {
    opacity: 0.5,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  slotTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  selectedText: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  footer: {
    gap: 12,
  },
});