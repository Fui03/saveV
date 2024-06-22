import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SafeAreaView, Pressable ,Text, StyleSheet, Image, View, Button, TextInput, ScrollView, FlatList, Dimensions, KeyboardAvoidingView, Alert, ListRenderItem, ListRenderItemInfo } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getFirestore, onSnapshot, updateDoc, getDocs, query, where, setDoc, deleteDoc, getDoc, orderBy, increment } from 'firebase/firestore';
import Swiper from 'react-native-swiper';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome } from '@expo/vector-icons';  
import { HandlerStateChangeEvent, TapGestureHandler} from 'react-native-gesture-handler';  
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { Entypo } from '@expo/vector-icons';

  
  type Post = {
        id: string;
        title: string;
        caption: string;
        spendingRange: number;
        imageURLs: string[];
        timestamp: any; 
        likes: number;
  };

  type Comments = {
    id: string,
    userName: string,
    comment: string,
    likes: number,
    replies?: Reply[]
    replyCount: number,
  }

  type Reply = {
    id: string,
    userName: string,
    comment: string,
    likes: number,
  }
  
  
  type PostDetailsRouteParams = {
    post: Post;
  };

  type PostDetailsRouteProp = RouteProp<{ PostDetails: PostDetailsRouteParams }, 'PostDetails'>;

  export default function PostDetails() {

    const route = useRoute<PostDetailsRouteProp>();
    const { post } = route.params;

    const [likes, setLikes] = useState<number>(0);
    const [liked, setLiked] = useState<boolean>(false);
    const [comment, setComment] = useState<string>('');
    const [comments, setComments] = useState<Comments[]>([]);
    const [userName, setUserName] = useState<string | undefined>();
    const [saved, setSaved] = useState<boolean>(false);

    const [replies, setReplies] = useState<{[ket: string]: Reply[]}>({});
    const [isReplying, setIsReplying] = useState(false);
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyName, setReplyName] = useState<string>('')
    const [likeCooldown, setLikeCooldown] = useState<boolean>(false);


    const [commentLikedMap, setCommentLikedMap] = useState<{ [key: string]: boolean }>({});
    const [replyLikedMap, setReplyLikedMap] = useState<{ [key: string]: boolean }>({});
    const [showRepliesMap, setShowRepliesMap] = useState<{ [key: string]: boolean }>({});


    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;
    const postRef = doc(db, 'posts', post.id);

    const doubleTapRef = useRef();

    //Comments
    useEffect(() => {
      const commentsRef = collection(db, `posts/${post.id}/comments`);
      const unsubscribe = onSnapshot(commentsRef, async (snapshot) => {
        const commentsData: Comments[] = [];
        const likesPromises: Promise<void>[] = [];
    
        snapshot.forEach((doc) => {
          const data = doc.data();
          const commentId = doc.id;
          commentsData.push({
            id: commentId,
            comment: data.comment,
            userName: data.userName,
            likes: data.likes || 0,
            replies: [],
            replyCount: data.replyCount || 0,
          });

          likesPromises.push(
            getDocs(collection(db, `posts/${post.id}/comments/${commentId}/likes`)).then((likesSnapshot) => {
              likesSnapshot.forEach((likeDoc) => {
                if (likeDoc.id === user?.uid) {
                  setCommentLikedMap((prev) => ({ ...prev, [commentId]: true }));
                }
              });
            })
          );
        });
    
        await Promise.all(likesPromises);
        setComments(commentsData);
      });
    
      return () => unsubscribe();
    }, [post.id, user]);
    


    //Post likes
    useEffect(() => {

      if (user) {
        
        const likesRef = collection(db, `posts/${post.id}/likes`);
        const q = query(likesRef, where('userId', '==', user.uid));

        const likeRef = doc(db, `posts/${post.id}`);
        
        getDoc(likeRef).then((snapshot) => {
          if (snapshot.exists()) {
            setLikes(snapshot.data().likes);
          }
        })
        
        getDocs(q).then((snapshot) => {
          if (!snapshot.empty) {
            setLiked(true);
          }
        });
      }
    }, [post.id, user]);
    
    //saves
    useEffect(() => {

      const unsubscribe = async () => {
        if (user) {
          const userNameRef = doc(db, `users`, user.uid);
          const saveRef = doc(db,`users/${user.uid}/saves/${post.id}`)

          await getDoc(saveRef).then((snapshot) => {
            if (snapshot.exists()) {
              setSaved(true);
            }
          })
          
          
  
          await getDoc(userNameRef).then((snapshot) => {
            if (snapshot.exists()) {
              const userData = snapshot.data();
              setUserName(userData.userName);
              }
              })
              
        }

      }

      unsubscribe();
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

      const handleReplyLike = useCallback(
        async (commentId: string, replyId: string, isLiked: boolean) => {
          if (user && !likeCooldown) {

            setLikeCooldown(true);

            const replyRef = doc(db, `posts/${post.id}/comments/${commentId}/replies/${replyId}`);
            const replyLikesRef = collection(db, `posts/${post.id}/comments/${commentId}/replies/${replyId}/likes`);
            const userReplyLikeRef = doc(replyLikesRef, user.uid);
      
            if (isLiked) {
              await deleteDoc(userReplyLikeRef);
              await updateDoc(replyRef, { likes: increment(-1) });
              setReplyLikedMap((prev) => ({ ...prev, [replyId]: false }));
            } else {
              await setDoc(userReplyLikeRef, {
                userId: user.uid,
                timestamp: new Date(),
              });
              await updateDoc(replyRef, { likes: increment(1) });
              setReplyLikedMap((prev) => ({ ...prev, [replyId]: true }));
            }

            setTimeout(() => {
              setLikeCooldown(false);
            }, 1000);

          }
        }, [post.id, user]
      );
      

    const handleComment = useCallback(
      async () => {
        
        if (comment.trim()) {
          if (isReplying && replyTo) {
            const docRef = doc(db, `posts/${post.id}/comments/${replyTo}`)
            const repliesRef = collection(db, `posts/${post.id}/comments/${replyTo}/replies`);
            await addDoc(repliesRef, {
              comment: comment,
              userId: user?.uid,
              userName: userName,
              likes: 0,
              timestamp: new Date(),
            });

            await updateDoc(docRef, { replyCount: increment(1)})
          
          } else {
            const commentsRef = collection(db, `posts/${post.id}/comments`);
            await addDoc(commentsRef, {
              comment: comment,
              userId: user?.uid,
              userName: userName,
              likes: 0,
              replyCount: 0,
              timestamp: new Date(),
            });
            
          }
          setComment('');
          setIsReplying(false);
          setReplyTo(null);
          setReplyName('');
        }
      },[comment, post.id, user, replyTo]
    );
    
    const handleCommentLike = useCallback(
      async(commentId: string, isLiked:boolean) => {
        if (user && !likeCooldown) {
          setLikeCooldown(true);
          
          const commentRef = doc(db, `posts/${post.id}/comments/${commentId}`);
          const commentLikesRef = collection(db, `posts/${post.id}/comments/${commentId}/likes`);
          const userCommentLikeRef = doc(commentLikesRef, user.uid);
    
          if (isLiked) {
            await deleteDoc(userCommentLikeRef);
            await updateDoc(commentRef, { likes: increment(-1) });
            setCommentLikedMap((prev) => ({ ...prev, [commentId]: false }));
          } else {
            await setDoc(userCommentLikeRef, {
              userId: user.uid,
              timestamp: new Date(),
            });
            await updateDoc(commentRef, { likes: increment(1) });
            setCommentLikedMap((prev) => ({ ...prev, [commentId]: true }));
          }

          setTimeout(() => {
            setLikeCooldown(false);
          }, 1000);
          
        }
      },[post.id, user]
    )

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
            scale.value = withDelay(1, withSpring(0));
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

    const handleSave = useCallback(
      async() => {
        if (user) {
          const saveRef = collection(db, `users/${user.uid}/saves`);
          const userSaveRef = doc(saveRef, post.id);

          if (saved) {
            await deleteDoc(userSaveRef);
            setSaved(false);
          } else {
            await setDoc(userSaveRef, post);
            setSaved(true);
          }
        }
      },[post.id, user, saved]
    )

    const handlePressReply = (commentId: string, userName: string) => {
      setIsReplying(true);
      setReplyTo(commentId);
      setReplyName(`@${userName} `);
      setComment(`@${userName} `);
      commentInputRef.current?.focus();
    }

    const fetchReplies = async (commentId: string) => {
      const repliesRef = collection(db, `posts/${post.id}/comments/${commentId}/replies`);

      onSnapshot(repliesRef, async(snapshot) => {
        const repliesData: Reply[] = [];
        const likesPromises: Promise<void>[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const replyId = doc.id;
          repliesData.push({
            id: replyId,
            comment: data.comment,
            userName: data.userName,
            likes: data.likes || 0,
          });

          likesPromises.push(
            getDocs(collection(db, `posts/${post.id}/comments/${commentId}/replies/${replyId}/likes`)).then((likesSnapshot) => {
              likesSnapshot.forEach((likeDoc) => {
                if (likeDoc.id === user?.uid) {
                  setReplyLikedMap((prev) => ({...prev, [replyId]: true}));
                }
              });
            })
          );
        });

        await Promise.all(likesPromises);
        setReplies((prev) => ({
          ...prev,
          [commentId]: repliesData
        })); 
      });
    }


    const handleShowReplies = (commentId: string) => {
      setShowRepliesMap((prev) => ({
        ...prev,
        [commentId] : !prev[commentId],
      }));

      if (!showRepliesMap[commentId]) {
        fetchReplies(commentId);
      }
    }

    const handleCloseReply = () => {
      setIsReplying(false);
      setComment('');
    }

    const renderContent = useMemo(
      () => (
        <View>
          <View style={styles.contentContainer}>
              <TapGestureHandler
                    waitFor={doubleTapRef}>
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
                  <MaterialCommunityIcons name="heart" size={100} color="red" style={{opacity:0.8}}/>
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

      const renderComments = ({item}: ListRenderItemInfo<any>) => {
        const isLiked = commentLikedMap[item.id] || false;
        const showReplies = showRepliesMap[item.id] || false;


        return (
          
          <View style={styles.commentContainer}>
            <Text style={styles.commentName}>{item.userName}</Text>
            <View style={styles.commentLikeContainer}>
              <View style={{width:'85%'}}>
                <Text style={styles.comment}>{item.comment}</Text>
              </View>
              <View style={styles.commentLikeNumberContainer}>
              <Pressable onPress={() => handleCommentLike(item.id, isLiked)} disabled={likeCooldown}>
                <MaterialCommunityIcons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={22}
                  color={isLiked ? "red" : "black"}
                />
              </Pressable>
              <Text style={{paddingLeft:3, paddingBottom:3}}>{item.likes}</Text>
              </View>
            </View>
            <Pressable onPress={() => handlePressReply(item.id, item.userName)}>
              <Text style={styles.replyButton}>Reply</Text>
            </Pressable>

            {item.replyCount > 0 && (
              <Pressable onPress={() => handleShowReplies(item.id)}>
                <Text style={styles.showRepliesText}>{showReplies ? 'Hide replies' : `Show ${item.replyCount} replies`}</Text>
              </Pressable>)
            }

            {showReplies && replies[item.id] && (
              <FlatList
                data={replies[item.id]}
                keyExtractor={(reply) => reply.id}
                renderItem={({ item: reply }) => (
                  <View style={styles.replyContainer}>
                    <Text style={styles.replyName}>{reply.userName}</Text>
                    <View style={styles.replyCommentContainer}>
                      <Text style={styles.replyComment}>{reply.comment}</Text>
                      <View style={styles.commentLikeNumberContainer}>
                        <Pressable onPress={() => handleReplyLike(item.id, reply.id, replyLikedMap[reply.id])} disabled={likeCooldown}>
                          <MaterialCommunityIcons
                            name={replyLikedMap[reply.id] ? "heart" : "heart-outline"}
                            size={22}
                            color={replyLikedMap[reply.id] ? "red" : "black"}
                          />
                        </Pressable>
                        <Text style={{ paddingLeft: 3, paddingBottom: 3 }}>{reply.likes}</Text>
                      </View>
                    </View>
                  </View>
                )}
              />
            )}
            
          </View>
        )
      }
      
      return (
        <SafeAreaView style={styles.container}>                  
                  <FlatList
                    ListHeaderComponent={renderContent}
                    ListFooterComponent={renderEnding}
                    data={comments}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderComments}
                  />

                  {isReplying && (
                        <View style={styles.statusBarContainer}>
                          <Text style={styles.statusBarReplying}>Replying...</Text>
                          <Pressable onPress={handleCloseReply} style={styles.statusBarCross}>
                            <Entypo name="cross" size={24} color="black" />
                          </Pressable>
                        </View>
                      )}
        
                  <View style={styles.footer}>
                    <TextInput
                      ref={commentInputRef}
                      style={styles.commentInput}
                      placeholder="Add a comment"
                      value={comment}
                      onChangeText={(text) => {
                        if (!isReplying) {
                          setIsReplying(false);
                        }

                        setComment(text);
                      }}
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
        
                      <View style={styles.singleFeatureContainer}>
                        <Pressable onPress={handleSave}>
                        <MaterialCommunityIcons 
                          name= {saved ? 'bookmark': "bookmark-outline" }
                          size={28} 
                          color={saved ? 'blue' : 'black'} />
                        </Pressable>
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
      paddingVertical:15,
      // height:70,
      justifyContent:'center',
      marginHorizontal:5,
    },
    commentLikeContainer: {
      flexDirection:'row',
      justifyContent:'space-between',
      // borderWidth:1
      
    },
    commentLikeNumberContainer: {
      flexDirection:'row',
      alignItems:'center',
      // marginRight:5,
      // justifyContent:'center',
      // borderWidth:1
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
    replyCommentContainer: {
      flexDirection:'row',
      justifyContent:'space-between',
      width:'107%',
      // borderWidth:1
    },
    statusBarContainer: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 10,
      alignItems: 'center',
      position:'absolute',
      width: '100%',
      flexDirection: 'row',
      bottom: 60,
      justifyContent:'space-between'
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
      // marginRight: 15,
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
      fontSize: 17,
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
    replyButton: {
      color:'gray',
      marginLeft:10,
    },
    showRepliesText: {
      color:'gray',
      marginLeft:15,
      paddingVertical:3,
    },
    replyContainer: {
      justifyContent:'center',
      // borderWidth:1,
      paddingVertical:5,
      paddingHorizontal:20,
      alignItems:'flex-start'
    },
    replyName: {
      fontSize:14,
      fontWeight: 'bold'
    },
    replyComment: {
      fontSize:16,

    },
    statusBarReplying: {
      color: 'black',
      fontWeight: 'bold',
    },
    statusBarCross: {
      
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

