import React, {useEffect, useRef, useState} from 'react';
import { FlatList, Text, View, TextInput, Button, StyleSheet, Keyboard, Alert, KeyboardAvoidingView, Platform, SafeAreaView, TouchableOpacity, Image , AppState, AppStateStatus} from 'react-native';
import { getAuth } from 'firebase/auth';
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, startAfter, updateDoc, where } from 'firebase/firestore';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { formatInTimeZone } from 'date-fns-tz';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';


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

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const route = useRoute<UserProfileRouteProp>();
    const { userId } = route.params;

    const [currentUserName, setCurrentUserName] = useState<string>('')
    const [text, setText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatRoomId, setChatRoomId] = useState<string | null>(null);
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [lastFetchedTimestamp, setLastFetchedTimestamp] = useState<any>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState<string>('');
    const [profilePic, setProfilePic] = useState<string>('');
    
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
            setStatus(true, existingChatRoomId);
          } else {
            const newChatRoomRef = await addDoc(chatRoomRef, {
              participants: arrayUnion(user.uid, userId),
            });
            setChatRoomId(newChatRoomRef.id);
            setStatus(true, newChatRoomRef.id);
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

    useEffect(() => {
      fetchUserData();
    },[])

    const setStatus = async (status: boolean, activeChatRoomId : string | null) => {
      if (user) {
          try {
              const userRef = doc(db, 'users', user.uid);
              await updateDoc(userRef, {
                isInChat: status,
                activeChatRoomId,
                lastActive: serverTimestamp(),
              });
              // console.log(`Status set to ${status}`);
              // console.log(`chatroomid set to ${activeChatRoomId}`);
          } catch (error) {
              console.error('Error updating status:', error);
          }
      }
    };

    useEffect(() => {

      if (!chatRoomId) return;
      
      const focusListener = navigation.addListener('focus', () => {
        setStatus(true, chatRoomId);
      });
      
      const blurListener = navigation.addListener('blur', () => {
        setStatus(false, null);
      });
  
      return () => {
        focusListener();
        blurListener();
      };
    }, [user, navigation, db, chatRoomId]);

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                setStatus(false, null);
            } else if (nextAppState === 'active') {
              if (chatRoomId) {
                setStatus(true, chatRoomId); 
              }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
          subscription.remove();
        };
    }, [user, db, chatRoomId]);

    async function sendPushNotification(expoPushToken: string, msg: string) {

      const message = {
        to: expoPushToken,
        sound: 'default',
        title: currentUserName,
        body: msg,
        data: { someData: msg },
      };
    
      try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });
    
        if (!response.ok) {
          throw new Error('Failed to send notification');
        }
    
        // console.log('Notification sent successfully');
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
    
    const fetchMoreMessages = async () => {
      // console.log(1)
      if (!chatRoomId || !lastVisible || loadingMore || loading) return;

      setLoadingMore(true);
  
      // console.log(1)
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
      
        const userDoc = await getDoc(doc(db, `users/${userId}`));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const recipientToken = userData.expoPushToken;
            
            if (userData.isInChat && userData.activeChatRoomId === chatRoomId) {
              setText('');
              Keyboard.dismiss();      
              return;
            }

            if (recipientToken) {
              sendPushNotification(recipientToken, text);
              // console.log(recipientToken)
            }
          }

        setText('');
        Keyboard.dismiss();      
    };

    const fetchUserData = async () => {
      setLoading(true);

      const userDoc = await getDoc(doc(db, `users/${userId}`));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.userName);
        setProfilePic(userData?.profilePic);
      }

      setLoading(false);
    }

    return (
      <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {
              navigation.goBack()
              setStatus(false, null);
              }}>
              <Ionicons name="arrow-back" size={24} color="black"/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('UserProfile', {userId})}>
              {profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.profilePic} />
              ): 
                <Image source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/savev-3a33f.appspot.com/o/profilePictures%2Fdefault.jpg?alt=media&token=d49600fc-9923-4912-84e9-4d89929eed44' }} style={styles.profilePic} />
              }
            </TouchableOpacity>
            <Text style={styles.name}>{userName}</Text>
          </View>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              
              <View style={item.senderId === user?.uid ? styles.sender : styles.receiver}>
                <Text style={styles.text}>{item.text}</Text>
                <Text style={styles.date}>{formatInTimeZone(new Date(item.createdAt?.toDate()), 'Asia/Singapore', 'd/M/yyyy, p')}</Text>
              </View>
            )}
            inverted
            onEndReached={fetchMoreMessages}
            onEndReachedThreshold={0}
            style={styles.flatList}
          />

        <View style={styles.inputContainer}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type your message"
            style={styles.input}
            multiline
            placeholderTextColor={'gray'}
          />
          <TouchableOpacity onPress={handleSend}>
            <MaterialCommunityIcons name="send" size={24} color="black" style={styles.send}/>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
    );
  };

const styles = StyleSheet.create({
    container: {
      flex: 1,
      // justifyContent:'center',
      backgroundColor: 'white',
      // // alignItems:'flex-start'
    },
    header: {
      // top: 10,
      flexDirection:'row',
      // justifyContent:'center',
      alignItems:'center',
      height:70,
      padding:10,
      backgroundColor:'white'
    },
    profilePic: {
      width: 45,
      height: 45,
      borderRadius: 100,
      marginRight: 10,
      marginHorizontal:10,
    },
    name: {
      fontSize:16,
      fontWeight:'bold',
      marginHorizontal:5,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
      width:'80%',
      marginLeft:20,
      maxHeight:120
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
    text: {
      marginBottom:10
    },
    date: {
      color:'#D3D3D3'
    },
    flatList: {
      // paddingTop:0,
      // borderWidth:1,
      padding:10,
      backgroundColor:'#f5f6fa'
    },
    inputContainer: {
      flexDirection:'row',
      // justifyContent:'space-between',
      alignItems:'center',
      // position: 'absolute',
      bottom: 0,
      width:'100%',
      // backgroundColor: '#fff',
      // borderTopWidth: 1,
      // borderColor: '#ccc',
    },
    send: {
      marginLeft:10,
      padding: 10,
      marginTop: 5,
    }

  });
export default Chat;
