import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Body, Title } from '../../components/Typography';
import { SetupStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<SetupStackParamList, 'VideoUpload'>;

export function VideoUploadScreen({ navigation }: Props) {
  const introVideo = useSetupStore((state) => state.introVideo);
  const setIntroVideo = useSetupStore((state) => state.setIntroVideo);

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title>Kısa tanıtım videosu</Title>
          <Body>30 saniyelik video ile enerjini ve iletişim tarzını daha iyi göster.</Body>
        </View>

        <View style={styles.videoCard}>
          <Body style={styles.videoTitle}>{introVideo ?? 'Henüz video seçilmedi'}</Body>
          <Body>{introVideo ? 'Video hazır. İstersen değiştir veya sonraki adıma geç.' : 'Demo akışta örnek video seçimi simüle edilir.'}</Body>
        </View>

        <View style={styles.footer}>
          <Button title={introVideo ? 'Videoyu değiştir' : 'Örnek video seç'} onPress={() => setIntroVideo(introVideo ? null : 'intro-video-30s.mp4')} />
          <Button title="Anket adımına geç" variant="secondary" onPress={() => navigation.navigate('DigitalTwinSurvey')} />
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
  videoCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    padding: 24,
    justifyContent: 'center',
    gap: 12,
  },
  videoTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  footer: {
    gap: 12,
  },
});