import React, { useEffect, useState } from 'react';
import { View, Button, Text, Alert, StyleSheet, SafeAreaView, Image, Dimensions } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { PDFDocument, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp, useNavigation, useRoute} from "@react-navigation/native";
import * as Sharing from 'expo-sharing';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import Swiper from 'react-native-swiper';



type CardDetails = {
    complete: boolean;
    brand?: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
};

type PaymentScreenRouteParams = {
  images: string[];
  title: string;
  caption: string;
  spendingRange: number;
};

type NextScreenRouteProp = RouteProp<{ NextScreen: PaymentScreenRouteParams }, 'NextScreen'>;


export default function PaymentScreen() {

  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<NextScreenRouteProp>();
  const { images, title, caption, spendingRange } = route.params;


    
  const { confirmPayment } = useStripe();
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [loading, setLoading] = useState(false);

  
  const handlePayPress = async () => {
        if (!cardDetails?.complete) {
          Alert.alert('Error', 'Please enter complete card details');
          return;
        }
        setLoading(true);
        try {
          const response = await fetch('https://save-elbrpbsd6-savevs-projects.vercel.app/api/payment/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: 109,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const { clientSecret } = await response.json();
      
          const { error, paymentIntent } = await confirmPayment(clientSecret, {
            paymentMethodType: 'Card',
            paymentMethodData: {
              billingDetails: {
                email: 'test@example.com',
              },
            },
          });
      
          if (error) {
            Alert.alert('Payment Confirmation Error', error.message);
          } else if (paymentIntent) {
            await savePost();
            setLoading(false);
            navigation.replace('PdfReceipt', { pdfUri: paymentIntent.id })
          }
        } catch (e) {
            if (e instanceof Error) {
                console.error(e);
                Alert.alert('Payment Confirmation Error', e.message);
            }
            setLoading(false);
        }
  };


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

          const postDoc = await addDoc(postRef, {
            userId: user.uid,
            title: title,
            caption: caption,
            spendingRange: spendingRange,
            imageURLs: imageURLs,
            timestamp: serverTimestamp(),
            likes: 0,
            comments: [],
          });

          const postId = postDoc.id;
          const post = {
            userId: user.uid,
            title: title,
            caption: caption,
            spendingRange: spendingRange,
            imageURLs: imageURLs,
            timestamp: serverTimestamp(),
            likes: 0,
            comments: [],
          };

          await fetch('https://save-elbrpbsd6-savevs-projects.vercel.app/api/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postId, post }),
          });

          Alert.alert("Done"); 
        } catch (e) {
            Alert.alert("Error", "Try Again");
        }
    } else {
        Alert.alert("Error", "Please select images and enter a caption");
    }
  };

      

    return(
      <SafeAreaView style={styles.overall}>
          <Swiper 
            style={styles.swiper} 
            showsPagination={true}
            loadMinimal={true}>
            {images.map((imageUri, index) => (
              <View key={index} style={styles.slide}>
                <Image source={{uri: imageUri}} style={styles.image}/>
              </View>
            ))}
          </Swiper>
        <View style={styles.paymentHeaderContainer}>
          <Text style={styles.paymentHeader}>Payment Details</Text>
          <Text style={styles.paymentAmount}>$ 1.09</Text>
          <Text style={styles.paymentRemark}>Remark: Every Post will charge $1.09</Text>
        </View>

        <CardField
          postalCodeEnabled={false}
          placeholders={{
          number: '4242 4242 4242 4242',
          expiration: 'MM/YY',
          cvc: 'CVC',    
          }}
              
          cardStyle={{
            backgroundColor: '#FFFFFF',
            textColor: '#000000',
            borderWidth: 1,
            borderColor: '#000000',
            borderRadius: 8,
          }}
              
          style={{
            width: '95%',
            height: 100,
            marginVertical: 30,
          }}
          
          onCardChange={(cardDetails) => setCardDetails(cardDetails)}
        />

        <Button onPress={handlePayPress} title="Pay" disabled={loading} />
      </SafeAreaView>
    )
}

const { width } = Dimensions.get('window');


const styles = StyleSheet.create({
  overall: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    // justifyContent: 'center',
    alignItems: 'center',
  },
  paymentHeaderContainer: {
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
    width: '80%',
    alignItems: 'center',
    marginTop:30,
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
  paymentHeader: {
    fontSize:18,
    marginHorizontal:20,
    fontWeight:'500',
    marginBottom:10,
  },
  paymentAmount: {
    fontSize:18,
    marginHorizontal:20,
    fontWeight:'500',
    marginBottom:15,
  },
  paymentRemark: {
    fontSize:13,
    marginHorizontal:20,
    // fontWeight:'500',
  },
  pdf: {
    flex: 1,
    width: '100%',
  },
});
