import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import COLORS from '../constants/colors';

const SearchScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = () => {
      const productsRef = ref(database, 'ads');
      onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const productArray = Object.keys(data).map(key => ({
            id: key,
            productId: key,
            ...data[key]
          }));
          setProducts(productArray);
        }
      });
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchText.toLowerCase()) ||
    product.location.toLowerCase().includes(searchText.toLowerCase()) ||
    product.productDescription.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard} 
      onPress={() => navigation.navigate('ProductDetailsScreen', { product: item, productId: item.productId })}
    >
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
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={item => item.productId}
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
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    width: '90%',
    paddingHorizontal: 10,
    marginBottom: 20,
    alignSelf: 'center',
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
});

export default SearchScreen;
