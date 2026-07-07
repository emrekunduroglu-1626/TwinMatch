import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'TwinChat'>;

const sampleMessages = [
  { id: '1', sender: 'Senin ikizin', text: 'Selin ile ilk temas için sakin ama merak uyandıran bir açılış öneriyorum.' },
  { id: '2', sender: 'Karşı tarafın ikizi', text: 'Sanat ve kahve ortak paydası üzerinden başlamak doğal bir akış yaratabilir.' },
  { id: '3', sender: 'Sistem', text: 'AI-to-AI görüşme sonucu: ilk buluşma için sergi + kahve planı öne çıktı.' },
];

export function TwinChatScreen({ navigation, route }: Props) {
  const profile = useSetupStore((state) => state.discoveryProfiles.find((item) => item.id === route.params.profileId));

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title>Dijital ikiz sohbeti</Title>
          <Body>{profile ? `${profile.name} için AI-to-AI ön görüşme özeti` : 'AI-to-AI ön görüşme özeti'}</Body>
        </View>

        <View style={styles.chatList}>
          {sampleMessages.map((message) => (
            <View key={message.id} style={styles.messageCard}>
              <Body style={styles.sender}>{message.sender}</Body>
              <Body style={styles.messageText}>{message.text}</Body>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Button title="Eşleme sürecine geç" onPress={() => navigation.navigate('MatchProcess', { profileId: route.params.profileId })} />
          <Button title="Profili tekrar gör" variant="secondary" onPress={() => navigation.navigate('ProfileDetail', { profileId: route.params.profileId })} />
          <Button title="Mesaj kutusuna dön" variant="secondary" onPress={() => navigation.navigate('Inbox')} />
        </View>
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
  chatList: {
    gap: 14,
  },
  messageCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 8,
  },
  sender: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  messageText: {
    color: colors.text,
  },
  footer: {
    gap: 12,
  },
});