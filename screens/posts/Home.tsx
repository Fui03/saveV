import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  Button,
  Image,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Configuration from "openai";
import OpenAI from "openai";
import { API_KEY } from '@env';

// Create an instance of OpenAIApi with the configuration
const openai = new OpenAI({
  apiKey: API_KEY
});

openai.apiKey = API_KEY;

type Post = {
  id: string;
  title: string;
  caption: string;
  spendingRange: number;
  imageURLs: string[];
  timestamp: any;
  likes: number;
  comment: any[];
};

const Home = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [spendingRange, setSpendingRange] = useState<number>(0);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const db = getFirestore();
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const userData = snapshot.data();

          if (userData.spendingPower / 90 <= 40) {
            setSpendingRange(40);
          } else {
            setSpendingRange(userData.spendingPower / 90);
          }
        } else {
          Alert.alert("Error", "No data found!");
        }
      }
    };

    fetchUserData();
    fetchPosts();
  }, []);

  const fetchUserData = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.data();

        if (userData.spendingPower / 90 <= 40) {
          setSpendingRange(40);
        } else {
          setSpendingRange(userData.spendingPower / 90);
        }
      } else {
        Alert.alert("Error", "No data found!");
      }
    }
  };

    const fetchPosts = async (spendingPower?: number) => {
        setLoading(true);

        const db = getFirestore();
        const postsRef = collection(db, "posts");

        const q = query(
        postsRef
        );

        const documentSnapshots = await getDocs(q);
        const postsData: Post[] = documentSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        })) as Post[];
        
        // console.log("All Posts length: " + postsData.length)
        const idsToRemove = new Set(posts.map(post => post.id));
        const newPostsData = postsData.filter(post => !idsToRemove.has(post.id))

        // console.log("Render Posts length: " + posts.length)
        // console.log("New Posts length: " + newPostsData.length)

        if (newPostsData.length === 0) {
            console.log("No new posts to process");
            setLoading(false);
            return;
        }
        
        // Prepare data for GPT API
        const gptInput = {
        userSpendingPower: spendingPower,
        posts: newPostsData.map((post) => ({
            userId: post.id, // Only include necessary data for the model to process
            spendingRange: post.spendingRange,
        })),
        };

        // Call GPT API for recommendations
        const response = await openai.completions.create({
            model: "gpt-3.5-turbo-instruct",
            prompt: `Given the user's spending power level of ${spendingPower}, 
            prioritize the following posts: ${JSON.stringify(gptInput)},
            just output the post userIds in order of priority.`,
            max_tokens: 150,
        });
    
        console.log("OpenAI Response:", response.choices[0].text.trim()); // Log the response to debug

        // console.log("OpenAI Response:", response.choices[0].text); // Log the response to debug
    
        try {
            // Attempt to parse the response
            const prioritizedUserIds = response.choices[0].text.trim();
            const prioritizedPosts = postsData.filter((post) =>
                prioritizedUserIds.includes(post.id)
            );

            const uniquePosts = [...posts, ...prioritizedPosts].reduce<Post[]>(
                (unique, o) => {
                if (!unique.some((obj) => obj.id === o.id)) {
                    unique.push(o);
                }
                return unique;
                },
                []
            );
            // console.log(prioritizedPosts)
            setPosts(uniquePosts);
            
        } catch (e) {
            console.error("Failed to parse JSON:", e);
            // Handle error or fallback
        } finally {
            setLoading(false);
        }
    
    };

    const refreshFetch = async (spendingPower?: number) => {
        setLoading(true);

        const db = getFirestore();
        const postsRef = collection(db, "posts");

        const q = query(
        postsRef
        );

        const documentSnapshots = await getDocs(q);
        const postsData: Post[] = documentSnapshots.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        })) as Post[];

        // Prepare data for GPT API
        const gptInput = {
        userSpendingPower: spendingPower,
        posts: postsData.map((post) => ({
            userId: post.id, // Only include necessary data for the model to process
            spendingRange: post.spendingRange,
        })),
        };

        // Call GPT API for recommendations
        const response = await openai.completions.create({
            model: "gpt-3.5-turbo-instruct",
            prompt: `Given the user's spending power level of ${spendingPower}, 
            prioritize the following posts: ${JSON.stringify(gptInput)},
            just output the post userIds in order of priority.`,
            max_tokens: 150,
        });
    
        console.log("OpenAI Response:", response.choices[0].text.trim()); // Log the response to debug
    
        try {
            // Attempt to parse the response
            const prioritizedUserIds = response.choices[0].text.trim();
            const prioritizedPosts = postsData.filter((post) =>
                prioritizedUserIds.includes(post.id)
            );

            setPosts(prioritizedPosts);
            
        } catch (e) {
            console.error("Failed to parse JSON:", e);
        } finally {
            setLoading(false);
        }
    
    };

  
    const handleLoadMore = () => {
        if (!loading) {
          fetchPosts(spendingRange);
        }
      };
    
    const handleRefresh = () => {
        setRefreshing(true);
        setPosts([])
    try {
        fetchUserData();
        refreshFetch(spendingRange);
    } finally {
        setRefreshing(false);
    }
    };
    
    const handleSearch = async () => {
        try {
          const response = await fetch(
            "https://save-elbrpbsd6-savevs-projects.vercel.app/api/search",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query: search,
              }),
            }
          );
    
          const postIds = await response.json();
          setSearch("");
          navigation.navigate("Search", { postIds });
        } catch (e) {
          console.error("Error searching posts:", e);
          Alert.alert(
            "Error",
            "An error occurred while searching for posts. Please try again."
          );
        }
    };
    
    const renderItem = ({ item }: { item: Post }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("PostDetails", { post: item })}
        >
          {item.imageURLs.length > 0 && (
            <Image source={{ uri: item.imageURLs[0] }} style={styles.cardImage} />
          )}
          <Text style={styles.cardTitle}>{item.title}</Text>
        </TouchableOpacity>
    );
    
    return (
        <SafeAreaView style={styles.container}>
          <TextInput
            placeholder="Search ......"
            value={search}
            onChangeText={setSearch}
            style={styles.searchBar}
            onSubmitEditing={handleSearch}
          />
          <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            testID="flatlist"
          />
        </SafeAreaView>
    );
};
    
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f6fa",
    },
    card: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 5,
        padding: 20,
        marginVertical: 1,
        marginHorizontal: 1,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    cardImage: {
        width: 180,
        height: 180,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 10,
    },
    cardCaption: {
        fontSize: 14,
        color: "#666",
        marginBottom: 10,
    },
    cardSpendingRange: {
        fontSize: 14,
        color: "#666",
    },
    searchBar: {
        borderWidth: 1,
        borderRadius: 10,
        marginVertical: 10,
        height: 40,
        marginHorizontal: 10,
        paddingHorizontal: 10,
    },
});
export default Home;