import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Text, ScrollView, Dimensions, TouchableOpacity, StatusBar, SafeAreaView, Animated, PanResponder, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import COLORS from '../constants/colors';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ likedProducts = [], setLikedProducts = () => {} }) => {
  const [products, setProducts] = useState([]);
  const scrollViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const navigation = useNavigation();
  const animatedValue = useRef(new Animated.Value(height * 0.7)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 20;
      },
      onPanResponderMove: Animated.event(
        [null, { dy: animatedValue }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50) {
          // Swipe up
          Animated.timing(animatedValue, {
            toValue: height * 0.25,
            duration: 300,
            useNativeDriver: false,
          }).start();
        } else if (gestureState.dy > 50) {
          // Swipe down
          Animated.timing(animatedValue, {  // Fixed the ttiming typo here
            toValue: height * 0.7,
            duration: 300,
            useNativeDriver: false,
          }).start();
        } else {
          // Snap to closest position
          Animated.timing(animatedValue, {
            toValue: animatedValue._value > height * 0.475 ? height * 0.7 : height * 0.25,
            duration: 300,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prevPage) => {
        const nextPage = (prevPage + 1) % 3;
        scrollToPage(nextPage);
        return nextPage;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const db = getDatabase();
    const productsRef = ref(db, 'ads');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      const productArray = data ? Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      })) : [];
      productArray.sort((a, b) => (b.numberOfBidders || 0) - (a.numberOfBidders || 0));
      setProducts(productArray);
    });

    // Fetch liked products for the current user
    const likedProductsRef = ref(db, `users/currentUserId/likedProducts`);
    onValue(likedProductsRef, (snapshot) => {
      const data = snapshot.val();
      const likedProductArray = data ? Object.values(data) : [];
      setLikedProducts(likedProductArray);
    });
  }, []);

  const handleScroll = (event) => {
    const { x } = event.nativeEvent.contentOffset;
    const page = Math.round(x / width);
    setCurrentPage(page);
  };

  const scrollToPage = (page) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: page * width,
        animated: true,
      });
    }
  };

  const handleLike = (product) => {
    setLikedProducts((prev) => {
      let updatedLikedProducts;
      if (prev.some((item) => item.id === product.id)) {
        updatedLikedProducts = prev.filter((item) => item.id !== product.id);
      } else {
        updatedLikedProducts = [...prev, product];
      }

      const db = getDatabase();
      set(ref(db, `users/currentUserId/likedProducts`), updatedLikedProducts);

      return updatedLikedProducts;
    });
  };

  const isLiked = (product) => likedProducts.some((item) => item.id === product.id);

  const handlePress = (product) => {
    const { bidders, ...productDetails } = product;
    navigation.navigate('ProductDetailsScreen', { product: productDetails, productId: product.id });
  };

  const handleBid = (product) => {
    const { bidders, ...productDetails } = product;
    navigation.navigate('ProductDetailsScreen', { product: productDetails, productId: product.id });
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productWrapper}>
      <TouchableOpacity onPress={() => handlePress(item)}>
        <View style={styles.productCard}>
          <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
          <TouchableOpacity onPress={() => handleLike(item)} style={styles.heartIcon}>
            <FontAwesome
              name="heart"
              size={24}
              color={isLiked(item) ? COLORS.primary : 'gray'}
            />
          </TouchableOpacity>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.productName}</Text>
            <Text style={styles.productLocation}>
              <FontAwesome name="map-marker" size={16} color={COLORS.primary} /> {item.location}
            </Text>
            <Text style={styles.productPrice}>Ksh {item.minimumBidPrice}</Text>
            <Text style={styles.productBidders}>
              <FontAwesome name="gavel" size={16} color={COLORS.primary} /> {item.numberOfBidders ? (item.numberOfBidders === 1 ? '1 Bidder' : `${item.numberOfBidders} Bidders`) : '0 Bidders'}
            </Text>
            <TouchableOpacity style={styles.bidButton} onPress={() => handleBid(item)}>
              <Text style={styles.bidButtonText}>Bid</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
      <View style={styles.hotBidContainer}>
        <Text style={styles.hotBidText}>HOT BIDS TODAY 🔥</Text>
      </View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        onMomentumScrollEnd={handleScroll}
        showsHorizontalScrollIndicator={false}
      >
        {products.slice(0, 3).map((product, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri: product.imageUrls[0] }} style={styles.image} />
          </View>
        ))}
      </ScrollView>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.newListingsContainer,
          { 
            transform: [{ translateY: animatedValue }],
            height: height * 0.79,
            paddingBottom: height * 0.08 + 180,
          },
        ]}
      >
        <View style={styles.handleBar} />
        <Text style={styles.sectionHeader}>New Listings</Text>
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productList}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hotBidContainer: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  hotBidText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  imageWrapper: {
    width: width,
    height: height,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '90%',
    resizeMode: 'cover',
  },
  newListingsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.primary,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginVertical: 10,
  },
  sectionHeader: {
    fontSize: 22,
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  productList: {
    alignItems: 'center',
  },
  productWrapper: {
    width: '50%',
    padding: 5,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  heartIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  productLocation: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  productBidders: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  bidButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  bidButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;