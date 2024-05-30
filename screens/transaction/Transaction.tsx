import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet, Button, FlatList, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTransaction } from '@/screens/transaction/TransactionContext';
import { format } from 'date-fns';
import { getAuth } from 'firebase/auth';
import { getDatabase, onChildChanged, onValue, ref } from 'firebase/database';
import { collection, doc, getFirestore, onSnapshot, query, where } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';


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

  const handleAddTransaction = () => {
    navigation.navigate('AddTransaction');
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() =>handleTransactionDetail(item)}>
      <View style={styles.transactionItem}>
        <Text>{item.name}</Text>
        <Text>${item.amount}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.month}>{format(date, "MM-yyyy")}</Text>
        <Button title='Choose Date' onPress={showCalendar}/>
        {showDate && (
          <DateTimePicker
            value = {date}
            display='spinner'
            onChange={onChange}
          />

        )}
        <View style={styles.balanceContainer}>
          {/* <Text style={styles.balanceText}>Income: $6231.23</Text> */}
          <Text style={styles.balanceText}>Monthly Expenses: ${totalExpenses}</Text>
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
    backgroundColor: '#FFD700',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  month: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceContainer: {
    marginTop: 10,
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
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
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
});

export default TransactionScreen;
