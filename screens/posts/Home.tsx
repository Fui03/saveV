import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, Text, StyleSheet , Button, Image, View, FlatList, TouchableOpacity, TextInput, Alert} from 'react-native';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation} from "@react-navigation/native";
import { collection, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, startAfter, where } from 'firebase/firestore';
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


const Home = () => {

    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [posts, setPosts] = useState<Post[]>([]);
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [spendingRange, setSpendingRange] = useState<number>(0);

    const [search, setSearch] = useState<string>('');

      
    const spendingDelta = 10;

    const high = spendingRange + spendingDelta;

    useEffect(() => {
        const fetchUserData = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {

                const db = getFirestore();
                const userRef = doc(db, `users`, user.uid);
                const snapshot = await getDoc(userRef);

                if (snapshot.exists()) {
                    const userData = snapshot.data();

                    if (userData.spendingPower / 90 <= 40) {
                        setSpendingRange(40)
                    } else {
                        setSpendingRange(userData.spendingPower / 90);
                    }
                } else {
                    Alert.alert("Error", "No data found!");
                }
            }
        }

        fetchUserData();
        fetchPosts();
    },[])

    const fetchUserData = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {

            const db = getFirestore();
            const userRef = doc(db, `users`, user.uid);
            const snapshot = await getDoc(userRef);

            if (snapshot.exists()) {
                const userData = snapshot.data();

                if (userData.spendingPower / 90 <= 40) {
                    setSpendingRange(40)
                } else {
                    setSpendingRange(userData.spendingPower / 90);
                }
            } else {
                Alert.alert("Error", "No data found!");
            }
        }
    }

    const fetchPosts = async (lastDoc?: any) => {

        setLoading(true);
        
        const db = getFirestore();
        const postsRef = collection(db, 'posts');
        
        let q =  query(postsRef, 
            // where('spendingRange', '>=', low),
            where('spendingRange', '<=', high), 
            // where('randomValue', '>', randomThreshold),
            // orderBy('randomValue'),
            // orderBy('spendingRange'),
            // orderBy('timestamp', 'desc'), 
            limit(15));
            
        if (lastDoc) {
        q = query(postsRef, 
            // where('spendingRange', '>=', low),
            where('spendingRange', '<=', high), 
            // where('randomValue', '>', randomThreshold),
            // orderBy('randomValue'),
            // orderBy('spendingRange'),
            // orderBy('timestamp', 'desc'), 
            startAfter(lastDoc), 
            limit(10));
        }

     
        const documentSnapshots = await getDocs(q);
        const postsData: Post[] = documentSnapshots.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        })) as Post[];

        postsData.sort(() => Math.random() - Math.random());

        if (documentSnapshots.docs.length > 0) {
            setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
        }

        if (lastDoc) {
            const uniquePosts = [...posts, ...postsData].reduce<Post[]>((unique, o) => {
                if (!unique.some((obj) => obj.id === o.id)) {
                  unique.push(o);
                }
                return unique;
            }, []);
    
            setPosts(uniquePosts);
        } else {
            setPosts(postsData);
        }

        setLoading(false);
    };

    const handleLoadMore = () => {
        if (!loading && lastVisible) {
            fetchPosts(lastVisible);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setLastVisible(null);
        try {
            await fetchUserData();
            await fetchPosts(); 
        } finally {
            setRefreshing(false);
        }
    };

    const handleSearch = async () => {
        try {
            const response = await fetch('https://save-elbrpbsd6-savevs-projects.vercel.app/api/search', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  query: search,
                }),
            })

            const postIds = await response.json();
            setSearch('')
            navigation.navigate('Search', {postIds});
        } catch (e) {
            console.error('Error searching posts:', e);
            Alert.alert("Error", "An error occurred while searching for posts. Please try again.");
          }
    }

    const renderItem = ({ item }: { item: Post }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PostDetails', { post: item })}>
          {item.imageURLs.length > 0 && (
            <Image source={{ uri: item.imageURLs[0] }} style={styles.cardImage} />
          )}
          <Text style={styles.cardTitle}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <TextInput
                placeholder='Search ......'
                value={search}
                onChangeText={setSearch}
                style={styles.searchBar}
                onSubmitEditing={handleSearch}/>
            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                testID='flatlist'
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
        borderRadius: 5,
        padding: 20,
        marginVertical: 1,
        marginHorizontal: 1,
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
    searchBar: {
        borderWidth:1,
        borderRadius:10,
        marginVertical:10,
        height:40,
        marginHorizontal:10,
        paddingHorizontal:10
    }
});
export default Home;
