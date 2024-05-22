import React from 'react';
import { SafeAreaView, Text, StyleSheet , Button} from 'react-native';
import { getAuth, signOut } from "firebase/auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation} from "@react-navigation/native";




const Transaction = () => {


  return (
    <SafeAreaView style={styles.container}>

      <Text>Transaction</Text>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Transaction;
