import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Body, Title } from '../../components/Typography';
import { SetupStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<SetupStackParamList, 'SelfieVerification'>;

export function SelfieVerificationScreen({ navigation }: Props) {
  const selfieVerified = useSetupStore((state) => state.selfieVerified);
  const verifySelfie = useSetupStore((state) => state.verifySelfie);

  const handleVerify = () => {
    verifySelfie();
    Alert.alert('Doğrulama tamamlandı', 'Selfie doğrulaması demo akışta onaylandı.');
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title>Selfie doğrulaması</Title>
          <Body>Profil güveni için canlı selfie doğrulaması yap. AWS Rekognition entegrasyonu için hazır akış.</Body>
        </View>

        <View style={styles.previewCard}>
          <View style={[styles.previewCircle, selfieVerified && styles.previewCircleActive]} />
          <Body style={styles.previewText}>
            {selfieVerified ? 'Yüz doğrulandı ve profilin güven rozeti almaya hazır.' : 'Kamerayı yüz hizasında tut, iyi ışıkta tek kare selfie çek.'}
          </Body>
        </View>

        <View style={styles.footer}>
          <Button title={selfieVerified ? 'Devam et' : 'Selfie doğrula'} onPress={selfieVerified ? () => navigation.navigate('ProfileInfo') : handleVerify} />
          {!selfieVerified && <Button title="Şimdilik atla" variant="secondary" onPress={() => navigation.navigate('ProfileInfo')} />}
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
  previewCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  previewCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  previewCircleActive: {
    borderColor: colors.success,
    backgroundColor: '#123322',
  },
  previewText: {
    textAlign: 'center',
  },
  footer: {
    gap: 12,
  },
});