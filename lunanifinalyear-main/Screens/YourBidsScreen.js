import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const YourBidsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Post Ad Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default YourBidsScreen;
