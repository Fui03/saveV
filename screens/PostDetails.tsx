import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SafeAreaView, Pressable ,Text, StyleSheet, Image, View, Button, TextInput, ScrollView, FlatList, Dimensions, KeyboardAvoidingView, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getFirestore, onSnapshot, updateDoc, getDocs, query, where, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import Swiper from 'react-native-swiper';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from '@expo/vector-icons';  
import { HandlerStateChangeEvent, TapGestureHandler, TapGestureHandlerEventPayload} from 'react-native-gesture-handler';  
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
  
type Post = {
      id: string;
      title: string;
      caption: string;
      spendingRange: number;
      imageURLs: string[];
      timestamp: any; 
      likes: number;
    };

  type PostDetailsRouteParams = {
    post: Post;
  };

  type PostDetailsRouteProp = RouteProp<{ PostDetails: PostDetailsRouteParams }, 'PostDetails'>;

  export default function PostDetails() {

    const route = useRoute<PostDetailsRouteProp>();
    const { post } = route.params;

    const [likes, setLikes] = useState<number>(post.likes || 0);
    const [liked, setLiked] = useState<boolean>(false);
    const [comment, setComment] = useState<string>('');
    const [comments, setComments] = useState<{comment: string, userName: string}[]>([]);
    const [userName, setUserName] = useState<string | undefined>();
    
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;
    const postRef = doc(db, 'posts', post.id);

    const doubleTapRef = useRef();

    useEffect(() => {

      const commentsRef = collection(db, `posts/${post.id}/comments`);
    
      const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
        const commentsData: {comment: string, userName: string}[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          commentsData.push({comment: data.comment, userName: data.userName})
        })

        setComments(commentsData);
      });

      return () => unsubscribe();
    
    }, [post.id]);

    useEffect(() => {

      if (user) {
        
        const likesRef = collection(db, `posts/${post.id}/likes`);
        const q = query(likesRef, where('userId', '==', user.uid));
        
        getDocs(q).then((snapshot) => {
          if (!snapshot.empty) {
            setLiked(true);
          }
        });
      }
    }, [post.id, user]);
    
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
                    setUserName(userData.userName);
                } else {
                    Alert.alert("Error", "No data found!");
                }
            }
        }

      fetchUserData();

    },[post.id, user])

    const handleLike = useCallback(
      async () => {
        
        if (user) {
          const likesRef = collection(db, `posts/${post.id}/likes`);
          const userLikeRef = doc(likesRef, user.uid);
    
          if (liked) {
            
            await deleteDoc(userLikeRef);
            setLikes(likes - 1);
            setLiked(false);
            await updateDoc(postRef, { likes: likes - 1 });
          } else {
    
            await setDoc(userLikeRef, {
              userId: user.uid,
              timestamp: new Date(),
            });
    
            setLikes(likes + 1);
            setLiked(true);
            
            await updateDoc(postRef, { likes: likes + 1 });
          }
        }
      }, [liked, likes, postRef, user, post.id]);

    const handleComment = useCallback(
      async () => {
        
        if (comment.trim()) {
          const commentsRef = collection(db, `posts/${post.id}/comments`);
        
          await addDoc(commentsRef, {
            comment: comment,
            userId: user?.uid,
            userName: userName,
            timestamp: new Date(),
          });
        
          setComment('');
        }
      },[comment, post.id, user])


    const commentInputRef = useRef<TextInput>(null);

    
    const focusOnCommentInput = () => {
      if (commentInputRef.current) {
        commentInputRef.current.focus();
      }
    };

    const scale = useSharedValue(0);
    const heartX = useSharedValue(0);
    const heartY = useSharedValue(0);

    const heartStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: scale.value,
      left: heartX.value,
    top: heartY.value,
    }));

    const handleDoubleTap = useCallback((event: HandlerStateChangeEvent<any>) => {
      if (user) {
        doubleTapLike();
        const nativeEvent = event.nativeEvent;
        heartX.value = nativeEvent.x - 50;
        heartY.value = nativeEvent.y - 50; 
        scale.value = withSpring(1, undefined, (isFinished) => {
          if (isFinished) {
            scale.value = withDelay(100, withSpring(0));
          }
        });
      }
    }, [user, handleLike])

    const doubleTapLike = useCallback(
      async () => {
        
        if (user) {
          const likesRef = collection(db, `posts/${post.id}/likes`);
          const userLikeRef = doc(likesRef, user.uid);
    
          if (!liked){
    
            await setDoc(userLikeRef, {
              userId: user.uid,
              timestamp: new Date(),
            });
    
            setLikes(likes + 1);
            setLiked(true);
            
            await updateDoc(postRef, { likes: likes + 1 });
          }
        }
      }, [liked, likes, postRef, user, post.id]);

    const renderContent = useMemo(
      () => (
        <View>
          <View style={styles.contentContainer}>
              <TapGestureHandler
                    waitFor={doubleTapRef}
                    onActivated={() => console.log('Once')}>
                <TapGestureHandler
                  maxDelayMs={500} 
                  ref={doubleTapRef}
                  numberOfTaps={2}
                  onActivated={handleDoubleTap}>

                  <Animated.View style={styles.photoContainer}>
                    
                    <Swiper 
                      style={styles.swiper} 
                      showsPagination={true}
                      loadMinimal={true}>
                      {post.imageURLs.map((imageUri, index) => (
                        <View key={index} style={styles.slide}>
                          <Image source={{uri: imageUri}} style={styles.image}/>
                        </View>
                      ))}
                    </Swiper>
                    <Animated.View style={[styles.heart, heartStyle]}>
                  <MaterialCommunityIcons name="heart" size={100} color="red"/>
                </Animated.View>
                  </Animated.View>
                </TapGestureHandler>
              </TapGestureHandler>
              <Text style={styles.title}>{post.title}</Text>
              <Text style={styles.caption}>{post.caption}</Text>
          </View>
          <View style={styles.bottomContentContainer}>
            <Text style ={styles.bottomContentTitle}>{comments.length} comments</Text>
          </View>
        </View>
        
      ), [handleLike, liked, likes, post.caption, post.imageURLs, post.title])
      
      const renderEnding = () => (
        <View style={styles.endingContainer}>
          <Text style={styles.ending}>End</Text>
        </View>
      )
      
      return (
        
        
        <SafeAreaView style={styles.container}>                  
                  <FlatList
                    ListHeaderComponent={renderContent}
                    ListFooterComponent={renderEnding}
                    data={comments}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => 
                      <View style={styles.commentContainer}>
                        <Text style={styles.commentName}>{item.userName}</Text>
                        <Text style={styles.comment}>{item.comment}</Text>
                      </View>
                    }
                    />
                
        
                  <View style={styles.footer}>
                    <TextInput
                      ref={commentInputRef}
                      style={styles.commentInput}
                      placeholder="Add a comment"
                      value={comment}
                      onChangeText={setComment}
                      onSubmitEditing={handleComment}
                    />
        
                    <SafeAreaView style={styles.featureContainer}>
        
                      <View style={styles.singleFeatureContainer}>
                        <Pressable onPress={handleLike}>
                          <MaterialCommunityIcons
                            name={liked ? "heart" : "heart-outline"}
                            size={32}
                            color={liked ? "red" : "black"}
                          />
                        </Pressable>
                        <Text style={styles.likes}>{likes}</Text>
                      </View>
        
                      <View style={styles.singleFeatureContainer}>
                        <Pressable onPress={focusOnCommentInput} style={styles.commentIcon}>
                          <FontAwesome name="comment-o" size={28} color="black" />
                        </Pressable>
                        <Text style={styles.commentNum}>{comments.length}</Text>
                      </View>
        
                    </SafeAreaView>
        
                  </View>
              </SafeAreaView>
            );

  };

  const { width } = Dimensions.get('window');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f6fa',
    },
    scrollContainer: {
      paddingBottom: 20,
    },
    contentContainer: {
      borderColor: '#D3D3D3',
      borderStyle: 'dashed',
      borderBottomWidth:2,
      paddingBottom: 30,
      alignItems: 'flex-start'
    },
    bottomContentContainer: {
      paddingTop: 10
    },
    photoContainer: {
      height: 400,
      // borderWidth:1,
      color: '#f5f6fa',
    },
    commentContainer: {
      borderBottomWidth: 1,
      borderColor: 'gray',
      height:70,
      justifyContent:'center',
      marginHorizontal:5,
    },
    endingContainer: {
      height:200,
      alignItems: 'center'
    },
    featureContainer: {
      flexDirection:'row',
      justifyContent:'center',
      alignItems:'center'
    },
    singleFeatureContainer: {
      flexDirection:'row',
      marginLeft:5,
      marginRight:5,
    },
    swiper: {
      height: 400,
      marginBottom:20,
    },
    slide: {
      // flex:1,
      flexWrap: 'wrap',
      justifyContent:'center',
      alignItems:'center',
      // padding:10,
    },
    image: {
      width: width,
      height: 500,
      // padding: 50,
      resizeMode:'stretch'
    },
    title: {
      paddingLeft: 5,
      fontSize: 28,
      fontWeight: 'bold',
      marginVertical: 10,
      textAlign: 'left',
    },
    caption: {
      paddingLeft: 5,
      fontSize: 16,
      marginVertical: 10,
      textAlign: 'left',
    },
    likes: {
      fontSize: 18,
      paddingBottom:3,
      paddingLeft:5,
      fontWeight:'bold',
      marginVertical: 5,
      textAlign: 'center',
      marginRight:5,
    },
    commentNum: {
      fontSize: 18,
      paddingBottom:3,
      paddingLeft:5,
      fontWeight:'bold',
      marginVertical: 5,
      textAlign: 'center',
      marginRight: 15,
    },
    bottomContentTitle: {
      paddingLeft:15,
      fontSize: 16,
    },
    commentInput: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginVertical: 10,
      paddingHorizontal: 50,
      borderRadius:20,
      marginLeft:15,
    },
    commentName: {
      fontSize:16,
      fontWeight:'bold',
      marginLeft: 10,
    },
    comment: {
      fontSize: 14,
      marginVertical: 5,
      paddingHorizontal: 10,
    },
    ending: {
      fontSize: 15,
      color: '#71797E',
      marginTop: 20,
    },
    commentIcon: {
      marginBottom:2,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // padding: 10,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderColor: '#ccc',
    },
    heart: {
      position: 'absolute',
      zIndex: 1,
    },
  });

