import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'Inbox'>;

export function InboxScreen({ navigation }: Props) {
  const inboxThreads = useSetupStore((state) => state.inboxThreads);

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Body style={styles.eyebrow}>Ekran 26 · Mesaj kutusu</Body>
          <Title>Tüm konuşmalar</Title>
          <Body>Dijital ikiz özetleri, eşleşme güncellemeleri ve planlama mesajları tek yerde.</Body>
        </View>

        <View style={styles.list}>
          {inboxThreads.map((thread) => (
            <Pressable key={thread.id} style={styles.threadCard} onPress={() => navigation.navigate('TwinChat', { profileId: thread.profileId })}>
              <View style={styles.threadTop}>
                <Body style={styles.threadTitle}>{thread.title}</Body>
                <Body>{thread.timestamp}</Body>
              </View>
              <Body>{thread.preview}</Body>
              <View style={styles.threadBottom}>
                <Body>{thread.unreadCount > 0 ? `${thread.unreadCount} okunmamış` : 'Tümü okundu'}</Body>
                <Body style={styles.linkText}>Sohbeti aç</Body>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Button title="Bildirimlere git" onPress={() => navigation.navigate('Notifications')} />
          <Button title="Ayarları aç" variant="secondary" onPress={() => navigation.navigate('Settings')} />
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
  eyebrow: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  list: {
    gap: 14,
  },
  threadCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 10,
  },
  threadTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  threadTitle: {
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  threadBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  linkText: {
    color: colors.primarySoft,
    fontWeight: '700',
  },
  footer: {
    gap: 12,
  },
});