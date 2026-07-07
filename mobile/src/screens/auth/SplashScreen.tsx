import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { AuthStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1400);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <Screen>
      <LinearGradient colors={['#000000', '#1A1A1A']} style={styles.card}>
        <Title>TwinMatch</Title>
        <Body style={styles.subtitle}>Dijital ikizlerle daha derin eşleşmeler.</Body>
      </LinearGradient>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 240,
  },
});