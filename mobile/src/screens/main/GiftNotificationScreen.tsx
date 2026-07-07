import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Body, Title } from '../../components/Typography';
import { Button } from '../../components/Button';
import { MainStackParamList } from '../../navigation/types';
import { useGiftStore } from '../../store/giftStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<MainStackParamList, 'GiftNotification'>;

export function GiftNotificationScreen({ navigation }: Props) {
  const notifications = useGiftStore((state) => state.notifications);
  const acceptGift = useGiftStore((state) => state.acceptGift);
  const rejectGift = useGiftStore((state) => state.rejectGift);
  const toggleBlockedSender = useGiftStore((state) => state.toggleBlockedSender);

  const handleAccept = async (notificationId: string) => {
    await acceptGift(notificationId);
    navigation.navigate('GiftTracking');
  };

  const handleBlock = (senderName: string, notificationId: string) => {
    toggleBlockedSender(senderName);
    rejectGift(notificationId);
  };

  const handleReport = () => {
    Alert.alert('Şikayet alındı', 'Şikayetiniz güvenlik ekibimize iletildi.');
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Body style={styles.eyebrow}>Gelen hediye istekleri</Body>
          <Title>Sana gönderilen hediyeler</Title>
        </View>

        {notifications.length === 0 ? (
          <Body>Şu anda bekleyen hediye isteğin yok.</Body>
        ) : (
          <View style={styles.list}>
            {notifications.map((notification) => (
              <View key={notification.id} style={styles.card}>
                <Body style={styles.cardTitle}>{notification.senderName} sana anonim bir hediye göndermek istiyor</Body>
                <Body>Ürün kategorisi: {notification.category}</Body>
                <Body>Tahmini değer: {notification.estimatedValueRange}</Body>
                <View style={styles.noteBox}>
                  <Body>{notification.note}</Body>
                </View>

                <Button title="Hediyeyi Kabul Et" onPress={() => handleAccept(notification.id)} />
                <Button title="Reddet" variant="secondary" onPress={() => rejectGift(notification.id)} />
                <Button
                  title="Bu kişiden hediye alma"
                  variant="secondary"
                  style={styles.dangerButton}
                  onPress={() => handleBlock(notification.senderName, notification.id)}
                />
                <Body style={styles.reportLink} onPress={handleReport}>
                  Şikayet Et
                </Body>
              </View>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
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
    gap: 16,
  },
  card: {
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 10,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  noteBox: {
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    padding: 12,
  },
  dangerButton: {
    borderColor: colors.danger,
  },
  reportLink: {
    color: colors.danger,
    fontWeight: '700',
    textAlign: 'center',
  },
});
