import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'Notifications'>;

export function NotificationsScreen({ navigation }: Props) {
  const notifications = useSetupStore((state) => state.notifications);
  const markNotificationRead = useSetupStore((state) => state.markNotificationRead);

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Body style={styles.eyebrow}>Ekran 27 · Bildirimler</Body>
          <Title>Güncellemeler</Title>
          <Body>Eşleşme, takvim ve premium akışlarından gelen son gelişmeler.</Body>
        </View>

        <View style={styles.list}>
          {notifications.map((notification) => (
            <Pressable
              key={notification.id}
              style={[styles.notificationCard, !notification.read && styles.notificationUnread]}
              onPress={() => markNotificationRead(notification.id)}
            >
              <View style={styles.notificationTop}>
                <Body style={styles.notificationTitle}>{notification.title}</Body>
                <Body>{notification.timestamp}</Body>
              </View>
              <Body>{notification.description}</Body>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Button title="Mesaj kutusuna dön" onPress={() => navigation.navigate('Inbox')} />
          <Button title="Ayarları yönet" variant="secondary" onPress={() => navigation.navigate('Settings')} />
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
  notificationCard: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 10,
  },
  notificationUnread: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  notificationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  notificationTitle: {
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  footer: {
    gap: 12,
  },
});