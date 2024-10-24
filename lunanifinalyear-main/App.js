// App.js
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { StripeProvider } from '@stripe/stripe-react-native';  // Import StripeProvider
import COLORS from './constants/colors';
import Login from './Screens/Login';
import Signup from './Screens/Signup';
import Welcome from './Screens/Welcome';
import HomeScreen from './Screens/HomeScreen';
import SearchScreen from './Screens/SearchScreen';
import ProfileScreen from './Screens/ProfileScreen';
import FavoriteScreen from './Screens/FavoriteScreen';
import ProductDetailsScreen from './Screens/ProductDetailsScreen';
import PostAdScreen from './components/PostAdScreen';
import ViewYourAdsScreen from './components/ViewYourAdsScreen';
import PlaceBidScreen from './components/PlaceBidScreen';
import ViewYourProductProgressScreen from './components/ViewYourProductProgressScreen';
import YourBids from './components/YourBids';
import AddPaymentMethodsScreen from './components/AddPaymentMethodScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem label="Your Bids" onPress={() => props.navigation.navigate('YourBids')} />
      <DrawerItem label="Post Your Ad" onPress={() => props.navigation.navigate('PostAdScreen')} />
      <DrawerItem label="View Your Ads" onPress={() => props.navigation.navigate('ViewYourAdsScreen')} />
      <DrawerItem label="Add Payment Method" onPress={() => props.navigation.navigate('AddPaymentMethodsScreen')} />
      <DrawerItem label="Call for Help" onPress={() => {}} />
    </DrawerContentScrollView>
  );
}

function DrawerNavigator({ likedProducts, setLikedProducts }) {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerPosition: 'right',
        drawerActiveTintColor: COLORS.primary,
        headerShown: false,
      }}
    >
      <Drawer.Screen name="MainTabs">
        {props => <MainTabNavigator {...props} likedProducts={likedProducts} setLikedProducts={setLikedProducts} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

function MainTabNavigator({ likedProducts, setLikedProducts }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Favorite') {
            iconName = focused ? 'heart' : 'heart-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'black',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home">
        {props => <HomeStack {...props} likedProducts={likedProducts} setLikedProducts={setLikedProducts} />}
      </Tab.Screen>
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Favorite">
        {props => <FavoriteScreen {...props} likedProducts={likedProducts} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function HomeStack({ navigation, likedProducts, setLikedProducts }) {
  return (
    <Stack.Navigator initialRouteName="HomeScreen">
      <Stack.Screen
        name="HomeScreen"
        options={{
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{
                marginRight: 20,
                padding: 10,
                backgroundColor: COLORS.secondary,
                borderRadius: 50,
              }}
            >
              <Ionicons name="menu" size={32} color={COLORS.primary} style={{ fontWeight: 'bold' }} />
            </TouchableOpacity>
          ),
        }}
      >
        {props => <HomeScreen {...props} likedProducts={likedProducts} setLikedProducts={setLikedProducts} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function App() {
  const [likedProducts, setLikedProducts] = useState([]);

  return (
    <StripeProvider publishableKey="pk_test_51PS3fkRxHPKAYLBGjdDf9Xlip0P9TtmuEn08w4u7f1JVFe3VvpuEuD3xqmOTGvTYkTVOH30U1SyiMPL7b5kzGUsx00ezozcA9w">
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
          <Stack.Screen name="ViewYourProductProgressScreen" component={ViewYourProductProgressScreen} />
          <Stack.Screen name="PlaceBidScreen" component={PlaceBidScreen} />
          <Stack.Screen name="YourBids" component={YourBids} />
          <Stack.Screen name="Main">
            {props => <DrawerNavigator {...props} likedProducts={likedProducts} setLikedProducts={setLikedProducts} />}
          </Stack.Screen>
          <Stack.Screen name="PostAdScreen" component={PostAdScreen} />
          <Stack.Screen name="ViewYourAdsScreen" component={ViewYourAdsScreen} />
          <Stack.Screen name="AddPaymentMethodsScreen" component={AddPaymentMethodsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
}

export default App;
