import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import COLORS from '../constants/colors';

const FavoriteScreen = ({ likedProducts }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liked Products</Text>
      <ScrollView contentContainerStyle={styles.productsContainer}>
        {likedProducts.length > 0 ? (
          likedProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <Image source={{ uri: product.imageUrls[0] }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.productName}</Text>
                <Text style={styles.productLocation}>
                  <FontAwesome name="map-marker" size={16} color={COLORS.primary} /> {product.location}
                </Text>
                <Text style={styles.productPrice}>Ksh {product.minimumBidPrice}</Text>
                <Text style={styles.productBidders}>
                  <FontAwesome name="gavel" size={16} color={COLORS.primary} /> {product.numberOfBidders ? (product.numberOfBidders === 1 ? '1 Bidder' : `${product.numberOfBidders} Bidders`) : '0 Bidders'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noProductsText}>No liked products found.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 40,
    textAlign: 'center',
  },
  productsContainer: {
    alignItems: 'center',
  },
  productCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productLocation: {
    fontSize: 14,
    marginBottom: 5,
    color: COLORS.dark,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  productBidders: {
    fontSize: 14,
    marginTop: 5,
    color: COLORS.dark,
  },
  noProductsText: {
    fontSize: 18,
    color: COLORS.dark,
    marginTop: 20,
  },
});

export default FavoriteScreen;
