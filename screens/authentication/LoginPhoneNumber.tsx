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
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import app from '../../firebaseConfig';
import PhoneInput from 'react-native-phone-input'; 

export default function LoginPhoneNumber() {
    const [email, setEmail] = useState<string | undefined>();
    const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
    const [password, setPassword] = useState<string | undefined>();
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [modalVisibility, setModalVisibility] = useState<boolean>(false);
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const handleLogin = async () => {
        // if (phoneNumber) {
        //     setLoading(true);
        //     try {

        //     }
        // }
        // if (email && password) {
        //     setLoading(true);
        //     try {
        //         const auth = getAuth(app);
        //         const response = await signInWithEmailAndPassword(auth, email, password);

        //         if (response.user && response.user.emailVerified) {
        //             setLoading(false);
        //             navigation.replace('TabNavigation');
        //         } else {
        //             setModalVisibility(true);
        
        //         }
        //     } catch (e) {
        //         setLoading(false);
        //         let err = "Try Again";
        //         if (e instanceof Error && e.message) {
        //             err = e.message;
        //         }
        //         Alert.alert("Error", "Invalid Email or Password");
        //     }
        // }
    };

    const resendVerificationEmail = () => {
        const auth = getAuth(app);
        const user = auth.currentUser;
        if (user) {
          sendEmailVerification(user)
          .then(() => Alert.alert("Verification Email Resent", "Please check your email"))
          .catch((e) => {Alert.alert("Error sending email", "Please try again later")});
        }
    }

    const handleCheckEmailVerification = () => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          user.reload().then(() => {
            if (user.emailVerified) {
              Alert.alert("Email verified!", "You may proceed!")
              setModalVisibility(false);
              navigation.reset({
                index: 0,
                routes: [{name: 'TabNavigation'}],
              })
            }
          })
        }
    }

    useEffect(() => {
        if (modalVisibility) {
          const interval = setInterval(() => {
            handleCheckEmailVerification();
          }, 5000);
          return () => clearInterval(interval);
        }
    }, [modalVisibility]);

    return (
        
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <SafeAreaView style={styles.overall}>
                <Image source={require('@/assets/images/logo1.png')} style={styles.logo} />
                <View style={styles.container}>
                <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisibility}
                onRequestClose={() =>{
                  setModalVisibility(!modalVisibility);
                }}>
                  <View style={{ flex: 10, justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
                  <Text style={{ marginBottom: 15, textAlign: 'center' }}>Please verify your email address to proceed.</Text>
                  <Button title="Resend Verification Email" onPress={resendVerificationEmail}/>
                        </View>
                    </View>
                </Modal>
                    <Text style={styles.title}>Login</Text>
                    <View style={styles.content}>
                        <Text style={styles.contentText}>PhoneNumber</Text>
                        <PhoneInput 
                  initialValue={phoneNumber}
                  initialCountry="sg"
                  onChangePhoneNumber={(number) => setPhoneNumber(number)}
                  style = {styles.input}/>
                        {loading ? (
                            <ActivityIndicator size="large" color="#3498db" />
                        ) : (
                            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                                <Text style={styles.loginButtonText}>Login</Text>
                            </TouchableOpacity>
                        )}
                        <View style={styles.registerContainer}>
                            <Text style={styles.navigateTitle}>No account?</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.navigateRegister}>Sign Up Now!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <Button title="Login Using Email" onPress={() => navigation.navigate('Login')}/>
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
        marginTop: 20,
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
    }
});
