import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, FlatList, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { database, storage, auth } from '../firebase';
import { ref as dbRef, push, serverTimestamp, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import COLORS from '../constants/colors';

const PostAdScreen = () => {
  const navigation = useNavigation();
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [location, setLocation] = useState('');
  const [minimumBidPrice, setMinimumBidPrice] = useState('');
  const [selectedImages, setSelectedImages] = useState(['', '', '']);
  const [uploading, setUploading] = useState(false);

  const handleImagePicker = async (index) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission to access camera roll is required!');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.cancelled && pickerResult.assets && pickerResult.assets.length > 0) {
      const uri = pickerResult.assets[0].uri;
      const resizedImageUri = await resizeImage(uri);
      if (resizedImageUri) {
        const updatedImages = [...selectedImages];
        updatedImages[index] = resizedImageUri;
        setSelectedImages(updatedImages);
      }
    }
  };

  const handleCameraPicker = async (index) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission to access camera is required!');
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!pickerResult.cancelled && pickerResult.uri) {
      const resizedImageUri = await resizeImage(pickerResult.uri);
      if (resizedImageUri) {
        const updatedImages = [...selectedImages];
        updatedImages[index] = resizedImageUri;
        setSelectedImages(updatedImages);
      }
    }
  };

  const resizeImage = async (uri) => {
    try {
      const resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      return resizedImage.uri;
    } catch (error) {
      console.error('Error resizing image:', error);
      Alert.alert('Error!', 'Failed to resize the image. Please try again.');
      return null;
    }
  };

  const handleDeleteImage = (index) => {
    const updatedImages = [...selectedImages];
    updatedImages[index] = '';
    setSelectedImages(updatedImages);
  };

  const validateForm = () => {
    if (!productName || !productDescription || !location || !minimumBidPrice) {
      return false;
    }
    if (!selectedImages.some(image => image !== '')) {
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Error!', 'All fields and at least one image are required.');
      return;
    }
  
    setUploading(true);
    const uploadedImageUrls = [];
  
    for (const imageUri of selectedImages) {
      if (imageUri) {
        try {
          const response = await fetch(imageUri);
          const blob = await response.blob();
  
          const fileRef = storageRef(storage, `images/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
          await uploadBytes(fileRef, blob);
  
          const downloadUrl = await getDownloadURL(fileRef);
          uploadedImageUrls.push(downloadUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Error!', 'Failed to upload an image. Please try again.');
          setUploading(false);
          return;
        }
      }
    }
  
    const newAdRef = push(dbRef(database, 'ads'));
    const productId = newAdRef.key; // Get the unique key for the new ad
  
    const adData = {
      productId,
      userId: auth.currentUser?.uid,
      productName,
      productDescription,
      location,
      minimumBidPrice,
      imageUrls: uploadedImageUrls,
      timestamp: serverTimestamp(),
    };
  
    try {
      await set(newAdRef, adData);
      Alert.alert('Success!', 'Your ad has been posted successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding document:', error);
      Alert.alert('Error!', 'Failed to post your ad. Please try again later.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <FlatList
      data={[{ key: 'form' }]}
      renderItem={({ item }) => (
        <View key={item.key} style={styles.container}>
          <TouchableOpacity
            onPress={() => !uploading && navigation.goBack()}
            style={styles.backButton}
            disabled={uploading}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.heading}>Post Your Ad</Text>

          <TextInput
            style={styles.input}
            placeholder="Product Name"
            value={productName}
            onChangeText={setProductName}
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Product Description"
            value={productDescription}
            onChangeText={setProductDescription}
            multiline={true}
            numberOfLines={4}
          />

          <GooglePlacesAutocomplete
            placeholder="Search for location"
            onPress={(data, details = null) => {
              setLocation(data.description);
            }}
            query={{
              key: 'AIzaSyDsshE3f6cy8e2vnaZuOf-Ig_muEYyHMzI',
              language: 'en',
              types: 'geocode',
            }}
            styles={{
              textInputContainer: styles.autocompleteContainer,
              textInput: styles.input,
              listView: styles.listView,
            }}
          />

          <TextInput
            style={styles.input}
            placeholder="Minimum Bid Price"
            value={minimumBidPrice}
            onChangeText={setMinimumBidPrice}
            keyboardType="numeric"
          />

          <View style={styles.imageGrid}>
            <TouchableOpacity
              style={[styles.imagePicker, styles.largeImagePicker]}
              onPress={() => handleImagePicker(0)}
            >
              {selectedImages[0] ? (
                <>
                  <Image source={{ uri: selectedImages[0] }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={styles.deleteIconLarge}
                    onPress={() => handleDeleteImage(0)}
                  >
                    <Ionicons name="trash" size={24} color="red" />
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.imagePickerText}>Add Image</Text>
              )}
            </TouchableOpacity>

            <View style={styles.smallImagesContainer}>
              {[1, 2].map(index => (
                <TouchableOpacity
                  key={index}
                  style={[styles.imagePicker, styles.smallImagePicker]}
                  onPress={() => handleImagePicker(index)}
                >
                  {selectedImages[index] ? (
                    <>
                      <Image source={{ uri: selectedImages[index] }} style={styles.selectedImage} />
                      <TouchableOpacity
                        style={styles.deleteIconSmall}
                        onPress={() => handleDeleteImage(index)}
                      >
                        <Ionicons name="trash" size={20} color="red" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <Text style={styles.imagePickerText}>Add Image</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={uploading || !validateForm()}
          >
            <Text style={styles.submitButtonText}>{uploading ? 'Uploading...' : 'Submit'}</Text>
          </TouchableOpacity>
        </View>
      )}
      keyExtractor={(item) => item.key}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    zIndex: 1,
    backgroundColor: `${COLORS.primary}90`, // Translucent primary color
    borderRadius: 20, // Make it more rounded
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)', // Add a slight border for better contrast
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.primary,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  autocompleteContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
    zIndex: 2,
  },
  listView: {
    zIndex: 2,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  smallImagesContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  largeImagePicker: {
    width: 200,
    height: 200,
  },
  smallImagePicker: {
    width: 95,
    height: 95,
  },
  imagePickerText: {
    textAlign: 'center',
    color: COLORS.primary,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  deleteIconLarge: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  deleteIconSmall: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  submitButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default PostAdScreen;
