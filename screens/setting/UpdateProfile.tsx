import React, { useState, useEffect} from "react";
import {
    View,
    SafeAreaView,
    Text,
    StyleSheet,
    Keyboard,
    TouchableWithoutFeedback,
    TextInput,
    Button,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail,  EmailAuthProvider, reauthenticateWithCredential, updateEmail, verifyBeforeUpdateEmail, signOut } from 'firebase/auth';
import { getDatabase, update , ref, get} from "firebase/database";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";

export default function UpdateProfile() {
    const [userName, setUserName] = useState<string | undefined>();

    const navigation = useNavigation<NativeStackNavigationProp<any>>();


    const handleSave = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            // const db = getDatabase();
            // const userRef = ref(db, `users/${user.uid}`)

            const db = getFirestore();
            const userRef = doc(db, `users`, user.uid)
            
            try {
                // await update(userRef, {userName: userName});
                await updateDoc(userRef, {
                    userName: userName,
                })
                Alert.alert("Success", "Update Completed!")
                navigation.replace('DrawerNavigation')
            } catch (e) {

            }
        }
    }
    
    useEffect(() => {
        const fetchUserData = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                // const db = getDatabase();
                // const userRef = ref(db, `users/${user.uid}`)
                // const snapshot = await get(userRef);
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

    },[])
 
  
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <SafeAreaView style={styles.overall}>
                <Image source={require('@/assets/images/logo1.png')} style={styles.logo} />
                <View style={styles.container}>
                
                    <Text style={styles.title}>Profile</Text>
                    <View style={styles.content}>
                        <Text style={styles.contentText}>User Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="User Name"
                            placeholderTextColor="#aaa"
                            value={userName}
                            onChangeText={setUserName}
                            autoCapitalize="none"
                        />

                    <Button title = "Save" onPress={handleSave}/>
                    </View>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    overall: {
        flex: 1,
        backgroundColor: '#f5f6fa',
        justifyContent: 'center',
        alignItems: 'center', // Center everything horizontally
    },
    logo: {
        width: 400, // Adjust width as needed
        height: '30%', // Adjust height as needed
        marginBottom: 20,
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
        width: '80%', // Adjust width as needed
        alignItems: 'center',
        
    },
    title: {
        color: '#2c3e50',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    content: {
        width: '100%',
        marginBottom: 20,
    },
    contentText: {
        fontSize: 16,
        color: '#34495e',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#dcdde1',
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#ecf0f1',
        fontSize: 16,
        color: '#2c3e50',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dcdde1',
        borderRadius: 5,
        backgroundColor: '#ecf0f1',
        marginBottom: 15,
    },
    passwordInput: {
        flex: 1,
        padding: 10,
        fontSize: 16,
        color: '#2c3e50',
    },
    showPasswordButton: {
        padding: 10,
    },
    showPasswordText: {
        color: '#3498db',
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    navigateTitle: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    navigateRegister: {
        fontSize: 14,
        color: '#3498db',
        marginLeft: 5,
        fontWeight: 'bold',
    },
    forgetPasswordContainer: {
        flexDirection:'row',
        justifyContent:'flex-end',
        alignItems:'flex-end',
        marginTop: 15,
    },
    forgetPasswordNavigation: {
        fontSize: 14,
        color: '#3498db',
    }
});
