import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Body, Title } from '../../components/Typography';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const register = useAuthStore((state) => state.register);

  const handleRegister = async () => {
    if (!fullName || !email || !phone || !password) {
      Alert.alert('Eksik bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      await register(email, phone, password);
      navigation.navigate('OTPVerification', { phone });
    } catch (error) {
      Alert.alert('Kayıt başarısız', error instanceof Error ? error.message : 'Bilgilerini kontrol et.');
    }
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title>Hesabını oluştur</Title>
          <Body>Android öncelikli MVP için kayıt akışının ilk adımı hazır.</Body>
        </View>

        <View style={styles.form}>
          <TextField label="Ad Soyad" value={fullName} onChangeText={setFullName} placeholder="Adın ve soyadın" />
          <TextField label="E-posta" value={email} onChangeText={setEmail} placeholder="ornek@mail.com" keyboardType="email-address" autoCapitalize="none" />
          <TextField label="Telefon" value={phone} onChangeText={setPhone} placeholder="+90 5xx xxx xx xx" keyboardType="phone-pad" />
          <TextField label="Şifre" value={password} onChangeText={setPassword} placeholder="En az 8 karakter" secureTextEntry />
        </View>

        <View style={styles.footer}>
          <Button title="OTP gönder" onPress={handleRegister} />
          <Button title="Zaten hesabım var" variant="secondary" onPress={() => navigation.navigate('Login')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 32,
  },
  header: {
    gap: 12,
    marginTop: 24,
  },
  form: {
    gap: 16,
  },
  footer: {
    gap: 12,
    marginTop: 'auto',
  },
});