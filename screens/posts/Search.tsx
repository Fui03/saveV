import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, Text, StyleSheet , Button, Image, View, FlatList, TouchableOpacity, TextInput, Alert} from 'react-native';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import { collection, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, startAfter } from 'firebase/firestore';


type Post = {
  id: string;
  title: string;
  caption: string;
  spendingRange: number;
  imageURLs: string[];
  timestamp: any; 
  likes: number;
};

type PostIdsRouteParams = {
    postIds: string[],
}

type PostIdsRouteProp = RouteProp<{ Search: PostIdsRouteParams }, 'Search'>;

const chunkArray = (array: any[], size: number) => {
    const chunkedArr = [];
    for (let i = 0; i < array.length; i += size) {
      chunkedArr.push(array.slice(i, i + size));
    }
    return chunkedArr;
};

const Search = () => {

    const route = useRoute<PostIdsRouteProp>();
    const { postIds } = route.params;


    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [posts, setPosts] = useState<Post[]>([]);
    const [lastChunkIndex, setLastChunkIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const chunks = chunkArray(postIds, 4);

    const fetchPosts = async (chunkIndex: number) => {
        if (chunkIndex >= chunks.length) return;
        setLoading(true);
        const db = getFirestore();
        const currentChunk = chunks[chunkIndex];    
    
        const fetchedPosts: Post[] = await Promise.all(currentChunk.map(async (postId) => {
            const postDoc = await getDoc(doc(db, 'posts', postId));
            if (postDoc.exists()) {
                return { id: postId, ...postDoc.data() };
            } else {
                return null;
            }
        })) as Post[];
    
        setPosts(prevPosts => [...prevPosts, ...fetchedPosts.filter(post => post !== null)]);
        setLoading(false);
        setLastChunkIndex(chunkIndex);
    };

    useEffect(() => {
        fetchPosts(0);
    }, []);

    const handleLoadMore = () => {
        if (lastChunkIndex < chunks.length - 1) {
            fetchPosts(lastChunkIndex + 1);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setPosts([]);
        setLastChunkIndex(0);
        fetchPosts(0).then(() => setRefreshing(false));
    };


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

            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.99}
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

    }
});
export default Search;
