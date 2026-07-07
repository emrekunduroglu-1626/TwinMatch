import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Body, Title } from '../../components/Typography';
import { SetupStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';

type Props = NativeStackScreenProps<SetupStackParamList, 'PartnerPreferences'>;

export function PartnerPreferencesScreen({ navigation }: Props) {
  const partnerPreferences = useSetupStore((state) => state.partnerPreferences);
  const updatePartnerPreferences = useSetupStore((state) => state.updatePartnerPreferences);
  const [minAge, setMinAge] = useState(String(partnerPreferences.ageRange[0]));
  const [maxAge, setMaxAge] = useState(String(partnerPreferences.ageRange[1]));
  const [preferredCity, setPreferredCity] = useState(partnerPreferences.preferredCity);
  const [education, setEducation] = useState(partnerPreferences.education);
  const [smokingPreference, setSmokingPreference] = useState(partnerPreferences.smokingPreference);
  const [childrenPreference, setChildrenPreference] = useState(partnerPreferences.childrenPreference);

  const handleContinue = () => {
    const parsedMinAge = Number(minAge);
    const parsedMaxAge = Number(maxAge);

    if (!parsedMinAge || !parsedMaxAge || parsedMinAge > parsedMaxAge) {
      Alert.alert('Yaş aralığı geçersiz', 'Minimum yaş maksimum yaştan büyük olamaz.');
      return;
    }

    updatePartnerPreferences({
      ageRange: [parsedMinAge, parsedMaxAge],
      preferredCity,
      education,
      smokingPreference,
      childrenPreference,
    });
    navigation.navigate('CommunicationStyle');
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title>Partner tercihlerin</Title>
          <Body>Algoritmanın daha doğru adaylar önermesi için tercihlerini belirt.</Body>
        </View>

        <View style={styles.form}>
          <TextField label="Minimum yaş" value={minAge} onChangeText={setMinAge} keyboardType="number-pad" />
          <TextField label="Maksimum yaş" value={maxAge} onChangeText={setMaxAge} keyboardType="number-pad" />
          <TextField label="Tercih edilen şehir" value={preferredCity} onChangeText={setPreferredCity} placeholder="Ankara" />
          <TextField label="Eğitim tercihi" value={education} onChangeText={setEducation} placeholder="Lisans ve üzeri" />
          <TextField label="Sigara tercihi" value={smokingPreference} onChangeText={setSmokingPreference} placeholder="Kullanmayan" />
          <TextField label="Çocuk tercihi" value={childrenPreference} onChangeText={setChildrenPreference} placeholder="İsteyen" />
        </View>

        <Button title="İletişim tarzına geç" onPress={handleContinue} />
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
});