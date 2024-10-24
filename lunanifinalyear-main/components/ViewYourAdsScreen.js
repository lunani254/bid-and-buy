import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from '../firebase';
import { ref, onValue, remove } from 'firebase/database';
import COLORS from '../constants/colors';

const ViewYourAdsScreen = () => {
  const [user, setUser] = useState(null);
  const [userAds, setUserAds] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authenticatedUser) => {
      if (authenticatedUser) {
        setUser(authenticatedUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchUserAds = () => {
        const adsRef = ref(database, 'ads');
        onValue(adsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const userAdsArray = Object.keys(data)
              .map(key => ({ id: key, productId: data[key].productId, ...data[key] }))
              .filter(ad => ad.userId === user.uid);
            setUserAds(userAdsArray);
          } else {
            setUserAds([]);
          }
        });
      };

      fetchUserAds();
    } else {
      setUserAds([]);
    }
  }, [user]);

  const deleteAd = (adId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this ad?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const adRef = ref(database, `ads/${adId}`);
              await remove(adRef);
              setUserAds((prevAds) => prevAds.filter((ad) => ad.id !== adId));
              Alert.alert('Success', 'Ad deleted successfully');
            } catch (error) {
              console.error('Error removing ad: ', error);
              Alert.alert('Error', 'Failed to delete the ad. Please try again.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ViewYourProductProgressScreen', { productId: item.productId })}>
      <View style={styles.productCard}>
        {item.imageUrls && item.imageUrls[0] && (
          <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.productName}</Text>
          <Text style={styles.productLocation}>
            <FontAwesome name="map-marker" size={16} color={COLORS.primary} /> {item.location}
          </Text>
          <Text style={styles.productPrice}>ksh {item.minimumBidPrice}</Text>
          <Text style={styles.productDescription}>{item.productDescription}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => deleteAd(item.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Your Ads</Text>
      <FlatList
        data={userAds}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.productList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#fff',
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
  header: {
    fontSize: 24,
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 40, // Adjusted to make room for the back button
  },
  productList: {
    width: '100%',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    padding: 10,
    marginHorizontal: 10,
    alignItems: 'center',
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productLocation: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ViewYourAdsScreen;
