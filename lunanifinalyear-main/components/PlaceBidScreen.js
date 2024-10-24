import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { database, auth } from '../firebase';
import { ref, push, set, update, get, query, orderByChild, equalTo } from 'firebase/database';
import COLORS from '../constants/colors';

const PlaceBidScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product, productId } = route.params; // Ensure productId is received from the route params
  const [bidPrice, setBidPrice] = useState(product.minimumBidPrice.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const confirmBid = async () => {
    setIsLoading(true);
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'You must be logged in to place a bid.');
      setIsLoading(false);
      return;
    }

    const userId = user.uid;
    const userEmail = user.email;

    if (!productId) {
      Alert.alert('Error', 'Product ID is not defined.');
      setIsLoading(false);
      return;
    }

    if (userId === product.userId) {
      Alert.alert('Error', 'You cannot place a bid on your own product.');
      setIsLoading(false);
      return;
    }

    try {
      const userBidsRef = query(ref(database, `bids/${userId}`), orderByChild('productId'), equalTo(productId));
      const userBidsSnapshot = await get(userBidsRef);

      if (userBidsSnapshot.exists()) {
        Alert.alert('Notice', 'You have already placed a bid on this product. Try out our latest products.');
        setIsLoading(false);
        return;
      }

      const productRef = ref(database, `ads/${productId}`);
      const productSnapshot = await get(productRef);
      if (!productSnapshot.exists()) {
        Alert.alert('Error', 'Product not found.');
        setIsLoading(false);
        return;
      }
      
      const productData = productSnapshot.val();
      const numberOfBidders = (productData?.numberOfBidders || 0) + 1;

      const bidData = {
        userId,
        email: userEmail,
        productId,
        bidPrice: parseInt(bidPrice),
        timeStamp: new Date().toISOString(),
        productName: product.productName,
      };

      // Save bid under the user's bids
      const newBidRef = push(ref(database, `bids/${userId}`));
      await set(newBidRef, bidData);

      // Save bid under the product's bids
      const newProductBidRef = push(ref(database, `ads/${productId}/bids`));
      await set(newProductBidRef, bidData);

      // Update product information
      await update(productRef, {
        currentBid: parseInt(bidPrice),
        numberOfBidders,
      });

      setSuccessMessage(`You have placed a bid of ksh ${bidPrice}`);
      setTimeout(() => {
        navigation.navigate('HomeScreen');
      }, 2000);
    } catch (error) {
      console.error('Error placing bid:', error);
      Alert.alert('Error', `There was an error placing your bid: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBid = () => {
    Alert.alert(
      'Confirm Bid',
      `Are you sure you want to bid ksh ${bidPrice}? You can only bid once.`,
      [
        {
          text: 'Cancel',
          onPress: () => setIsLoading(false),
          style: 'cancel'
        },
        {
          text: 'Confirm',
          onPress: () => confirmBid(),
        }
      ],
      { cancelable: false }
    );
  };

  const handleInputChange = (text) => {
    setBidPrice(text);
  };

  const increaseBid = () => {
    setBidPrice((prevBid) => (parseInt(prevBid) + 100).toString());
  };

  const decreaseBid = () => {
    setBidPrice((prevBid) => {
      const newBid = parseInt(prevBid) - 100;
      return newBid > 0 ? newBid.toString() : '0';
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.productName}>{product.productName}</Text>
        <Text style={styles.currentBid}>Current Bid: ksh {product.minimumBidPrice}</Text>
        <View style={styles.bidContainer}>
          <TouchableOpacity onPress={decreaseBid} style={styles.adjustButton}>
            <Text style={styles.adjustButtonText}>-</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.bidInput}
            value={bidPrice}
            keyboardType="numeric"
            onChangeText={handleInputChange}
            editable={!isLoading}
          />
          <TouchableOpacity onPress={increaseBid} style={styles.adjustButton}>
            <Text style={styles.adjustButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          onPress={handleConfirmBid} 
          style={styles.confirmButton}
          disabled={isLoading}
        >
          <Text style={styles.confirmButtonText}>
            {isLoading ? 'Bidding...' : 'Confirm Bid'}
          </Text>
        </TouchableOpacity>
        {successMessage && (
          <Text style={styles.successMessage}>{successMessage}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 50,
  },
  backButtonText: {
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  currentBid: {
    fontSize: 16,
    marginBottom: 10,
  },
  bidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  adjustButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
    borderRadius: 20,
  },
  adjustButtonText: {
    fontSize: 20,
    color: '#333',
  },
  bidInput: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  successMessage: {
    marginTop: 20,
    textAlign: 'center',
    color: '#28a745',
    fontWeight: '600',
  },
});

export default PlaceBidScreen;
