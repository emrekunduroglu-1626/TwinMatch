import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Body, Title } from '../../components/Typography';
import { MainStackParamList } from '../../navigation/types';
import { useGiftStore } from '../../store/giftStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'AddressVault'>;

export function AddressVaultScreen({ navigation }: Props) {
  const addressVault = useGiftStore((state) => state.addressVault);
  const updateAddressVault = useGiftStore((state) => state.updateAddressVault);
  const saveAddressVault = useGiftStore((state) => state.saveAddressVault);

  const [addressLine1, setAddressLine1] = useState(addressVault.addressLine1);
  const [addressLine2, setAddressLine2] = useState(addressVault.addressLine2);
  const [city, setCity] = useState(addressVault.city);
  const [district, setDistrict] = useState(addressVault.district);
  const [postalCode, setPostalCode] = useState(addressVault.postalCode);
  const [maskedPhone, setMaskedPhone] = useState(addressVault.maskedPhone);

  const handleSave = () => {
    if (!addressLine1 || !city || !district || !postalCode) {
      Alert.alert('Eksik bilgi', 'Lütfen adres satırı 1, şehir, ilçe ve posta kodunu doldur.');
      return;
    }

    updateAddressVault({ addressLine1, addressLine2, city, district, postalCode, maskedPhone });
    saveAddressVault();
    navigation.navigate('Success', {
      title: 'Adres kasası kaydedildi',
      description: 'Adresin şifreli olarak saklandı. Hediye gönderen kişi bu bilgileri asla göremez.',
      ctaLabel: 'Hediye ayarlarına dön',
      targetScreen: 'GiftSettings',
    });
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Body style={styles.eyebrow}>Şifreli Adres Kasası</Body>
          <Title>Teslimat adresini güvenle sakla</Title>
        </View>

        <View style={styles.securityNote}>
          <Body style={styles.securityText}>
            Adresiniz şifreli olarak saklanır. Hediye gönderen kişi adresinizi asla göremez.
          </Body>
        </View>

        <View style={styles.form}>
          <TextField label="Adres satırı 1" value={addressLine1} onChangeText={setAddressLine1} placeholder="Mahalle, cadde, no" />
          <TextField label="Adres satırı 2 (opsiyonel)" value={addressLine2} onChangeText={setAddressLine2} placeholder="Daire, kat vb." />
          <TextField label="Şehir" value={city} onChangeText={setCity} placeholder="İstanbul" />
          <TextField label="İlçe" value={district} onChangeText={setDistrict} placeholder="Kadıköy" />
          <TextField label="Posta kodu" value={postalCode} onChangeText={setPostalCode} keyboardType="number-pad" placeholder="34000" />
          <TextField label="Maskeleme telefon numarası" value={maskedPhone} onChangeText={setMaskedPhone} placeholder="0532 *** ** 12" keyboardType="phone-pad" />
        </View>

        <Button title="Kaydet" onPress={handleSave} />
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
  securityNote: {
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 16,
  },
  securityText: {
    color: colors.text,
  },
  form: {
    gap: 16,
  },
});
