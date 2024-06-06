import React, { useState } from 'react';
import { SafeAreaView, TextInput, Button, StyleSheet, Text, View , Image, TouchableOpacity, Pressable, Alert} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAuth } from 'firebase/auth';
import { getDatabase, push, ref, set, update } from 'firebase/database';
import { addDoc, collection, doc, getFirestore } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export default function AddPost() {
    return (
        <SafeAreaView style= {styles.overall}>
            <Text> Hi </Text>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    overall: {
        flex: 1,
        backgroundColor: '#f5f6fa',
        justifyContent: 'center',
        alignItems: 'center', // Center everything horizontally
    },
    
})