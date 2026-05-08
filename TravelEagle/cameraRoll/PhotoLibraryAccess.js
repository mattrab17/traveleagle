import { useState } from 'react';
import { Alert, Button, Image, View, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
//Expo ImagePicker: A library that provides access to the system's UI for 
// selecting images and videos from the phone's library or taking a photo with the camera.
export default function CameraRoll({ onImageSelected }) {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library.
    // Manually request permissions for videos on iOS when `allowsEditing` is set to `false`
    // and `videoExportPreset` is `'Passthrough'` (the default), ideally before launching the picker
    // so the app users aren't surprised by a system dialog after picking a video.
    // See "Invoke permissions for videos" sub section for more details.
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

<<<<<<< HEAD
    // Blob is needed because it converts the image into uploadable binary data.
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Extract extension and generate a unique filename.
    const fileExt = imageUri.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('traveleagle-images')
      .upload(`posts/${fileName}`, blob, {
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
      .getPublicUrl(`posts/${fileName}`);

    if (onImageSelected) {
      onImageSelected(data.publicUrl);
    }
  };
=======
  setImage(imageUri);
    //array buffer is used due blob causing issues where files would not show up 
    //in the storage bucket it converts the image into a format that can be uploaded
    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();
    // Extract the file extension from the image URI, defaulting to 'jpg' if it cannot be determined
    const fileExt = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
    // Generate a unique file name using the current timestamp and the file extension
    const fileName = `${Date.now()}.${fileExt}`;
    // Define the file path in the storage bucket where the image will be uploaded
    const filePath = `posts/${fileName}`;
     const { error } = await supabase.storage
          //the bucket we will upload to 
          .from('traveleagle-images')

          .upload(filePath, arrayBuffer, {

            contentType: 'image/jpeg',
            upsert: true,
          });


        if (error) {

          console.log(error);
          Alert.alert(
            'Upload failed',
            error.message
          );
          return
        }
         const { data } = supabase.storage
        .from('traveleagle-images')
        .getPublicUrl(filePath);

              if (onImageSelected) {
        onImageSelected(data.publicUrl);
      }
        }
}
>>>>>>> 5cf4487e89fc5418136554a2075619aad571f202

  return (
    <View style={styles.container}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
    </View>
  );
}
<<<<<<< HEAD
=======

>>>>>>> 5cf4487e89fc5418136554a2075619aad571f202
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
<<<<<<< HEAD
});
=======
})
>>>>>>> 5cf4487e89fc5418136554a2075619aad571f202
