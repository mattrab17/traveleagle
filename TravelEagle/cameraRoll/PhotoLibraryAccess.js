import { Alert, Button, View, StyleSheet } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase';

// Expo ImagePicker: A library that provides access to the system UI for
// selecting images and videos from the phone's library or taking a photo with the camera.
export default function CameraRoll({ onImageSelected }) {
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    if (isUploading) return;

    try {
      setIsUploading(true);

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Permission to access the media library is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
      });

      if (result.canceled) {
        setIsUploading(false);
        return;
      }

      const imageUri = result.assets?.[0]?.uri;
      if (!imageUri) {
        Alert.alert('Image error', 'No image was selected.');
        setIsUploading(false);
        return;
      }

      // Resize before upload to avoid large memory spikes on mobile.
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1280 } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Convert local URI to uploadable binary.
      const response = await fetch(manipulatedImage.uri);
      const arrayBuffer = await response.arrayBuffer();

      // Keep extension clean if query params exist.
      const fileExt = 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `posts/${fileName}`;
      const mimeType = 'image/jpeg';

      const { error } = await supabase.storage
        .from('traveleagle-images')
        .upload(filePath, arrayBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        console.log(error);
        Alert.alert('Upload failed', error.message);
        setIsUploading(false);
        return;
      }

      const { data } = supabase.storage
        .from('traveleagle-images')
        .getPublicUrl(filePath);

      if (onImageSelected) {
        onImageSelected(data.publicUrl);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Image error', 'Could not pick or upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={isUploading ? 'Uploading image...' : 'Pick an image from camera roll'}
        onPress={pickImage}
        disabled={isUploading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
});
