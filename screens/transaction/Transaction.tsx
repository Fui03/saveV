import React from 'react';
import { SafeAreaView, Text, StyleSheet, Button, FlatList, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTransaction } from '@/screens/transaction/TransactionContext';
import { format } from 'date-fns';

const TransactionScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { transactions } = useTransaction();

  const handleAddTransaction = () => {
    navigation.navigate('AddTransaction');
  };

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.transactionItem}>
      <Text>{item.name}</Text>
      <Text>${item.amount}</Text>
    </View>
  );

  const groupedTransactions: { [key: string]: any[] } = transactions.reduce((acc: { [key: string]: any[] }, transaction) => {
    const date = format(new Date(transaction.date), 'dd, EEE');
    if (!acc[date]) acc[date] = [];
    acc[date].push(transaction);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.month}>November</Text>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>Income: $6231.23</Text>
          <Text style={styles.balanceText}>Expenses: $2432.11</Text>
          <Text style={styles.balanceText}>Balance: $3799.12</Text>
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
