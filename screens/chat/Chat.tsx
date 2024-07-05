import React, {useEffect, useRef, useState} from 'react';
import { FlatList, Text, View, TextInput, Button, StyleSheet, Keyboard, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, startAfter, updateDoc, where } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { format , formatInTimeZone } from 'date-fns-tz';


type UserProfileRouteParams = {
    userId: string,
    userName: string
}

type UserProfileRouteProp = RouteProp<{UserProfile: UserProfileRouteParams}, "UserProfile">;

type Message = {
    id: string;
    text: string;
    createdAt: any;
    senderId: string;
    senderName: string;
    receiverId: string;
  };

const Chat = () => {

    const route = useRoute<UserProfileRouteProp>();
    const { userId, userName} = route.params;

    const [currentUserName, setCurrentUserName] = useState<string>('')
    const [text, setText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatRoomId, setChatRoomId] = useState<string | null>(null);
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [lastFetchedTimestamp, setLastFetchedTimestamp] = useState<any>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loading, setLoading] = useState(false);

    const auth = getAuth();
    const user = auth.currentUser;
    const db = getFirestore();

    const flatListRef = useRef<FlatList>(null);


    //Create ChatRoom
    useEffect(() => {
        const createOrJoinChatRoom = async () => {
          if (!user) return;
    
          const chatRoomRef = collection(db, 'chatRooms');
          const chatRoomQuery = query(
            chatRoomRef,
            where('participants', 'array-contains', user.uid)
          );
    
          let existingChatRoomId = null;
          const snapshot = await getDocs(chatRoomQuery);
          snapshot.forEach((doc) => {
            const participants = doc.data().participants;
            if (participants.includes(userId)) {
              existingChatRoomId = doc.id;
            }
          });
    
          if (existingChatRoomId) {
            setChatRoomId(existingChatRoomId);
          } else {
            const newChatRoomRef = await addDoc(chatRoomRef, {
              participants: arrayUnion(user.uid, userId),
            });
            setChatRoomId(newChatRoomRef.id);
          }
        };
    
        createOrJoinChatRoom();
    }, [user, userId, db]);

    // Fetch Messages
    useEffect(() => {
      if (!chatRoomId) return;

      setLoading(true)
    
      const fetchMessages = async () => {
        const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages');
        const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(15));
    
        const snapshot = await getDocs(messagesQuery);
        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];

        setMessages(newMessages);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

        if (snapshot.docs.length > 0) {
          setLastFetchedTimestamp(snapshot.docs[0].data().createdAt);
        }
      };

      setLoading(false)
      fetchMessages();
    }, [chatRoomId, db]);
    
    //Real-time
    useEffect(() => {
      if (!chatRoomId || !lastFetchedTimestamp) return;
    
      const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages');
      const messagesQuery = query(messagesRef, orderBy('createdAt'), startAfter(lastFetchedTimestamp));
    
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const newMessages = snapshot.docChanges()
          .filter(change => change.type === 'added')
          .map(change => ({
            id: change.doc.id,
            ...change.doc.data(),
        })) as Message[];

        setMessages((prevMessages) => [...newMessages, ...prevMessages]);
      });
    
      return () => unsubscribe();
    }, [chatRoomId, db, lastFetchedTimestamp]);

    //Fetch current User name
    useEffect(() => {
      const fetchUserData = async () => {
          if (user) {

              const db = getFirestore();
              const userRef = doc(db, `users`, user.uid);
              const snapshot = await getDoc(userRef);

              if (snapshot.exists()) {
                  const userData = snapshot.data();
                  setCurrentUserName(userData.userName);
              } else {
                  Alert.alert("Error", "No data found!");
              }
          }
      }

      fetchUserData();

    },[])

    const fetchMoreMessages = async () => {
      console.log(1)
      if (!chatRoomId || !lastVisible || loadingMore || loading) return;

      setLoadingMore(true);
  
      console.log(1)
      const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages');
      const messagesQuery = query(
        messagesRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(10)
      );
  
      const snapshot = await getDocs(messagesQuery);
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
  

      setMessages((prevMessages) => [...prevMessages, ...newMessages]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setLoadingMore(false);
      };

      
    const handleSend = async () => {
        if (!chatRoomId || !user || !text.trim()) return;
    
        const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages');
        await addDoc(messagesRef, {
            text,
            createdAt: new Date(),
            senderId: user.uid,
            senderName: currentUserName,
            receiverId: userId,
        });
        
        const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
        
        await updateDoc(chatRoomRef, {
            lastMessage: text,
            lastMessageTime: new Date(),
        });
        
        await setDoc(doc(db, 'users', user.uid, 'userChats', chatRoomId), {
            lastMessage: text,
            lastMessageTime: new Date(),
          }, { merge: true });

          await setDoc(doc(db, 'users', userId, 'userChats', chatRoomId), {
            lastMessage: text,
            lastMessageTime: new Date(),
          }, { merge: true });
      
        setText('');
        Keyboard.dismiss();      
    };

    return (
        <SafeAreaView style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            
            <View style={item.senderId === user?.uid ? styles.sender : styles.receiver}>
              <Text>{item.senderName}: {item.text}</Text>
              <Text>{formatInTimeZone(new Date(item.createdAt?.toDate()), 'Asia/Singapore', 'd/M/yyyy, p')}</Text>
            </View>
          )}
          inverted
          onEndReached={fetchMoreMessages}
          onEndReachedThreshold={0}
          initialNumToRender={15}
        />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type your message"
          style={styles.input}
        />
        <Button title="Send" onPress={handleSend} />
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      borderRadius: 5,
      marginVertical: 10,
    },
    sender: {
      alignSelf: 'flex-end',
      backgroundColor: '#DCF8C6',
      borderRadius: 10,
      padding: 10,
      marginVertical: 5,
      maxWidth:'70%'
    },
    receiver: {
      alignSelf: 'flex-start',
      backgroundColor: '#FFF',
      borderRadius: 10,
      padding: 10,
      marginVertical: 5,
      maxWidth:'70%'
    },
  });
export default Chat;
