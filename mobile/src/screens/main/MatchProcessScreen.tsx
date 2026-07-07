import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'MatchProcess'>;

const stages = [
  { title: 'Profil benzerliÄŸi', description: 'YaÅŸam tarzÄ±, ilgi alanlarÄ± ve hedefler vektÃ¶r benzerliÄŸi ile tarandÄ±.' },
  { title: 'Dijital ikiz gÃ¶rÃ¼ÅŸmesi', description: 'Ä°ki tarafÄ±n iletiÅŸim tonu ve beklentileri AI tarafÄ±ndan simÃ¼le edildi.' },
  { title: 'Uyumluluk raporu', description: 'SonuÃ§lar iliÅŸki potansiyeli, risk alanlarÄ± ve Ã¶nerilerle raporlandÄ±.' },
];

export function MatchProcessScreen({ navigation, route }: Props) {
  const profile = useSetupStore((state) => state.discoveryProfiles.find((item) => item.id === route.params.profileId));

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title>EÅŸleme sÃ¼reci</Title>
          <Body>{profile ? `${profile.name} ile eÅŸleÅŸmenin 3 aÅŸamalÄ± Ã¶zeti` : '3 aÅŸamalÄ± eÅŸleme Ã¶zeti'}</Body>
        </View>

        <View style={styles.timeline}>
          {stages.map((stage, index) => (
            <View key={stage.title} style={styles.stageCard}>
              <View style={styles.stageIndex}>
                <Title style={styles.stageIndexText}>{index + 1}</Title>
              </View>
              <View style={styles.stageContent}>
                <Body style={styles.stageTitle}>{stage.title}</Body>
                <Body>{stage.description}</Body>
              </View>
            </View>
          ))}
        </View>

        <Button title="Uyumluluk raporunu aÃ§" onPress={() => navigation.navigate('CompatibilityReport', { profileId: route.params.profileId })} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
    paddingBottom: 24,
  },
  header: {
    gap: 12,
    marginTop: 24,
  },
  timeline: {
    gap: 16,
  },
  stageCard: {
    flexDirection: 'row',
    gap: 16,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  stageIndex: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageIndexText: {
    fontSize: 20,
    lineHeight: 24,
  },
  stageContent: {
    flex: 1,
    gap: 8,
  },
  stageTitle: {
    color: colors.text,
    fontWeight: '700',
  },
});