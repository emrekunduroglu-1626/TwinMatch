import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'Premium'>;

const plans = [
  {
    name: 'Freemium' as const,
    price: '₺0',
    features: ['Günlük sınırlı keşfet', 'Temel uyumluluk skoru', 'Standart bildirimler'],
  },
  {
    name: 'VIP' as const,
    price: '₺299/ay',
    features: ['Sınırsız keşfet', 'Öncelikli eşleşme sırası', 'Detaylı rapor özeti'],
  },
  {
    name: 'Premium' as const,
    price: '₺499/ay',
    features: ['Takvim otomasyonu', 'Kimlik açılımı önceliği', 'Gelişmiş AI ilişki koçu'],
  },
];

export function PremiumScreen({ navigation }: Props) {
  const subscriptionPlan = useSetupStore((state) => state.subscriptionPlan);
  const setSubscriptionPlan = useSetupStore((state) => state.setSubscriptionPlan);

  const handleContinue = () => {
    navigation.navigate('Success', {
      title: `${subscriptionPlan} planı aktif`,
      description: 'Üyelik avantajların hesabına işlendi ve premium akışlar açıldı.',
      ctaLabel: 'Bildirimleri görüntüle',
      targetScreen: 'Notifications',
    });
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Body style={styles.eyebrow}>Ekran 25 · Premium üyelik</Body>
          <Title>Planını seç</Title>
          <Body>İlişki yolculuğunu hızlandıracak premium özellikleri karşılaştır.</Body>
        </View>

        <View style={styles.planList}>
          {plans.map((plan) => {
            const selected = subscriptionPlan === plan.name;
            return (
              <Pressable key={plan.name} style={[styles.planCard, selected && styles.planCardSelected]} onPress={() => setSubscriptionPlan(plan.name)}>
                <View style={styles.planHeader}>
                  <Title style={styles.planTitle}>{plan.name}</Title>
                  <Body style={styles.price}>{plan.price}</Body>
                </View>
                {plan.features.map((feature) => (
                  <Body key={feature}>• {feature}</Body>
                ))}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button title="Planı etkinleştir" onPress={handleContinue} />
          <Button title="Mesaj kutusuna geç" variant="secondary" onPress={() => navigation.navigate('Inbox')} />
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
  planList: {
    gap: 14,
  },
  planCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 10,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  planTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  price: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  footer: {
    gap: 12,
  },
});