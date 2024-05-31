import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet, Button, FlatList, View, TouchableOpacity, Image, Modal, TouchableWithoutFeedback} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { getAuth } from 'firebase/auth';
import { getDatabase, onChildChanged, onValue, ref } from 'firebase/database';
import { collection, doc, getFirestore, onSnapshot, query, where } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import MonthYearPicker from './Svgs/MonthYearPicker';
import RNPickerSelect from 'react-native-picker-select';


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

  const [selectedMonth, setSelectedMonth] = useState<number>(date.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(date.getFullYear());

  
  const handleAddTransaction = () => {
    navigation.navigate('AddTransaction');
  };
  
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity onPress={() =>handleTransactionDetail(item)}>
      <View style={styles.transactionItem}>
        <Text style={styles.dataText}>{item.name}</Text>
        <Text style={styles.dataText}>${item.amount}</Text>
      </View>
    </TouchableOpacity>
  );
  
  const groupedTransactions: { [key: string]: {transactions: Transaction[], total: number} } = 
  transactions.reduce((acc: { [key: string]: {transactions: Transaction[], total: number} }, transaction) => {
    const date = format(new Date(transaction.date), 'dd, EEE');
    if (!acc[date]) acc[date] = {transactions: [], total: 0};
    acc[date].transactions.push(transaction);
    acc[date].total += transaction.amount;
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
    
    
    const handleTransactionDetail = (transaction: Transaction) => {
      navigation.navigate('TransactionDetail', { transaction });
    };
    
    
    const handleOpenPicker = () => {
      setPickerVisible(true);
    };
    
      const years = [];
      for (let i = 2020; i <= new Date().getFullYear(); i++) {
        years.push({ label: i.toString(), value: i });
      }
    
      const handleConfirm = () => {
        setDate(new Date(selectedYear, selectedMonth - 1));
        setPickerVisible(false);
      };
    
      const months = [
        { label: 'January', value: 1 }, { label: 'February', value: 2 },
        { label: 'March', value: 3 }, { label: 'April', value: 4 },
        { label: 'May', value: 5 }, { label: 'June', value: 6 },
        { label: 'July', value: 7 }, { label: 'August', value: 8 },
        { label: 'September', value: 9 }, { label: 'October', value: 10 },
        { label: 'November', value: 11 }, { label: 'December', value: 12 }
      ];

    return (
      <SafeAreaView style={styles.container}>
          <Modal
            animationType='fade'
            visible={isPickerVisible}
            transparent={true}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>           
                  <Text style={styles.title}>Select Month and Year</Text>
                  <View style={styles.pickerContainer}>
                      <View style={styles.monthContainer}>
                        <RNPickerSelect
                          style={pickerSelectStyles}
                          value={selectedMonth}
                          onValueChange={(value) => setSelectedMonth(value)}
                          items={months}
                          />
                        <Text style={styles.textMonth}>
                          {months[selectedMonth - 1].label}
                        </Text>
                      </View>
                    <RNPickerSelect
                      style={pickerSelectStyles}
                      value={selectedYear}
                      onValueChange={(value) => setSelectedYear(value)}
                      items={years}
                    />
                    <Text style={styles.textMonth}>
                      {selectedYear}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>

          </Modal>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleOpenPicker} style={styles.date}>
          <View style={styles.imageContainer}>
            <Text style={styles.month}>{format(date, "MM")}</Text>
            <Image source={require('@/assets/images/chevron_10009171.png')} style={styles.logo} />
          </View>
          <Text style={styles.year}>{format(date, "yyyy")}</Text>
        </TouchableOpacity>
        <View style={styles.balanceContainer}>
          <Text style={styles.totalExpensesText}>Monthly Expenses:</Text>
          <Text style={styles.totalExpensesNumber}>${totalExpenses}</Text>
        </View>
      </View>
      <FlatList
        data={Object.keys(groupedTransactions)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.dateGroup}>
            <View style={styles.dailyTransactionHeaderContainer}>
              <Text style={styles.dateHeader}>{item}</Text>
              <Text style={styles.dailyTransactionHeaderText}>Total: ${groupedTransactions[item].total}</Text>
            </View>
            <FlatList
              data={groupedTransactions[item].transactions}
              keyExtractor={(item) => item.id}
              renderItem={renderTransaction}
              style={styles.listTransaction}
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
    justifyContent:'space-around',
    marginBottom:10,
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
    // backgroundColor: '#e0f7fa',
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
  },
  dataText: {
    fontSize:16,
    marginLeft:10,
    marginRight:10,
    marginTop:2,
    marginBottom:2
  },
  dateHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color:'gray',
    
  },
  listTransaction: {
    backgroundColor: '#e0f7fa',
    borderRadius:10,
    borderWidth:0.5
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    height: 250,
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent:'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: "center",
    width: '100%',
    borderWidth:1
  },
  monthContainer : {
    flexDirection:'row',
    alignItems:'center',
    paddingRight:20,
    borderRightWidth:1
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 100,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  textMonth: {
    fontSize: 17,
    fontWeight:"400",
    marginRight: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%'
  },
  dailyTransactionHeaderContainer: {
    flexDirection:'row',
    justifyContent:'space-between'
  },
  dailyTransactionHeaderText: {
    fontSize: 15,
    color: "gray"
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, 
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, 
  },
});


export default TransactionScreen;
