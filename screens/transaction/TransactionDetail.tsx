import React, { useState } from 'react';
import { SafeAreaView, TextInput, Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTransaction } from '@/screens/transaction/TransactionContext';
import { getAuth } from 'firebase/auth';
import { getDatabase, push, ref, set, update } from 'firebase/database';
import { addDoc, collection, deleteDoc, doc, getFirestore } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';


const TransactionDetail = () => {

    type TransactionDetailRouteParams = {
        transaction: {
          date: string | number | Date;
          id: string;
          name: string;
          amount: number;
        };
      };

//   type Transaction = {
//     date: string | number | Date;
//     id: string;
//     name: string;
//     amount: number;
//   };

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | undefined>();
  const [date, setDate] = useState<Date>(new Date());
  const [openDatePicker, setOpenDatePicker] = useState<boolean>(false);
  

  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const { transaction } = route.params as TransactionDetailRouteParams;

  const handleDeleteTransaction = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
        const db = getFirestore();
        const year = new Date(transaction.date).getFullYear().toString();
        const month = (new Date(transaction.date).getMonth() + 1).toString().padStart(2, "0");

        const transactionRef = doc(db, `users/${user.uid}/Years/${year}/Months/${month}/Transactions/${transaction.id}`);
        await deleteDoc(transactionRef);
        navigation.goBack();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Transaction Name: {transaction.name}</Text>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount: $ {transaction.amount}</Text>
        
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date: {format(new Date(transaction.date), "dd-MM-yyyy")}</Text>
      </View>
      <Button title="Delete Transaction" onPress={handleDeleteTransaction} />
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

export default TransactionDetail;
