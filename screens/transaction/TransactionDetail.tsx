import React, { useState } from 'react';
import { SafeAreaView, TextInput, Button, StyleSheet, Text, View, Pressable} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
        <Text style={styles.label}>Expense Detail</Text>
        <View style={styles.textContainer}>
          <Text style={styles.input}>{transaction.name}</Text>
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount</Text>
        <View style={styles.textContainer}>
          <Text style={styles.input}>$ {transaction.amount}</Text>
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date</Text>
        <View style={styles.textContainer}>
          <Text style={styles.input}>{format(new Date(transaction.date), "dd-MM-yyyy")}</Text>
        </View>
      </View>
      <Pressable style={styles.button} onPress={handleDeleteTransaction}>
          <Text style={styles.buttonText}>Delete Expense</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
    // justifyContent:'center'
    alignItems:'center'
  },
  label: {
    fontSize: 20,
    // fontWeight: 'bold',
    marginBottom: 5,
    marginTop:10,
  },
  textContainer: {
    // borderWidth:1,
    height:40,
    // alignItems:'center'
    justifyContent:'center',
  },
  input: {
    fontSize:22,
    fontWeight:'bold'
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 3,
    backgroundColor: 'black',
    marginTop: 10
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  }
});

export default TransactionDetail;
