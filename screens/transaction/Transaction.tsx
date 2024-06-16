import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, StyleSheet, FlatList, View, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getFirestore, onSnapshot, query } from 'firebase/firestore';
import RNPickerSelect from 'react-native-picker-select';

import { PDFDocument, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';


import { AntDesign } from '@expo/vector-icons';


const screenWidth = Dimensions.get('window').width;

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
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(date.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(date.getFullYear());
  const [userName, setUserName] = useState<string | undefined>();
  const [userEmail, setUserEmail] = useState<string | undefined>();

  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();


  const handleAddTransaction = () => {
    navigation.navigate('AddTransaction');
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity onPress={() => handleTransactionDetail(item)}>
      <View style={styles.transactionItem}>
        <Text style={styles.dataText}>{item.name}</Text>
        <Text style={styles.dataText}>${item.amount}</Text>
      </View>
    </TouchableOpacity>
  );

  const groupedTransactions: { [key: string]: { transactions: Transaction[], total: number } } =
    transactions.reduce((acc: { [key: string]: { transactions: Transaction[], total: number } }, transaction) => {
      const date = format(new Date(transaction.date), 'dd, EEE');
      if (!acc[date]) acc[date] = { transactions: [], total: 0 };
      acc[date].transactions.push(transaction);
      acc[date].total += transaction.amount;
      return acc;
    }, {});

  useEffect(() => {

    if (user) {

      const fetchUserData = async () => {
        const profRef = doc(db, `users/${user.uid}`);
        const snapshot = await getDoc(profRef);
        if (snapshot.exists()) {
          setUserName(snapshot.data().userName);
        } 
  
        if (user.email) {
          setUserEmail(user.email);
        }
      }

      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const userRef = collection(db, `users/${user.uid}/Years/${year}/Months/${month}/Transactions`);
      const q = query(userRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const transactionList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[];

        transactionList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(transactionList);
        setTotalExpenses(transactionList.reduce((acc: number, trans: { date: string | number | Date, id: string, name: string, amount: number }) => acc + trans.amount, 0));
      });

      fetchUserData();

      return () => unsubscribe();
    }
  }, [date]);

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

  const generatePdf = async (transactions: Transaction[]) => {

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([300, 410]);

    const margin = 10;

    let yPosition = 390;

    const drawHeader = () => {
      page.drawText('saveV', { x: 10, y: yPosition, size: 20, color: rgb(0, 0, 0) });
      yPosition -= 15;
      page.drawText('123 ABCDEFG, Singapore 123456', { x: 10, y: yPosition, size: 10, color: rgb(0, 0, 0) });
      yPosition -= 15;
      page.drawText('moneyMiracleSaveV@domain.com', { x: 10, y: yPosition, size: 10, color: rgb(0, 0, 0) });
      yPosition -= 15;
      page.drawText(`User Name: ${userName}`, { x: 10, y: yPosition, size: 10, color: rgb(0, 0, 0) });
      yPosition -= 15;
      page.drawText(`User Email: ${userEmail}`, { x: 10, y: yPosition, size: 10, color: rgb(0, 0, 0) });
      yPosition -= 15;
      page.drawText(`Statement Date: ${format(new Date(), 'dd-MM-yyyy')}`, { x: 10, y: yPosition, size: 10, color: rgb(0, 0, 0) });
      yPosition -= 30;
    };

    const drawTableHeaders = () => {
      page.drawText('Transactions', { x: 10, y: yPosition, size: 14, color: rgb(0, 0, 0) });
      yPosition -= 20;

      page.drawText('Date', {x: 10, y: yPosition, size: 12, color: rgb(0,0,0)})
      page.drawText('Description', {x: 90, y: yPosition, size: 12, color: rgb(0,0,0)})
      page.drawText('Amount', {x: 230, y: yPosition, size: 12, color: rgb(0,0,0)})
      yPosition -= 20;
    };

    const drawTableRow = (transaction: Transaction, rowIndex: number) => {
      const isEvenRow = rowIndex % 2 === 0;
      const rowColor = isEvenRow ? rgb(0.95, 0.95, 0.95) : rgb(1, 1, 1);

      page.drawRectangle({
        x: 10,
        y: yPosition - 6,
        width: 300,
        height: 20,
        color: rowColor,
      });

      page.drawText(`${format(transaction.date, 'dd-MM-yyyy')}`, { x: 10, y: yPosition, size: 10, color: rgb(0, 0, 0) });
      page.drawText(transaction.name, { x: 90, y: yPosition, size: 10, color: rgb(0, 0, 0) });
      page.drawText(`$${transaction.amount.toString()}`, { x: 230, y: yPosition, size: 10, color: rgb(0, 0, 0) });
      yPosition -= 20;
    };

    drawHeader();
    drawTableHeaders();

    transactions.forEach((transaction, rowIndex) => {
      if (yPosition < margin) {
        page = pdfDoc.addPage([300, 410]);
        yPosition = 390;
        drawTableHeaders();
      }
      drawTableRow(transaction, rowIndex);
    });

    if (yPosition < margin) {
      page = pdfDoc.addPage([300, 410]);
      yPosition = 390;
      drawTableHeaders();
    }

    page.drawText("Total Expenses:", { x: 10, y: yPosition, size: 11, color: rgb(0, 0, 0) });
    page.drawText(`$${totalExpenses}`, { x: 230, y: yPosition, size: 11, color: rgb(0, 0, 0) });

    const pdfBytes = await pdfDoc.save();

    const pdfPath = `${FileSystem.documentDirectory}transactions.pdf`;
    
    await FileSystem.writeAsStringAsync(pdfPath,  btoa(String.fromCharCode(...pdfBytes)), {
      encoding: FileSystem.EncodingType.Base64,
    });

    return pdfPath;
  };

  const handleExportPdf = async () => {
    try {
        const pdfPath = await generatePdf(transactions);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(pdfPath);
        } else {
          alert('Sharing is not available on this device');
        }
      
    } catch (e) {
      console.log(e);
    }
  };
  

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
              <View style={styles.pickerItem}>
                <RNPickerSelect
                  style={pickerSelectStyles}
                  value={selectedMonth}
                  onValueChange={(value) => setSelectedMonth(value)}
                  items={months}
                />
              </View>
              <View style={styles.pickerItem}>
                <RNPickerSelect
                  style={pickerSelectStyles}
                  value={selectedYear}
                  onValueChange={(value) => setSelectedYear(value)}
                  items={years}
                />
              </View>
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
        <TouchableOpacity onPress={handleExportPdf}>
          <AntDesign name="export" size={24} color="black" />
        </TouchableOpacity>

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
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  balanceContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 16,
  },
  dateGroup: {
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
  },
  dataText: {
    fontSize: 16,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 2,
    marginBottom: 2,
  },
  dateHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'gray',
  },
  listTransaction: {
    backgroundColor: '#e0f7fa',
    borderRadius: 10,
    borderWidth: 0.5,
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
    padding: 10,
  },
  imageContainer: {
    flexDirection: 'row',
  },
  logo: {
    width: 10,
    height: '10%',
    padding: 10,
    resizeMode: "cover",
    alignSelf: "center",
    marginLeft: 10,
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
    fontFamily: 'serif',
  },
  totalExpensesNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    height: 250,
    width: screenWidth * 0.8,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: "center",
    width: '100%',
    marginBottom: 20,
  },
  pickerItem: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '45%',
  },
  confirmButton: {
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  textPicker: {
    fontSize: 16,
    marginTop: 5,
  },
  dailyTransactionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dailyTransactionHeaderText: {
    fontSize: 15,
    color: "gray",
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
    width: '100%',
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
    width: '100%',
  },
});

export default TransactionScreen;
