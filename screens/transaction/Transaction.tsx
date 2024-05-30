import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet, Button, FlatList, View, TouchableOpacity, Image} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { getAuth } from 'firebase/auth';
import { getDatabase, onChildChanged, onValue, ref } from 'firebase/database';
import { collection, doc, getFirestore, onSnapshot, query, where } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import MonthYearPicker from './Svgs/MonthYearPicker';


const TransactionScreen = () => {
  
  type Transaction = {
    date: string | number | Date;
    id: string;
    name: string;
    amount: number;
  };

  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [date, setDate] = useState<Date>(new Date());
  const [showDate, setShowDate] = useState<boolean>(false);

  const [isPickerVisible, setPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ month: number; year: number } | null>(null);

  const handleAddTransaction = () => {
    navigation.navigate('AddTransaction');
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() =>handleTransactionDetail(item)}>
      <View style={styles.transactionItem}>
        <Text style={styles.dataText}>{item.name}</Text>
        <Text style={styles.dataText}>${item.amount}</Text>
      </View>
    </TouchableOpacity>
  );

  const groupedTransactions: { [key: string]: any[] } = transactions.reduce((acc: { [key: string]: any[] }, transaction) => {
    const date = format(new Date(transaction.date), 'dd, EEE');
    if (!acc[date]) acc[date] = [];
    acc[date].push(transaction);
    return acc;
  }, {});

  useEffect(() => {

      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        // const db =getDatabase();
        // const userRef = ref(db, `users/${user.uid}/Transaction`);
        
        const db = getFirestore();
        
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        
        const userRef = collection(db, `users/${user.uid}/Years/${year}/Months/${month}/Transactions`)

        const q = query(
          userRef,
        )
        

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const transactionList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Transaction[];

          transactionList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          
          setTransactions(transactionList);

          setTotalExpenses(transactionList.reduce((acc: number, trans: {date: string | number | Date, id: string, name: string, amount: number}) => acc + trans.amount, 0));

        })
        return () => unsubscribe();
      }
    

  }, [date])

  const showCalendar = useCallback(() => setShowDate(true), []);

  const onChange = useCallback((event: any, newDate?: Date | undefined) => {
    setShowDate(false);
    if (newDate) {
      setDate(newDate);
    }
  }, []);

  const handleTransactionDetail = (transaction: Transaction) => {
    navigation.navigate('TransactionDetail', { transaction });
  };


  const handleOpenPicker = () => {
    setPickerVisible(true);
  };

  const handleClosePicker = () => {
    setPickerVisible(false);
  };

  const handleSelectDate = (date: { month: number; year: number }) => {
    setDate(new Date(date.year, date.month - 1));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleOpenPicker} style={styles.date}>
          <View style={styles.imageContainer}>
            <Text style={styles.month}>{format(date, "MM")}</Text>
            <Image source={require('@/assets/images/chevron_10009171.png')} style={styles.logo} />
          </View>
          <Text style={styles.year}>{format(date, "yyyy")}</Text>
        </TouchableOpacity>
        {/* <Button title='Choose Date' onPress={showCalendar}/> */}
        {/* <Button title='Choose Date' onPress={handleOpenPicker}/> */}
        {showDate && (
          // <DateTimePicker
          //   value = {date}
          //   display='spinner'
          //   onChange={onChange}
          // />
          <MonthYearPicker
            visible={isPickerVisible}
            onClose={handleClosePicker}
            onSelect={handleSelectDate}
            defaultMonth={date ? date.getMonth() + 1 : undefined}
            defaultYear={date ? date.getFullYear() : undefined}
          />
        )}
        <View style={styles.balanceContainer}>
          {/* <Text style={styles.balanceText}>Income: $6231.23</Text> */}
          <Text style={styles.totalExpensesText}>Monthly Expenses:</Text>
          <Text style={styles.totalExpensesNumber}>${totalExpenses}</Text>
          {/* <Text style={styles.balanceText}>Balance: $3799.12</Text> */}
        </View>
      </View>
      <FlatList
        data={Object.keys(groupedTransactions)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{item}</Text>
            <FlatList
              data={groupedTransactions[item]}
              keyExtractor={(item) => item.id}
              renderItem={renderTransaction}
            />
          </View>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={handleAddTransaction}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection:'row',
    backgroundColor: '#FFD700',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent:'space-around'
  },
  balanceContainer: {
    // borderWidth:1,
    marginTop: 10,
    alignItems:'center'
  },
  balanceText: {
    fontSize: 16,
  },
  dateGroup: {
    backgroundColor: '#e0f7fa',
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
  },
  dataText: {
    fontSize:16,
    marginLeft:10
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'gray'
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#f00',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontSize: 30,
    color: '#fff',
  },
  date: {
    // borderWidth:1,
    // height: 125,
    padding: 10 
  },
  imageContainer: {
    // borderWidth:1,
    flexDirection:'row'
  },
  logo: {
    width: 10, // Adjust width as needed
    height: '10%', // Adjust height as needed
    // borderWidth:1,
    // borderColor: 'red',
    padding:10,
    resizeMode: "cover",
    alignSelf:"center",
    marginLeft:10,
  },
  month: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  year: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalExpensesText: {
    fontSize: 18,
    fontFamily:'serif'
  },
  totalExpensesNumber: {
    fontSize: 20,
    fontWeight:'bold',
    fontFamily:'serif'
  },
});

export default TransactionScreen;
