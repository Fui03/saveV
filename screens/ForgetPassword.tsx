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
    Modal
} from 'react-native';

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import app from '../firebaseConfig';

export default function ForgetPassword() {
    const [email, setEmail] = useState<string | undefined>();
    const [loading, setLoading] = useState<boolean>(false);
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    
    const handleForgetPassword = () => {
        const auth = getAuth();
        if (email) {
            sendPasswordResetEmail(auth, email).then(() => {
                Alert.alert("Password Reset Email Sent", "Please check your email!");
                navigation.navigate("Login");
            }).catch((e) => {

            });
        }
      }
  
    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <SafeAreaView style={styles.overall}>
                <Image source={require('../assets/images/logo1.png')} style={styles.logo} />
                <View style={styles.container}>
                
                    <Text style={styles.title}>Forget Password</Text>
                    <View style={styles.content}>
                        <Text style={styles.contentText}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#aaa"
                            value={email}
                            onChangeText={setEmail}
                            inputMode="email"
                            autoCapitalize="none"
                        />
                    <Button title = "Reset Password" onPress={handleForgetPassword}/>
                    </View>
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
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
