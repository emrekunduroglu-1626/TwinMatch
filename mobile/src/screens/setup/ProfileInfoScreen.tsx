import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Body, Title } from '../../components/Typography';
import { SetupStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';

type Props = NativeStackScreenProps<SetupStackParamList, 'ProfileInfo'>;

export function ProfileInfoScreen({ navigation }: Props) {
  const profileInfo = useSetupStore((state) => state.profileInfo);
  const updateProfileInfo = useSetupStore((state) => state.updateProfileInfo);
  const [form, setForm] = useState(profileInfo);

  const handleContinue = () => {
    if (!form.displayName || !form.birthDate || !form.city || !form.occupation) {
      Alert.alert('Eksik bilgi', 'Ad, doğum tarihi, şehir ve meslek alanlarını doldur.');
      return;
    }

    updateProfileInfo(form);
    navigation.navigate('PhotoUpload');
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title>Profil bilgilerini tamamla</Title>
          <Body>Eşleşme kalitesini artırmak için temel profil alanlarını doldur.</Body>
        </View>

        <View style={styles.form}>
          <TextField label="Görünen ad" value={form.displayName} onChangeText={(value) => setForm((current) => ({ ...current, displayName: value }))} placeholder="Örn. Ece" />
          <TextField label="Doğum tarihi" value={form.birthDate} onChangeText={(value) => setForm((current) => ({ ...current, birthDate: value }))} placeholder="GG.AA.YYYY" />
          <TextField label="Şehir" value={form.city} onChangeText={(value) => setForm((current) => ({ ...current, city: value }))} placeholder="İstanbul" />
          <TextField label="Meslek" value={form.occupation} onChangeText={(value) => setForm((current) => ({ ...current, occupation: value }))} placeholder="Ürün tasarımcısı" />
          <TextField label="Eğitim" value={form.education} onChangeText={(value) => setForm((current) => ({ ...current, education: value }))} placeholder="Lisans" />
          <TextField label="Burç" value={form.zodiacSign} onChangeText={(value) => setForm((current) => ({ ...current, zodiacSign: value }))} placeholder="Terazi" />
          <TextField label="Kısa bio" value={form.bio} onChangeText={(value) => setForm((current) => ({ ...current, bio: value }))} placeholder="Kendini birkaç cümleyle anlat" multiline numberOfLines={4} />
        </View>

        <Button title="Fotoğraf adımına geç" onPress={handleContinue} style={styles.button} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
  },
  header: {
    gap: 12,
    marginTop: 24,
  },
  form: {
    gap: 16,
  },
  button: {
    marginTop: 8,
  },
});