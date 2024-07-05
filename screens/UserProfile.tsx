import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet , Button, Alert, TouchableOpacity, Image, View, Pressable, FlatList } from 'react-native';
import { getAuth } from "firebase/auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import { collection, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, setDoc, startAfter, where } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref , uploadBytesResumable } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

type Post = {
  id: string;
  title: string;
  caption: string;
  spendingRange: number;
  imageURLs: string[];
  timestamp: any; 
  likes: number;
};

type UserData = {
  userName: string,
  profilePic: string,
  posts: Post
}

type UserProfileRouteParams = {
    userId: string,
    userData: UserData
}

type UserProfileRouteProp = RouteProp<{UserProfile: UserProfileRouteParams}, "UserProfile">;

const UserProfile = () => {

    const route = useRoute<UserProfileRouteProp>();
    const { userId } = route.params;


    const [posts, setPosts] = useState<Post[]>([]);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [userName, setUserName] = useState<string>('');
    const [profilePic, setProfilePic] = useState<string>('');

    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getFirestore();

    useEffect(() => {
      fetchPosts(userId)
      fetchUserData();
    }, [])

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

    const fetchPosts = async (userUid: string, startAfterDoc: any = null) => {
        if (loadingMore) return;
        setLoadingMore(true);

        const db = getFirestore();
        const postsRef = collection(db, 'posts');
        let q = query(postsRef, where('userId', '==', userUid), orderBy('timestamp', 'desc') ,limit(9));

        if (startAfterDoc) {
        q = query(postsRef, where('userId', '==', userUid), startAfter(startAfterDoc), limit(9));
        }

    try {
      const querySnapshot = await getDocs(q);
      const postsData: Post[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);

      if (startAfterDoc) {
        setPosts(prevPosts => [...prevPosts, ...postsData]);
      } else {
        setPosts(postsData);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Failed to fetch posts. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user && lastDoc) {
      fetchPosts(user.uid, lastDoc);
    }
  };

  const handleMessage = () => {
    navigation.navigate('Chat', { userId: userId })
  }

  const renderPostItem = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.postContainer} onPress={() => navigation.navigate('PostDetails', { post: item })}>
      {item.imageURLs.length > 0 && (
        <Image source={{ uri: item.imageURLs[0] }} style={styles.postImage} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.overall}>
      <View style={styles.header}>
        <View>
            {profilePic ? 
                <Image source={{uri: profilePic}} style={styles.profilePic}/>
                :
                <Image source={{uri: 'https://firebasestorage.googleapis.com/v0/b/savev-3a33f.appspot.com/o/profilePictures%2Fdefault.jpg?alt=media&token=d49600fc-9923-4912-84e9-4d89929eed44'}} style={styles.profilePic} />
            }
        </View>
        <View style={styles.headerRight}>
            <Text style={styles.userName}>{userName}</Text>
            <Pressable style={styles.button} onPress={handleMessage}>
              <Text style={styles.buttonText}>Send Message</Text>
            </Pressable>
        </View>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Posts</Text>
      </View>
      <View style={styles.postsContainer}>
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={item => item.id}
          style={styles.postsContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          numColumns={3}
        />
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  overall: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    // justifyContent: 'center',
    alignItems: 'center', // Center everything horizontally
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent:'flex-start',
    alignItems: 'center',
    // backgroundColor:'#b9e2f5',
    width:'95%',
    height:200,
    marginVertical:30,
    borderRadius:20
  },
  headerRight: {
    justifyContent:'center',
    alignItems:'center',
    // borderWidth:1,
    width:200,
  },
  userName: {
    fontSize:30,
    fontWeight: 'bold',
    color:'black'
  },
  title: {
    fontSize:21,
    fontWeight:'bold',
    marginVertical:5,
  },
  profilePic: {
    width:150,
    height:150,
    borderRadius:1200,
    borderColor: 'black',
    borderWidth: 2,
    marginHorizontal:5
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 15,
    borderWidth:1,
    borderColor:'#dcf0fa',
    backgroundColor:'black',
    width:170
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  contentContainer : {
    justifyContent:'center',
    alignItems:'center',
    borderTopWidth:1,
    borderBottomWidth:1,
    width:'100%'
  },
  postsContainer: {
    width:'100%',
    marginBottom:150,
  },
  postContainer: {
    flex:1,
    //     backgroundColor: '#fff',
        // borderRadius: 5,
        // padding: 20,
        marginVertical: 1,
        marginHorizontal: 1,
    //     shadowColor: '#000',
    //     shadowOffset: {
    //         width: 0,
    //         height: 2,
    //     },
    //     shadowOpacity: 0.25,
    //     shadowRadius: 3.84,
    //     elevation: 5,
    alignItems:'center',
    justifyContent:'center'
  },
  postImage: {
    justifyContent:'center',
    alignItems:'center',
    width:130,
    height:170,
  }
});

export default UserProfile;
