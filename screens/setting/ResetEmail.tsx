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
import { getAuth, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail,  EmailAuthProvider, reauthenticateWithCredential, updateEmail, verifyBeforeUpdateEmail, signOut } from 'firebase/auth';

export default function ResetEmail() {
    const [currentEmail, setCurrentEmail] = useState<string | undefined>();
    const [newEmail, setNewEmail] = useState<string | undefined>();
    const [password, setPassword] = useState<string | undefined>();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalVisibility, setModalVisibility] = useState<boolean>(false);
    const navigation = useNavigation<NativeStackNavigationProp<any>>();


    const handleNextStep = () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user && user.email && currentEmail && password) {
            
            if (user.email !== currentEmail) {
                Alert.alert("Error", "Current Email doesn't match the account!")
                return;
            }

            const credential = EmailAuthProvider.credential(
                user.email,
                password
            )

            const output = reauthenticateWithCredential(user, credential).then(() => {
                setModalVisibility(true);
            }).catch((e) => Alert.alert("Error", "Wrong Password"));

        }
    }
    
    const handleResetEmail = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (currentEmail === newEmail) {
            Alert.alert("Error", "You cannot change back original email!")
            return;
        }

        if (user && newEmail) {
            try {
                await verifyBeforeUpdateEmail(user, newEmail)
                setModalVisibility(false);
                await signOut(auth)
                Alert.alert("Reminder", "Verification Email sent! \nPlease verify your new email! \n Your email will be change right after you verified your email!");
                navigation.replace('Login');

            } catch(e) {
                console.error(e)
                let err = "Try Again";
                if (e instanceof Error && e.message ) {
                  switch (e.message) {
                    case 'Firebase: Error (auth/email-already-in-use).':
                      err = 'Email address is already in use!'
                      break;
                    case 'Firebase: Error (auth/invalid-email).':
                      err = 'Invalid email address!'
                      break;
                    default:
                      err = e.message;
                      break;
                  }
                }
                Alert.alert("Error", err);
            }
        }
        
    }
  
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
                    <View style={styles.overall}>
                        <Image source={require('@/assets/images/logo1.png')} style={styles.logo} />
                        <View style = {styles.container}>
                            <Text style={styles.title}>Reset Email</Text>
                            <View style={styles.content}>
                                <Text style={styles.contentText}>New Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="New Email"
                                    placeholderTextColor="#aaa"
                                    value={newEmail}
                                    onChangeText={setNewEmail}
                                    inputMode="email"
                                    autoCapitalize="none"
                                />
                                <Button title = "Reset Email" onPress={handleResetEmail} testID="Reset Email"/>
                            </View>
                        </View>
                    </View>
                    </Modal>
                
                    <Text style={styles.title}>Reset Email</Text>
                    <View style={styles.content}>
                        <Text style={styles.contentText}>Current Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Current Email"
                            placeholderTextColor="#aaa"
                            value={currentEmail}
                            onChangeText={setCurrentEmail}
                            inputMode="email"
                            autoCapitalize="none"
                        />
        
                        <Text style={styles.contentText}>Password</Text>
                        <View style = {styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Password"
                                placeholderTextColor="#aaa"
                                value={password}
                                onChangeText={setPassword}
                                autoCapitalize="none"
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.showPasswordButton}
                            >
                                <Text style={styles.showPasswordText}>{showPassword ? "Hide" : "Show"}</Text>
                            </TouchableOpacity>
                        </View>

                    <Button title = "Next" onPress={handleNextStep}/>
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
