/*import React from "react";
import { SafeAreaView, Text, StyleSheet, Button } from "react-native";
import { getAuth, signOut } from "firebase/auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

const AddTransaction = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleAddTransaction = () => {
    navigation.navigate("AddTransaction");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text>Transaction</Text>
      <Button title="Add jhhwdeidjdewde" onPress={handleAddTransaction} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AddTransaction;*/

import React, { useState } from 'react';
import { SafeAreaView, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTransaction } from '@/screens/transaction/TransactionContext';

const AddTransactionScreen = () => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { addTransaction } = useTransaction();

  const handleAddTransaction = () => {
    if (name && amount) {
      const transaction = {
        id: Math.random().toString(),
        name,
        amount: parseFloat(amount),
      };
      addTransaction(transaction);
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Transaction Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <Button title="Add Transaction" onPress={handleAddTransaction} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
});

export default AddTransactionScreen;

