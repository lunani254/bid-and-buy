// components/AddPaymentMethodScreen.js
import React, { useState, useEffect } from 'react';
import { Button, View, Alert, StyleSheet, Text } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';
import { auth, database } from '../firebase'; // Make sure the path is correct
import { Card } from 'react-native-elements';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, push, serverTimestamp } from 'firebase/database';
import COLORS from '../constants/colors';

const AddPaymentMethodsScreen = () => {
  const { createToken } = useStripe();
  const [cardDetails, setCardDetails] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        Alert.alert('Error', 'No user is currently logged in');
      }
    });

    return unsubscribe;
  }, []);

  const handlePayment = async () => {
    if (!cardDetails || !cardDetails.complete) {
      Alert.alert('Please enter complete card details');
      return;
    }
  
    try {
      const { token } = await createToken({ type: 'Card' });
      if (!token) {
        Alert.alert('Could not create token');
        return;
      }
  
      const response = await axios.post('https://victor-final-year-563053696582.herokuapp.com/payment-method', {
        cardToken: token.id,
      });
  
      const { paymentMethodId } = response.data;
  
      if (userId) {
        // Save payment method to Firebase
        await push(ref(database, `users/${userId}/paymentMethods`), {
          paymentMethodId: paymentMethodId,
          createdAt: serverTimestamp(),
        });
  
        Alert.alert('Success', 'Payment Method Added Successfully');
      } else {
        Alert.alert('Error', 'User ID not found');
      }
    } catch (error) {
      Alert.alert('Error', `Payment Method Failed: ${error.message}`);
    }
  };
  ;

  return (
    <View style={styles.container}>
      <Card containerStyle={styles.card}>
        <Text style={styles.title}>Add Payment Method</Text>
        <CardField
          postalCodeEnabled={true}
          placeholders={{ number: '4242 4242 4242 4242' }}
          cardStyle={styles.cardField}
          style={styles.cardContainer}
          onCardChange={(details) => {
            setCardDetails(details);
          }}
        />
        <Button
          title="Add Payment Method"
          color={COLORS.primary}
          onPress={handlePayment}
        />
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  cardField: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  },
  cardContainer: {
    height: 50,
    marginVertical: 30,
  },
});

export default AddPaymentMethodsScreen;
