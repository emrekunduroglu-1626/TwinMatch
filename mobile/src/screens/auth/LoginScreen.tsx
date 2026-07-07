import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Body, Title } from '../../components/Typography';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Eksik bilgi', 'E-posta ve şifre alanlarını doldurun.');
      return;
    }

    try {
      await login(email, password);
      navigation.replace('SetupFlow');
    } catch (error) {
      Alert.alert('Giriş başarısız', error instanceof Error ? error.message : 'Bilgilerini kontrol et.');
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title>Giriş yap</Title>
          <Body>JWT tabanlı backend entegrasyonu için hazır ekran iskeleti.</Body>
        </View>

        <View style={styles.form}>
          <TextField label="E-posta" value={email} onChangeText={setEmail} placeholder="ornek@mail.com" autoCapitalize="none" keyboardType="email-address" />
          <TextField label="Şifre" value={password} onChangeText={setPassword} placeholder="Şifren" secureTextEntry />
        </View>

        <View style={styles.footer}>
          <Button title="Giriş yap" onPress={handleLogin} />
          <Button title="Kayıt ol" variant="secondary" onPress={() => navigation.navigate('Register')} />
        </View>
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
  form: {
    gap: 16,
  },
  footer: {
    gap: 12,
  },
});