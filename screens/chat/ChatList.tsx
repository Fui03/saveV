import React, { useState, useEffect } from 'react';
import { SafeAreaView, TextInput, FlatList, TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import { getFirestore, collection, query, where, getDocs, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAuth } from 'firebase/auth';

type ChatRoom = {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: any;
  otherParticipantName?: string;
  otherParticipantPic?: string;
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

      const unsubscribe = onSnapshot(chatRoomsQuery, async (querySnapshot) => {
        const chatRoomsData: ChatRoom[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatRoom[];

        const chatRoomsWithUserData = await Promise.all(chatRoomsData.map(async (chatRoom) => {
          const otherParticipant = chatRoom.participants.find(participant => participant !== user.uid);
          if (otherParticipant) {
            const userDoc = await getDoc(doc(db, 'users', otherParticipant));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                ...chatRoom,
                otherParticipantName: userData?.userName,
                otherParticipantPic: userData?.profilePic,
              };
            }
          } else {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              return {
                ...chatRoom,
                otherParticipantName: userData?.userName,
                otherParticipantPic: userData?.profilePic,
              };
            }
          }
          return chatRoom;
        }));

        setChatRooms(chatRoomsWithUserData);
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
      {item.otherParticipantPic ? (
        <Image source={{ uri: item.otherParticipantPic }} style={styles.profilePic} />
      ): 
        <Image source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/savev-3a33f.appspot.com/o/profilePictures%2Fdefault.jpg?alt=media&token=d49600fc-9923-4912-84e9-4d89929eed44' }} style={styles.profilePic} />
      }
      <View style={styles.chatRoomTextContainer}>
        <Text style={styles.chatRoomText}>{item.otherParticipantName}</Text>
        <Text style={styles.chatRoomMessage}>{item.lastMessage}</Text>
        <Text style={styles.chatRoomTime}>{item.lastMessageTime?.toDate().toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleSearch = async () => {
    try {
      navigation.navigate('UserProfile', {userId: searchQuery});
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
        placeholderTextColor={'gray'}
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
    chatRoomTextContainer: {
      flex: 1,
      justifyContent:'center',
      maxHeight:60,
    },
    chatRoomText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    chatRoomMessage: {
      fontSize: 14,
      color: '#666',
    },
    chatRoomTime: {
      fontSize: 12,
      color: '#aaa',
      marginTop: 5,
    },
    profilePic: {
      width: 70,
      height: 70,
      borderRadius: 100,
      marginRight: 10,
    },
})

export default ChatList;
