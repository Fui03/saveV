import React, { useEffect, useState } from 'react';
import { View, Button, Text, Alert, StyleSheet, SafeAreaView, TouchableOpacity, Pressable } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { PDFDocument, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Pdf from 'react-native-pdf';
import { Fontisto } from '@expo/vector-icons';

  
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