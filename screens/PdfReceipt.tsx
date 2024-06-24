import React, { useEffect, useState } from 'react';
import { View, Button, Text, Alert, StyleSheet, SafeAreaView, TouchableOpacity, Pressable } from 'react-native';
import { PDFDocument, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Fontisto } from '@expo/vector-icons';

  
type PdfReceiptRouteParams = {
  pdfUri: string;
};

type PdfReceiptRouteProp = RouteProp<{ PdfReceipt: PdfReceiptRouteParams }, 'PdfReceipt'>;


export default function PdfReceipt() {

  const auth = getAuth();
  const user = auth.currentUser;
  const db = getFirestore();

    
  const route = useRoute<PdfReceiptRouteProp>();
  const { pdfUri } = route.params;
  
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

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


    const generatePdf = async (paymentIntent: string) => {

      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([320, 410]);

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
            if (await Sharing.isAvailableAsync()) {
              const pdf = await generatePdf(pdfUri)
              await Sharing.shareAsync(pdf);
            } else {
              alert('Sharing is not available on this device');
            }
          
        } catch (e) {
          console.log(e);
        }
      };



   return (
        <SafeAreaView style={styles.overall}>
          <View style={styles.container}>
            <Text style={styles.title}>Done Payment!</Text>
            <Text style={styles.caption}>You may print out your receipt!</Text>
            <TouchableOpacity onPress={handleExportPdf}>
              <Fontisto name="export" size={24} color="black" style={styles.export}/>
            </TouchableOpacity>
          </View>

          <Pressable style={styles.done} onPress={() => navigation.replace('DrawerNavigation')}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>

        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    overall: {
      flex: 1,
      backgroundColor: '#f5f6fa',
      justifyContent: 'center',
      alignItems: 'center',
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
      width: '80%',
      alignItems: 'center',
    },
    title: {
      fontSize:18,
      fontWeight:'600',
      marginTop:10,
    },
    caption: {
      fontSize:16,
      marginBottom:20,
    },
    export: {
      marginLeft:10,
      marginBottom:5,
    },
    done: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      paddingVertical: 10,
      paddingHorizontal: 32,
      borderRadius: 7,
      elevation: 4,
      backgroundColor: 'black',
    },
    doneText: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: 'bold',
      letterSpacing: 0.25,
      color: 'white',
    },
    pdf: {
      flex: 1,
      width: '100%',
    },
  });