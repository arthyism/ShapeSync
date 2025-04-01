import React, { useState } from 'react';
import { View, Image, StyleSheet, Alert, Text, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { toDateId } from '@marceloterreiro/flash-calendar';
import { Link } from 'expo-router';

const ProgressUploadScreen = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Need camera roll access to select images');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
      setUploadMessage('');
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert('No image selected', 'Please select an image first');
      return;
    }

    try {
      const directory = FileSystem.documentDirectory + 'gym-progress/';
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      const filename = toDateId(new Date())+ '.jpg';
      const newPath = directory + filename;

      await FileSystem.copyAsync({
        from: selectedImage,
        to: newPath,
      });

      setUploadMessage('Image uploaded successfully!');
      setSelectedImage(null);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload failed', 'There was an error saving the image');
    }
  };

  return (
  <View style={styles.container}>
    <View style={styles.buttonsContainer}>
      <Pressable
        style={styles.selectButton}
        onPress={pickImage}
      >
        <Text style={styles.buttonText}>Select Image</Text>
      </Pressable>

      <Pressable
        style={styles.uploadButton}
        onPress={uploadImage}
      >
        <Text style={styles.buttonText}>Upload Image</Text>
      </Pressable>
    </View>

    {selectedImage && (
      <Image
        source={{ uri: selectedImage }}
        style={styles.image}
        accessibilityLabel="Selected progress photo"
      />
    )}
    <Link href={'/checkuploads'}>verify uploads here</Link>
    {uploadMessage && <Text style={styles.message}>{uploadMessage}</Text>}
  </View>
);
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
    },
    buttonsContainer: {
      width: '100%',
      alignItems: 'center',
      marginTop: 40,
    },
    selectButton: {
      width: 262,
      height: 53,
      backgroundColor: '#EEEEEE',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 30,
    },
    uploadButton: {
      width: 262,
      height: 53,
      backgroundColor: '#EEEEEE',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 20,
    },
    buttonText: {
      color: '#000000',
      fontSize: 16,
      fontWeight: '500',
    },
    image: {
      width: 300,
      height: 300,
      borderRadius: 10,
      marginVertical: 10,
      alignSelf: 'center',
    },
    message: {
      color: 'green',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 20,
    },
  });

export default ProgressUploadScreen;