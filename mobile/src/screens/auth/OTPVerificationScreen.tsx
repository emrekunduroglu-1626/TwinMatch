import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Body, Title } from '../../components/Typography';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerification'>;

export function OTPVerificationScreen({ navigation, route }: Props) {
  const [code, setCode] = useState('');
  const verifyPhone = useAuthStore((state) => state.verifyPhone);

  const handleVerify = () => {
    if (code.length < 4) {
      Alert.alert('Geçersiz kod', 'Lütfen SMS ile gelen doğrulama kodunu girin.');
      return;
    }

    verifyPhone();
    navigation.replace('AgeConfirm');
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title>Telefonunu doğrula</Title>
          <Body>{route.params.phone} numarasına gönderilen kodu gir.</Body>
        </View>

        <TextField
          label="OTP Kodu"
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          keyboardType="number-pad"
          maxLength={6}
        />

        <View style={styles.footer}>
          <Button title="Doğrula" onPress={handleVerify} />
          <Button title="Kodu tekrar gönder" variant="secondary" onPress={() => Alert.alert('Bilgi', 'Demo akışta yeniden gönderim simüle edildi.')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
    justifyContent: 'center',
  },
  header: {
    gap: 12,
  },
  footer: {
    gap: 12,
  },
});