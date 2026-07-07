import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const slides = [
  {
    title: 'Yüzeysel değil, uyum odaklı.',
    description: 'TwinMatch, ilk izlenim yerine karakter ve iletişim uyumunu öne çıkarır.',
  },
  {
    title: 'Dijital ikizler önce konuşur.',
    description: 'Senin adına iletişim kuran dijital ikizin, daha anlamlı eşleşmeler üretir.',
  },
  {
    title: 'Gerçek buluşmaya güvenle ilerle.',
    description: 'Doğrulama, yaş onayı ve kontrollü akış ile güvenli başlangıç yap.',
  },
];

export function OnboardingScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const slide = useMemo(() => slides[index], [index]);

  const handleNext = () => {
    if (index < slides.length - 1) {
      setIndex((current) => current + 1);
      return;
    }

    completeOnboarding();
    navigation.replace('Register');
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Body style={styles.badgeText}>0{index + 1}</Body>
          </View>
          <Title>{slide.title}</Title>
          <Body>{slide.description}</Body>
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {slides.map((item, itemIndex) => (
              <View
                key={item.title}
                style={[styles.dot, itemIndex === index && styles.dotActive]}
              />
            ))}
          </View>
          <Button title={index === slides.length - 1 ? 'Başla' : 'Devam et'} onPress={handleNext} />
          <Button title="Giriş yap" variant="secondary" onPress={() => navigation.replace('Login')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  hero: {
    marginTop: 48,
    gap: 18,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.primary,
    fontWeight: '700',
  },
  footer: {
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.primary,
  },
});