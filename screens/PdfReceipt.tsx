import React, { useEffect, useState } from 'react';
import { View, Button, Text, Alert, StyleSheet, SafeAreaView } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { PDFDocument, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { format } from 'date-fns';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Pdf from 'react-native-pdf';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

  
type PdfReceiptRouteParams = {
    pdfUri: string;
};

type PdfReceiptRouteProp = RouteProp<{ PdfReceipt: PdfReceiptRouteParams }, 'PdfReceipt'>;


export default function PdfReceipt() {

    
    const route = useRoute<PdfReceiptRouteProp>();
    const { pdfUri } = route.params;
    const navigation = useNavigation<NativeStackNavigationProp<any>>();


    const handleExportPdf = async () => {
        try {
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(pdfUri);
            } else {
              alert('Sharing is not available on this device');
            }
          
        } catch (e) {
          console.log(e);
        }
      };



   return (
        <SafeAreaView style={styles.overall}>
            <Text>{pdfUri}</Text>
            <Button title='export' onPress={handleExportPdf}/>
            <Button title='Back' onPress={() => navigation.replace('DrawerNavigation')}/>
            
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
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    pdf: {
      flex: 1,
      width: '100%',
    },
  });