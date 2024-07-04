import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet , Button, Alert, TouchableOpacity, Image, View, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { getAuth, signOut } from "firebase/auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation} from "@react-navigation/native";
import { collection, doc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, setDoc, startAfter, where } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes , uploadBytesResumable } from 'firebase/storage';
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


const Profile = () => {

  const [role, setRole] = useState<String>();
  const [userName, setUserName] = useState<string>();
  const [profilePic, setProfilePic] = useState<string>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();

  useEffect(() => {
    
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const fetchUserData =  onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()){
          const userData = snapshot.data();
          const userRole = userData.role || 'normal';
          const userName = userData.userName || '';
          const userprofilePic = userData.profilePic || '';
          const posts = userData.posts || [];
          setRole(userRole);
          setUserName(userName);
          setProfilePic(userprofilePic);
          fetchPosts(user.uid)
        } else {
          setRole('normal')
        }
      })
      return () => fetchUserData()
    }

  }, [])

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

  const handleUpgrade = async () => {
    const auth = getAuth();
        const user = auth.currentUser;

        if (user) {

            const db = getFirestore();
            const userRef = doc(db, "users", user.uid);

            try {

                await setDoc(userRef, {
                    role: "Business"
                },{merge:true})
                                
                Alert.alert("Success", "Update Successful")
            } catch (e) {
                Alert.alert("Error", "Try Again")
            }
        }
  }

  const chooseImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'Permission to access camera roll is required!');
        return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [3, 4],
        quality: 1,
    });

    if (!pickerResult.canceled) {
      const uri = pickerResult.assets[0].uri;
      handleUpload(uri)
    }
  };

  
  const handleUpload = async (uri: string) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storage = getStorage();
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on('state_changed', 
        (snapshot) => {},
        (error) => {
          Alert.alert('Error', 'Image upload failed. Please try again.');
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const db = getFirestore();
          const userRef = doc(db, "users", user.uid);
          await setDoc(userRef, { profilePic: downloadURL }, { merge: true });
          setProfilePic(downloadURL);
        }
      );
    }
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
        <TouchableOpacity onPress={chooseImage}>
          {profilePic ? (
            <Image source={{uri: profilePic}} style={styles.profilePic}/>
          ):(
            <Image source={{uri: 'https://firebasestorage.googleapis.com/v0/b/savev-3a33f.appspot.com/o/profilePictures%2Fdefault.jpg?alt=media&token=d49600fc-9923-4912-84e9-4d89929eed44'}} style={styles.profilePic} />
          )}
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <Text style={styles.userName}>{userName}</Text>
          {role == 'normal' ?
            <Pressable style={styles.button} onPress={handleUpgrade}>
              <Text style={styles.buttonText}>Upgrade Business</Text>
            </Pressable>
            : 
            <Pressable style={styles.button} onPress={() => navigation.navigate('UpdateProfile')}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </Pressable>
          }
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
    width:150
  },
  buttonText: {
    fontSize: 16,
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

export default Profile;
