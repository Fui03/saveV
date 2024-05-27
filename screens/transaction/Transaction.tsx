

import React from 'react';
import { SafeAreaView, Text, StyleSheet, Button, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTransaction } from '@/screens/transaction/TransactionContext'

const TransactionScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { transactions } = useTransaction();

  const handleAddTransaction = () => {
    navigation.navigate('AddTransaction');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={styles.transactionItem}>{`${item.name}: $${item.amount}`}</Text>
        )}
      />
      <Button title="Add Transaction" onPress={handleAddTransaction} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  transactionItem: {
    fontSize: 18,
    padding: 8,
  },
});

export default TransactionScreen;
