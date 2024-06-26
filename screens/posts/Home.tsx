import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, Text, StyleSheet , Button, Image, View, FlatList, TouchableOpacity, TextInput, Alert} from 'react-native';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation} from "@react-navigation/native";
import { collection, getDocs, getFirestore, limit, onSnapshot, orderBy, query, startAfter } from 'firebase/firestore';


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

    const [search, setSearch] = useState<string>('');
    
    const fetchPosts = async (lastDoc?: any) => {
        setLoading(true);
        const db = getFirestore();
        const postsRef = collection(db, 'posts');
        let q = query(postsRef, orderBy('timestamp', 'desc'), limit(10));
        
        if (lastDoc) {
        q = query(postsRef, orderBy('timestamp', 'desc'), startAfter(lastDoc), limit(10));
        }
        
        const documentSnapshots = await getDocs(q);
        const postsData: Post[] = documentSnapshots.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        })) as Post[];

        if (documentSnapshots.docs.length > 0) {
            setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
        }

        if (lastDoc) {
            setPosts(prevPosts => [...prevPosts, ...postsData]);
        } else {
            setPosts(postsData);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleLoadMore = () => {
        if (!loading && lastVisible) {
        fetchPosts(lastVisible);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchPosts().then(() => setRefreshing(false));
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
        borderRadius: 10,
        padding: 20,
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
