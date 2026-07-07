import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Body, Title } from '../../components/Typography';
import { SetupStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<SetupStackParamList, 'CommunicationStyle'>;

const stylesList = [
  { key: 'romantic', title: 'Romantik', description: 'Sıcak, duygusal ve özenli bir ton.' },
  { key: 'fun', title: 'Eğlenceli', description: 'Esprili, hafif ve enerjik bir yaklaşım.' },
  { key: 'direct', title: 'Net', description: 'Açık, dürüst ve hızlı iletişim.' },
];

export function CommunicationStyleScreen({ navigation }: Props) {
  const communicationStyle = useSetupStore((state) => state.communicationStyle);
  const setCommunicationStyle = useSetupStore((state) => state.setCommunicationStyle);

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title>İletişim tarzını seç</Title>
          <Body>Dijital ikizin ilk sohbetlerde hangi tonda ilerleyeceğini belirle.</Body>
        </View>

        <View style={styles.cards}>
          {stylesList.map((item) => {
            const active = communicationStyle === item.key;
            return (
              <Pressable key={item.key} style={[styles.card, active && styles.cardActive]} onPress={() => setCommunicationStyle(item.key)}>
                <Title style={styles.cardTitle}>{item.title}</Title>
                <Body>{item.description}</Body>
              </Pressable>
            );
          })}
        </View>

        <Button title="İkizi oluşturmaya geç" onPress={() => navigation.navigate('DigitalTwinCreation')} variant={communicationStyle ? 'primary' : 'secondary'} />
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
  cards: {
    gap: 14,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    gap: 10,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  cardTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
});