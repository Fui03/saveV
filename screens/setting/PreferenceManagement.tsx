import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet , Button, Image, View, FlatList, TouchableOpacity} from 'react-native';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation} from "@react-navigation/native";
import { collection, getFirestore, onSnapshot, orderBy, query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


type Post = {
  id: string;
  title: string;
  caption: string;
  spendingRange: number;
  imageURLs: string[];
  timestamp: any; 
  likes: number;
};


export default function PreferenceManagement() {

    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [posts, setPosts] = useState<Post[]>([]);
    
    const db = getFirestore();
    const user = getAuth().currentUser;
    useEffect(() => {

        if (user) {
            const savesRef = collection(db, `users/${user.uid}/saves`);
            const q = query(savesRef, orderBy('timestamp', 'desc'));
    
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const postsData : Post[] = [];
                snapshot.forEach((doc) => {
                    postsData.push({ id: doc.id, ...doc.data() } as Post);
                });
                setPosts(postsData);
            });
    
            return () => unsubscribe();

        }
    }, []);

    const renderItem = ({ item } : {item: Post}) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PostDetails', { post: item })}>
            {item.imageURLs.length > 0 && (
                    <Image source={{ uri: item.imageURLs[0] }} style={styles.cardImage} />
            )}
            <Text style={styles.cardTitle}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#f5f6fa',
  },
  card: {
        flex:1,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        // marginHorizontal: 20,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        alignItems:'center',
        justifyContent:'center'
  },
  cardImage: {
      width: 180,
      height: 180,
    //   marginRight: 10,
  },
  cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 10,
  },
  cardCaption: {
      fontSize: 14,
      color: '#666',
      marginBottom: 10,
  },
  cardSpendingRange: {
      fontSize: 14,
      color: '#666',
  },
});
