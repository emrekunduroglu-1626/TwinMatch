import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Body, Title } from '../../components/Typography';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'AgeConfirm'>;

export function AgeConfirmScreen({ navigation }: Props) {
  const [accepted, setAccepted] = useState(false);
  const confirmAge = useAuthStore((state) => state.confirmAge);

  const handleContinue = () => {
    confirmAge();
    navigation.replace('SetupFlow');
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title>18+ yaş onayı</Title>
          <Body>TwinMatch yalnızca 18 yaş ve üzeri kullanıcılar içindir. Devam ederek bunu onaylarsın.</Body>
        </View>

        <Pressable style={styles.checkboxRow} onPress={() => setAccepted((current) => !current)}>
          <View style={[styles.checkbox, accepted && styles.checkboxActive]} />
          <Body style={styles.checkboxText}>18 yaşından büyüğüm ve topluluk kurallarını kabul ediyorum.</Body>
        </Pressable>

        <Button title="Devam et" onPress={handleContinue} variant={accepted ? 'primary' : 'secondary'} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 28,
  },
  header: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    flex: 1,
  },
});