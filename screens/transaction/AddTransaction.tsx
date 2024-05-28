import React, { useState } from 'react';
import { SafeAreaView, TextInput, Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTransaction } from '@/screens/transaction/TransactionContext';
import { getAuth } from 'firebase/auth';
import { getDatabase, push, ref, set, update } from 'firebase/database';

const AddTransaction = () => {

  type Transaction = {
    date: string | number | Date;
    id: string;
    name: string;
    amount: number;
  };

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | undefined>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  // const { addTransaction } = useTransaction();

  const handleAddTransaction = async () => {
    
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}/Transaction`);
      const transaction = {
        id: Math.random().toString(),
        name: name,
        amount: amount,
        date: new Date().toISOString(),
      }

      try {
        const newUserRef = push(userRef);
        set(newUserRef, {
          id: Math.random().toString(),
          name: name,
          amount: amount,
          date: new Date().toISOString(),
        })

        navigation.goBack();
      } catch (e) {
        
      }

    }
    // if (name && amount) {
    //   const transaction = {
    //     id: Math.random().toString(),
    //     name,
    //     amount: parseFloat(amount),
    //     date: new Date().toISOString(),
    //   };
    //   addTransaction(transaction);
    //   navigation.goBack();
    // }
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
          value={(amount === undefined || Number.isNaN(amount)) ? '' : amount.toString(10)}
          onChangeText={(text) => setAmount(parseFloat(text))}
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
