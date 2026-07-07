import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Body, Title } from '../../components/Typography';
import { SetupStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<SetupStackParamList, 'DigitalTwinSurvey'>;

const questions = [
  'Yeni biriyle tanışırken önce dinlemeyi mi yoksa anlatmayı mı tercih edersin?',
  'Hafta sonu planında spontane kararlar mı yoksa net program mı seni rahatlatır?',
  'Bir ilişkide en çok hangi değer seni güvende hissettirir?',
];

const options = [
  { label: 'Kesinlikle A', value: 1 },
  { label: 'A’ya daha yakınım', value: 2 },
  { label: 'Dengede', value: 3 },
  { label: 'B’ye daha yakınım', value: 4 },
  { label: 'Kesinlikle B', value: 5 },
];

export function DigitalTwinSurveyScreen({ navigation }: Props) {
  const surveyAnswers = useSetupStore((state) => state.surveyAnswers);
  const answerSurvey = useSetupStore((state) => state.answerSurvey);
  const [index, setIndex] = useState(0);
  const question = useMemo(() => questions[index], [index]);
  const selectedValue = surveyAnswers[index];

  const handleSelect = (value: number) => {
    answerSurvey(index, value);
  };

  const handleContinue = () => {
    if (!selectedValue) {
      return;
    }

    if (index < questions.length - 1) {
      setIndex((current) => current + 1);
      return;
    }

    navigation.navigate('PartnerPreferences');
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Body>{index + 1} / {questions.length}</Body>
          <Title>Dijital ikiz anketi</Title>
          <Body>{question}</Body>
        </View>

        <View style={styles.options}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              style={[styles.option, selectedValue === option.value && styles.optionActive]}
              onPress={() => handleSelect(option.value)}
            >
              <Body style={selectedValue === option.value ? styles.optionTextActive : undefined}>{option.label}</Body>
            </Pressable>
          ))}
        </View>

        <Button title={index === questions.length - 1 ? 'Tercihlere geç' : 'Sonraki soru'} onPress={handleContinue} variant={selectedValue ? 'primary' : 'secondary'} />
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
  options: {
    gap: 12,
  },
  option: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 18,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  optionTextActive: {
    color: colors.text,
  },
});