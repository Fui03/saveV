import React, { useState } from 'react';
import { SafeAreaView, TextInput, Button, StyleSheet, Text, View , Image, TouchableOpacity, Pressable, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAuth } from 'firebase/auth';
import { getDatabase, push, ref, set, update } from 'firebase/database';
import { addDoc, collection, doc, getFirestore } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';


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

  const MAX_AMOUNT = 1e13;
  

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleAddTransaction = async () => {
    
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {

      const db = getFirestore();

      try {

        if (!amount) {
          Alert.alert("Error", "Please enter your amount!");
          return;
        }

        if (amount) {
          if (amount <= 0 ) {
            Alert.alert("Error", "Please ensure the amount is greater than zero!");
            return;
          }

          if (isNaN(amount)) {
            Alert.alert("Error", "Please enter a valid number!")
            return;
          }

          if (amount > MAX_AMOUNT) {
            Alert.alert("Error", `Amount should not exceed ${MAX_AMOUNT}!`);
            return;
          }
        }
        
        if (!name) {
          Alert.alert("Error", "Please enter a name for the expenses!");
          return;
        }

        if (name.length > 20) {
          Alert.alert("Error", "Description shouldnt exceed 20 characters");
          return;
        }
        

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
          <TouchableOpacity onPress={() => setOpenDatePicker(true)}>
            <View style={styles.dateContainer}>
              <Image source={require('@/assets/images/calendar.png')} style={styles.logo}/>
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateText}>{format(date, "dd-MM-yyyy")}</Text>
              </View>
            </View>
          </TouchableOpacity>
            {/* <Button title = "Select Date" onPress={() => setOpenDatePicker(true)}/> */}
          {openDatePicker && (
            <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChange}
            />
          )}
          
        </View>
        <Pressable style={styles.button} onPress={handleAddTransaction}>
          <Text style={styles.buttonText}>Add Transaction</Text>
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
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 8,
  },
  logo: {
    width: 35, // Adjust width as needed
    height: '83%', // Adjust height as needed
    // paddingRight: 20,
    // marginBottom: 20,
    marginRight:10,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 10,
    // borderWidth: 1,
    paddingLeft: 5,
    height: 42,
    borderColor: 'gray',
    alignItems: 'center',
  },
  dateTextContainer: {
    // borderWidth:1,
    justifyContent:'center',
    width:'90%'
  },
  dateText: {
    fontSize: 17,
    fontWeight: "500",
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 3,
    backgroundColor: 'black',
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  }
});

export default AddTransaction;
