import React, { useState, useEffect } from 'react';
import { SafeAreaView, TextInput, Button, StyleSheet, Text, View, Image, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import Swiper from 'react-native-swiper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type AddPostRouteParams = {
    images: string[];
};

type AddPostRouteProp = RouteProp<{ AddPost: AddPostRouteParams }, 'AddPost'>;

export default function AddPost() {
 
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState<string>('');
    const [caption, setCaption] = useState<string>('');
    const [spendingRange, setSpendingRange] = useState<number | undefined>();
    const navigation = useNavigation();
 
    const route = useRoute<AddPostRouteProp>();

    useEffect(() => {
        if (route.params?.images) {
            setImages(route.params.images);
        }
    }, [route.params?.images]);

    const uploadImages = async () => {
        try {
            const storage = getStorage();
            const uploadPromises = images.map(async (uri, index) => {
                const response = await fetch(uri);
                const blob = await response.blob();
                const postRef = ref(storage, `postImages/${Date.now()}_${index}`);

                await uploadBytes(postRef, blob);
                const downloadURL = await getDownloadURL(postRef);
                return downloadURL;
            });

            const downloadURLs = await Promise.all(uploadPromises);
            return downloadURLs;
        } catch (e) {
            Alert.alert("Error", "Try Again");
        }
    };

    const savePost = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user && images.length > 0) {
            const db = getFirestore();
            const postRef = collection(db, "posts");
            try {
                const imageURLs = await uploadImages();

                await addDoc(postRef, {
                    userId: user.uid,
                    title: title,
                    caption: caption,
                    spendingRange: spendingRange,
                    imageURLs: imageURLs,
                    timestamp: serverTimestamp(),
                    likes: 0,
                    comments: [],
                });

                Alert.alert("Done");
                setImages([]);
                setCaption('');
                setSpendingRange(0);
                navigation.goBack(); 
            } catch (e) {
                Alert.alert("Error", "Try Again");
            }
        } else {
            Alert.alert("Error", "Please select images and enter a caption");
        }
    };

    return (
        <SafeAreaView style={styles.overall}>
            <View style={styles.header}>
                {images.length > 0 && (
                    <Swiper style={styles.swiper} showsPagination={true}>
                        {images.map((imageUri, index) => (
                            <View key={index} style={styles.slide}>
                                <Image source={{ uri: imageUri }} style={styles.image} />
                            </View>
                        ))}
                    </Swiper>
                )}

            </View>
            <View style={styles.container}>
                <TextInput
                    style={styles.titleInput}
                    placeholder="Enter Title"
                    value={title}
                    onChangeText={setTitle}
                />
                <TextInput
                    style={styles.captionInput}
                    placeholder="Enter caption"
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                    textAlignVertical={'top'}
                />
                <TextInput 
                    style={styles.spendingInput}
                    placeholder='Spending Range'
                    placeholderTextColor="#aaa"
                    keyboardType='number-pad'
                    value={(spendingRange === undefined || Number.isNaN(spendingRange))  ? '' : spendingRange.toString(10)}
                    onChangeText={(text) => setSpendingRange(parseFloat(text))}
                />  
                <Button title="Save Post" onPress={savePost} />

            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    overall: {
        flex: 1,
        backgroundColor: '#f5f6fa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        // backgroundColor: '#FFD700',
        padding: 20,
        // borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 30,
        // height: 200
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        marginHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: '100%', // Adjust width as needed
        alignItems: 'center',
        
    },
    swiper: {
        height: 220,
        marginBottom: 20,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 150,
        height: 150,
    },
    titleInput: {
        height: 50,
        // borderWidth: 1,
        borderBottomWidth:1,
        paddingHorizontal: 10,
        borderColor: 'gray',
        width: '100%',
    },
    spendingInput: {
        height: 50,
        // borderWidth: 1,
        borderBottomWidth:1,
        paddingHorizontal: 10,
        borderColor: 'gray',
        width: '100%',
        marginBottom: 20,
    },
    captionInput: {
        height: 150,
        // borderWidth: 1,
        borderBottomWidth:1,
        paddingHorizontal: 10,
        paddingTop:10,
        borderColor: 'gray',
        width: '100%',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        width: '80%',
        paddingHorizontal: 10,
        marginBottom: 20,
    },
});
