import React, { useState } from 'react';
import { SafeAreaView, TextInput, Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTransaction } from '@/screens/transaction/TransactionContext';

const AddTransaction = () => {
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
        date: new Date().toISOString(),
      };
      addTransaction(transaction);
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Transaction Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Transaction Name"
          value={name}
          onChangeText={setName}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>
      <Button title="Add Transaction" onPress={handleAddTransaction} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 8,
  },
});

export default AddTransaction;
