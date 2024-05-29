import React, { useState } from 'react';
import { SafeAreaView, TextInput, Button, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTransaction } from '@/screens/transaction/TransactionContext';
import { getAuth } from 'firebase/auth';
import { getDatabase, push, ref, set, update } from 'firebase/database';
import { addDoc, collection, doc, getFirestore } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';


const AddTransaction = () => {

  type Transaction = {
    date: string | number | Date;
    id: string;
    name: string;
    amount: number;
  };

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | undefined>();
  const [date, setDate] = useState<Date>(new Date());
  const [openDatePicker, setOpenDatePicker] = useState<boolean>(false);
  

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleAddTransaction = async () => {
    
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {

      const db = getFirestore();

      
      try {

        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const transaction = {
          name: name,
          amount: amount,
          date : date.toISOString(),
        }

        const userRef = collection(db, `users/${user.uid}/Years/${year}/Months/${month}/Transactions`)
        const newUserRef = await addDoc(userRef, transaction);

        navigation.goBack();
      } catch (e) {
        
      }

    }

  };

  const onChange = (event: any, selectedDate?: Date| undefined) => {
    setOpenDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  }

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
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date</Text>
        <Text>{date.toISOString()}</Text>
        <Button title = "Select Date" onPress={() => setOpenDatePicker(true)}/>
        {openDatePicker && (
          <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
        />
        )}
        
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
