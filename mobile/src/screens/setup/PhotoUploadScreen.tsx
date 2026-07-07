import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Body, Title } from '../../components/Typography';
import { SetupStackParamList } from '../../navigation/types';
import { useSetupStore } from '../../store/setupStore';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<SetupStackParamList, 'PhotoUpload'>;

const photoSuggestions = ['Coffee date', 'Mirror selfie', 'Travel memory', 'Friends night'];

export function PhotoUploadScreen({ navigation }: Props) {
  const photos = useSetupStore((state) => state.photos);
  const addPhoto = useSetupStore((state) => state.addPhoto);
  const removePhoto = useSetupStore((state) => state.removePhoto);

  const handleContinue = () => {
    if (photos.length < 3) {
      Alert.alert('Daha fazla fotoğraf ekle', 'Devam etmek için en az 3 fotoğraf gerekli.');
      return;
    }

    navigation.navigate('VideoUpload');
  };

  return (
    <Screen scroll>
      <View style={styles.container}>
        <View style={styles.header}>
          <Title>Fotoğraflarını yükle</Title>
          <Body>En az 3 fotoğraf ekleyerek profilini daha güvenilir ve görünür hale getir.</Body>
        </View>

        <View style={styles.grid}>
          {photos.map((photo) => (
            <Pressable key={photo} style={styles.photoCard} onPress={() => removePhoto(photo)}>
              <Body style={styles.photoTitle}>{photo}</Body>
              <Body style={styles.photoHint}>Kaldırmak için dokun</Body>
            </Pressable>
          ))}
          {photoSuggestions.filter((item) => !photos.includes(item)).map((photo) => (
            <Pressable key={photo} style={[styles.photoCard, styles.photoCardMuted]} onPress={() => addPhoto(photo)}>
              <Body style={styles.photoTitle}>{photo}</Body>
              <Body style={styles.photoHint}>Eklemek için dokun</Body>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Body>{photos.length} fotoğraf seçildi</Body>
          <Button title="Video adımına geç" onPress={handleContinue} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
  },
  header: {
    gap: 12,
    marginTop: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoCard: {
    width: '47%',
    minHeight: 140,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 16,
    justifyContent: 'space-between',
  },
  photoCardMuted: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  photoTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  photoHint: {
    fontSize: 13,
  },
  footer: {
    gap: 12,
    marginTop: 8,
  },
});