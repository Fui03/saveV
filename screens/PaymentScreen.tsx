import React, { useEffect, useState } from 'react';
import { View, Button, Text, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { PDFDocument, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation} from "@react-navigation/native";
import * as Sharing from 'expo-sharing';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { format } from 'date-fns';



type CardDetails = {
    complete: boolean;
    brand?: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
};


export default function PaymentScreen() {
  
  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();

  const navigation = useNavigation<NativeStackNavigationProp<any>>();


    
  const { confirmPayment } = useStripe();
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string | undefined>();
  const [userEmail, setUserEmail] = useState<string | undefined>();


  useEffect(() => {

    if (user) {
    
    const fetchUserData = async () => {
      const profRef = doc(db, `users/${user.uid}`);
      const snapshot = await getDoc(profRef);
      if (snapshot.exists()) {
        setUserName(snapshot.data().userName);
      } 
      
      if (user.email) {
        setUserEmail(user.email);
      }

    }

    fetchUserData();

    }
  }, []);
  
  
    const handlePayPress = async () => {
        if (!cardDetails?.complete) {
          Alert.alert('Error', 'Please enter complete card details');
          return;
        }
        setLoading(true);
        try {
          const response = await fetch('http://10.0.2.2:3000/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: 109,
            }),
          });
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
            Alert.alert('Payment Successful!', `PaymentIntent ID: ${paymentIntent.id}`);
            const pdfPath = await generatePdf(paymentIntent.id);
            navigation.replace('PdfReceipt', { pdfUri: pdfPath })
          }
        } catch (e) {
            if (e instanceof Error) {
                console.error(e);
                Alert.alert('Payment Confirmation Error', e.message);
            }
        }
        setLoading(false);
    };

    const generatePdf = async (paymentIntent: string) => {

      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([300, 410]);

      let yPosition = 370;

      const drawHeader = () => {
        page.drawText('saveV', { x: 250, y: yPosition, size: 20, color: rgb(0.128, 0.128, 0.128) });
        page.drawText('Invoice', { x: 20, y: yPosition, size: 20, color: rgb(0, 0, 0) });
        yPosition -= 30;
        page.drawText(`Invoice Number: ${paymentIntent}`, { x: 20, y: yPosition, size: 11, color: rgb(0.128, 0.128, 0.128) });
        yPosition -= 15;
        page.drawText(`Date of Issue: ${format(new Date(), 'dd-MM-yyyy')}`, { x: 20, y: yPosition, size: 10, color: rgb(0, 0, 0) });
        yPosition -= 15;
        page.drawText(`Time: ${format(new Date(), 'HH:mm:ss')}`, { x: 20, y: yPosition, size: 10, color: rgb(0, 0, 0) });
        yPosition -= 30;
        page.drawText(`SaveV`, { x: 20, y: yPosition, size: 11, color: rgb(0, 0, 0) });
        page.drawText(`Pay To:`, { x: 140, y: yPosition, size: 11, color: rgb(0, 0, 0) });
        yPosition -= 15;
        page.drawText(`${userName}`, { x: 140, y: yPosition, size: 10, color: rgb(0, 0, 0) });
        yPosition -= 15;
        page.drawText(`${userEmail}`, { x: 140, y: yPosition, size: 10, color: rgb(0, 0, 0) });
        yPosition -= 20;
        page.drawRectangle({x:10, y: yPosition, width:300, height:1, color: rgb(0.128, 0.128, 0.128)})
        yPosition -= 20;

        
      };
      
      const drawTableHeaders = () => {
        page.drawText('Description', {x: 10, y: yPosition, size: 11, color: rgb(0,0,0)})
        page.drawText('Quantity', {x: 170, y: yPosition, size: 11, color: rgb(0,0,0)})
        page.drawText('Amount', {x: 260, y: yPosition, size: 11, color: rgb(0,0,0)})
        yPosition -= 10;
        page.drawRectangle({x:10, y: yPosition, width:300, height:1, color: rgb(0, 0, 0)})
        yPosition -= 20;
        
      };

      const drawTableContent = () => {
        page.drawText('Posting charge', {x: 10, y: yPosition, size: 9, color: rgb(0,0,0)})
        page.drawText('x1', {x: 190, y: yPosition, size: 9, color: rgb(0,0,0)})
        page.drawText('$1.09', {x: 270, y: yPosition, size: 9, color: rgb(0,0,0)})
        yPosition -= 20;
        page.drawRectangle({x:10, y: yPosition, width:300, height:1, color: rgb(0, 0, 0)})
        yPosition -= 15;
        page.drawText('Total', {x: 10, y: yPosition, size: 9, color: rgb(0,0,0)})
        page.drawText('$1.09', {x: 270, y: yPosition, size: 9, color: rgb(0,0,0)})
        yPosition -= 10;
        page.drawRectangle({x:250, y: yPosition, width:60, height:1, color: rgb(0, 0, 0)})
        yPosition -= 3;
        page.drawRectangle({x:250, y: yPosition, width:60, height:1, color: rgb(0, 0, 0)})
        

      }
    
      

      drawHeader();
      drawTableHeaders();
      drawTableContent();

      const pdfBytes = await pdfDoc.save();

      const pdfPath = `${FileSystem.documentDirectory}receipt.pdf`;

      await FileSystem.writeAsStringAsync(pdfPath,  btoa(String.fromCharCode(...pdfBytes)), {
        encoding: FileSystem.EncodingType.Base64,
      });
    
      return pdfPath;
    };

      const handleExportPdf = async () => {
        try {
            const pdfPath = await generatePdf("1234");
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(pdfPath);
            } else {
              alert('Sharing is not available on this device');
            }
          
        } catch (e) {
          console.log(e);
        }
      };


      

    return(
      <SafeAreaView style={styles.overall}>
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
        <Button title='Export' onPress={handleExportPdf}/>
      </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  overall: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    // justifyContent: 'center',
    alignItems: 'center',
  },
  paymentHeaderContainer: {
    // borderWidth:1,
    paddingVertical:10,
    width:'90%',
    marginVertical:10,
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
