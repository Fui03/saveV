import React, { useState, useEffect } from 'react';
import { SafeAreaView, TextInput, FlatList, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const ChatList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any>([]);
  const navigation = useNavigation();
  const db = getFirestore();

  const handleSearch = async () => {
 
  };

  return (
    <SafeAreaView>
      <TextInput
        placeholder="Search by username"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    searchBar: {
        borderWidth:1,
        borderRadius:10,
        marginVertical:10,
        height:40,
        marginHorizontal:10,
        paddingHorizontal:10
    }
})

export default ChatList;
