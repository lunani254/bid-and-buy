// ProductDetailsScreen.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../constants/colors';

const { width, height } = Dimensions.get('window');

const ProductDetailsScreen = ({ route }) => {
  const { product } = route.params; // Extracting product from route params
  const navigation = useNavigation();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentImageIndex(index);
  };

  const handleBidNow = () => {
    navigation.navigate('PlaceBidScreen', {
      productId: product.id, // Passing productId to PlaceBidScreen
      productName: product.productName,
      minimumBidPrice: product.minimumBidPrice,
      product: product // Optionally passing the entire product object
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.imageScroll}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {product.imageUrls && product.imageUrls.length > 0 ? (
          product.imageUrls.map((imageUrl, index) => (
            <Image key={index} source={{ uri: imageUrl }} style={styles.productImage} />
          ))
        ) : (
          <Image source={{ uri: 'default_image_url' }} style={styles.productImage} />
        )}
      </ScrollView>

      {product.imageUrls && product.imageUrls.length > 1 && (
        <View style={styles.dotsContainer}>
          {product.imageUrls.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: currentImageIndex === index ? COLORS.primary : '#fff' },
              ]}
            />
          ))}
        </View>
      )}

      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{product.productName}</Text>
        <Text style={styles.productLocation}>
          <Text style={styles.locationIcon}>📍</Text> {product.location}
        </Text>
        <Text style={styles.productDescription}>{product.productDescription}</Text>
        <Text style={styles.productPrice}>Ksh {product.minimumBidPrice}</Text>
        <TouchableOpacity style={styles.bidButton} onPress={handleBidNow}>
          <Text style={styles.bidButtonText}>Bid Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 50,
  },
  backButtonText: {
    color: 'white',
  },
  imageScroll: {
    width: width,
    height: height * 0.75,
  },
  productImage: {
    width: width,
    height: height * 0.75,
    resizeMode: 'cover',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 1,
    backgroundColor: '#fff',
    marginTop: 100,
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -250,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  productLocation: {
    fontSize: 20,
    color: COLORS.primary,
    marginBottom: 10,
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 5,
  },
  productDescription: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  bidButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  bidButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProductDetailsScreen;