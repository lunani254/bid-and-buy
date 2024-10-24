// PaymentMethodsScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { firebase } from '../firebase';

const PaymentMethodsScreen = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const user = firebase.auth().currentUser;
      if (user) {
        const paymentsRef = firebase.firestore().collection('users').doc(user.uid).collection('payments');
        const snapshot = await paymentsRef.get();
        const methods = snapshot.docs.map(doc => doc.data());
        setPaymentMethods(methods);
      }
    };

    fetchPaymentMethods();
  }, []);

  return (
    <View style={styles.container}>
      {paymentMethods.map((method, index) => (
        <View key={index} style={styles.paymentMethod}>
          <Text>Card Number: {method.cardNumber}</Text>
          <Text>Expiry Date: {method.expiryDate}</Text>
          <Text>Amount: ${method.amount}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  paymentMethod: {
    marginBottom: 12,
    padding: 16,
    borderColor: 'gray',
    borderWidth: 1,
  },
});

export default PaymentMethodsScreen;
