import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Body, Title } from '../../components/Typography';
import { SetupStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<SetupStackParamList, 'DigitalTwinCreation'>;

export function DigitalTwinCreationScreen({ navigation }: Props) {
  const profileInfo = useSetupStore((state) => state.profileInfo);
  const photos = useSetupStore((state) => state.photos);
  const communicationStyle = useSetupStore((state) => state.communicationStyle);
  const surveyAnswers = useSetupStore((state) => state.surveyAnswers);
  const completeSetup = useSetupStore((state) => state.completeSetup);
  const login = useAuthStore((state) => state.login);

  const handleComplete = () => {
    completeSetup();
    login();
    navigation.getParent()?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      }),
    );
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title>Dijital ikiz hazır</Title>
          <Body>Profil verilerin, tercihlerin ve iletişim tonun birleştirilerek ilk ikiz profili oluşturuldu.</Body>
        </View>

        <View style={styles.summaryCard}>
          <Body style={styles.summaryTitle}>{profileInfo.displayName || 'Yeni kullanıcı'}</Body>
          <Body>{photos.length} fotoğraf, {Object.keys(surveyAnswers).length} anket cevabı ve {communicationStyle ?? 'seçilmemiş'} iletişim tonu işlendi.</Body>
          <Body>Sonraki sprintte bu ekran backend `digital-twin/create` endpointine bağlanabilir.</Body>
        </View>

        <View style={styles.footer}>
          <Button title="Kurulumu tamamla" onPress={handleComplete} />
          <Button title="İletişim tarzını düzenle" variant="secondary" onPress={() => navigation.navigate('CommunicationStyle')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 24,
  },
  header: {
    gap: 12,
    marginTop: 24,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
    padding: 24,
    justifyContent: 'center',
    gap: 12,
  },
  summaryTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  footer: {
    gap: 12,
  },
});