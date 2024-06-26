import React, { useState, useEffect } from 'react';
import { SafeAreaView, TextInput, Button, StyleSheet, Text, View, Image, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getAuth } from 'firebase/auth';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import Swiper from 'react-native-swiper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AddPostRouteParams = {
    images: string[];
};

type AddPostRouteProp = RouteProp<{ AddPost: AddPostRouteParams }, 'AddPost'>;

export default function AddPost() {
 
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState<string>('');
    const [caption, setCaption] = useState<string>('');
    const [spendingRange, setSpendingRange] = useState<number | undefined>();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
 
    const route = useRoute<AddPostRouteProp>();

    useEffect(() => {
        if (route.params?.images) {
            setImages(route.params.images);
        }
    }, [route.params?.images]);


    const navigateToPayment = () => {
        if (images && title && caption && spendingRange) {
            navigation.navigate('PaymentScreen', {
                images: images,
                title: title,
                caption: caption,
                spendingRange: spendingRange});
        } else {
            Alert.alert("Fill in all the details needed!");
        }
    }

    return (
        <SafeAreaView style={styles.overall}>
            <View style={styles.header}>
                {images.length > 0 && (
                    <Swiper style={styles.swiper} showsPagination={true}>
                        {images.map((imageUri, index) => (
                            <View key={index} style={styles.slide}>
                                <Image source={{ uri: imageUri }} style={styles.image} testID={`image-${index}`}/>
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
                <Button title="Save Post" onPress={navigateToPayment} />

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
