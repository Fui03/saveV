import React, { useState, useEffect } from 'react';
import { SafeAreaView, TextInput, FlatList, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { getFirestore, collection, query, where, getDocs, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAuth } from 'firebase/auth';

type ChatRoom = {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: any;
};

const ChatList = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();

  useEffect(() => {
    if (user) {
      const chatRoomsRef = collection(db, 'chatRooms');
      const chatRoomsQuery = query(chatRoomsRef, where('participants', 'array-contains', user.uid));

      const unsubscribe = onSnapshot(chatRoomsQuery, (querySnapshot) => {
        const chatRoomsData: ChatRoom[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatRoom[];

        setChatRooms(chatRoomsData);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, db]);

  const handleChatRoomPress = (chatRoom: ChatRoom) => {
    const otherParticipant = chatRoom.participants.find(participant => participant !== user?.uid);
    if (otherParticipant) {
      navigation.navigate('Chat', { userId: otherParticipant });
    } else {
      navigation.navigate('Chat', { userId: user?.uid });
    }
  };

  const renderChatRoomItem = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity style={styles.chatRoomItem} onPress={() => handleChatRoomPress(item)}>
      <Text style={styles.chatRoomText}>{item.lastMessage}</Text>
      <Text style={styles.chatRoomText}>{item.lastMessageTime?.toDate().toLocaleString()}</Text>
    </TouchableOpacity>
  );

  const handleSearch = async () => {
    try {
        const userRef =  doc(db, `users/${searchQuery}`);
        const fetchUserData =  onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.data();
                navigation.navigate('UserProfile', {userId: searchQuery, userData});
            }
        })
        return () => fetchUserData();
    } catch (e) {
        console.error(e)
    }
  };

  return (
    <SafeAreaView>
      <TextInput
        placeholder="Search by userId"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
      />
      <FlatList
        data={chatRooms}
        keyExtractor={item => item.id}
        renderItem={renderChatRoomItem}
        refreshing={loading}
        contentContainerStyle={styles.listContent}
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
    },
    userItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    listContent: {
      padding: 10,
    },
    chatRoomItem: {
      padding: 15,
      backgroundColor: '#f9f9f9',
      marginBottom: 10,
      borderRadius: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    chatRoomText: {
      fontSize: 16,
    },
})

export default ChatList;
