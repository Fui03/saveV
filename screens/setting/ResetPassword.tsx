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
    Modal,
    KeyboardAvoidingView,
    Platform
} from 'react-native';

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';


export default function ResetPassword() {
    const [oldPassword, setOldPassword] = useState<string | undefined>();
    const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
    const [newPassword, setNewPassword] = useState<string | undefined>();
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [newConfirmPassword, setNewConfirmPassword] = useState<string | undefined>();
    const [showNewConfirmPassword, setShowNewConfirmPassword] = useState<boolean>(false);


    const [loading, setLoading] = useState<boolean>(false);
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    
    const handleResetPassword = async () => {
       const auth = getAuth();
       const user = auth.currentUser;
       
       if (user && user.email && oldPassword && newPassword && newConfirmPassword) {

        try {

            const credential = EmailAuthProvider.credential(
                user.email,
                oldPassword
            )
    
            const output = await reauthenticateWithCredential(user, credential);
    
            if (!samePassword(newPassword, newConfirmPassword)) {
                Alert.alert("Error", "New Password and Confirm Password do not match!")
                return;
            }

            if (newPassword === oldPassword) {
                Alert.alert("Error", "You cannot reset the same Password")
                return;
            }
            
            await updatePassword(user, newPassword)
            
            navigation.replace('DrawerNavigation');
            
        } catch (e) {
            let err = "Try Again";
                if (e instanceof Error && e.message) {
                    console.log(e.message);
                    switch (e.message) {
                        case 'Firebase: Error (auth/invalid-credential).':
                          err = 'Wrong Old Password'
                          break;
                        case 'Firebase: Password should be at least 6 characters (auth/weak-password).':
                          err = 'Password should be at least 6 characters!';
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

    const samePassword = (newPassword: string | undefined, newConfirmPassword: string | undefined) => {
        if (newPassword && newConfirmPassword && newPassword === newConfirmPassword) {
          return true;
        } else {
          return false;
        }
      }
  
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <SafeAreaView style={styles.overall}>
                <Image source={require('@/assets/images/logo1.png')} style={styles.logo} />
                <View style={styles.container}>
                
                    <Text style={styles.title}>Reset Password</Text>
                    <View style={styles.content}>
                        <Text style={styles.contentText}>Old Password</Text>
                        <View style = {styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Old Password"
                                placeholderTextColor="#aaa"
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                autoCapitalize="none"
                                secureTextEntry={!showOldPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowOldPassword(!showOldPassword)}
                                style={styles.showPasswordButton}
                            >
                                <Text style={styles.showPasswordText}>{showOldPassword ? "Hide" : "Show"}</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.contentText}>New Password</Text>
                        <View style = {styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="New Password"
                                placeholderTextColor="#aaa"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                autoCapitalize="none"
                                secureTextEntry={!showNewPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowNewPassword(!showNewPassword)}
                                style={styles.showPasswordButton}
                            >
                                <Text style={styles.showPasswordText}>{showNewPassword ? "Hide" : "Show"}</Text>
                            </TouchableOpacity>
                            
                        </View>  

                        <Text style={styles.contentText}>Confirm Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Confirm Password"
                                placeholderTextColor="#aaa"
                                value={newConfirmPassword}
                                onChangeText={setNewConfirmPassword}
                                autoCapitalize="none"
                                secureTextEntry={!showNewConfirmPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowNewConfirmPassword(!showNewConfirmPassword)}
                                style={styles.showPasswordButton}
                            >
                                <Text style={styles.showPasswordText}>{showNewConfirmPassword ? "Hide" : "Show"}</Text>
                            </TouchableOpacity>
                        </View>
                    <Button title = "Reset Password" onPress={handleResetPassword} testID="ResetPassword"/>
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
