import { useState } from 'react';
import { Alert, Button, View, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

// Expo ImagePicker: A library that provides access to the system UI for
// selecting images and videos from the phone's library or taking a photo with the camera.
export default function CameraRoll({ onImageSelected }) {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access the media library is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) return;

    const imageUri = result.assets[0].uri;
    setImage(imageUri);

    // Convert local URI to uploadable binary.
    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();

    // Keep extension clean if query params exist.
    const fileExt = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { error } = await supabase.storage
      .from('traveleagle-images')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.log(error);
      Alert.alert('Upload failed', error.message);
      return;
    }

    const { data } = supabase.storage
      .from('traveleagle-images')
      .getPublicUrl(filePath);

    if (onImageSelected) {
      onImageSelected(data.publicUrl);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
});
