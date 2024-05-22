import React, {useState} from "react";
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
} from 'react-native'


import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, CommonActions } from "@react-navigation/native";

// import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import app from '../firebaseConfig';




export default function Login() {
    const [email, setEmail] = useState<string | undefined>();
    const [password, setPassword] = useState<string | undefined>();
    
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const handleLogin = async () => {
        if (email && password) {
            try {

                const auth = getAuth(app);
                const response = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

                if (response.user) {
                    console.log("hi");
                    navigation.replace('Home');
                    console.log("complete");
                }
            } catch (e) {
                // console.log(e);
                let err = "Try Again";
                if (e instanceof Error && e.message) {
                    err = e.message
                }
                Alert.alert("Error", "Invalid Emaill or Password");
            }
        }
    }
    return (
        <TouchableWithoutFeedback onPress={() => {
            Keyboard.dismiss();
            // console.log("dismiss keyboard");
        }}>
            <SafeAreaView style = {styles.overall}>
                <View style = {styles.container}>
                    <Text style = {styles.logo}>saveV</Text>
                    <Text style = {styles.title}>Login</Text>
                    <View style = {styles.content}>

                    <Text style = {styles.contentText}>Email</Text>
                    <TextInput 
                    style ={styles.input}
                    placeholder="Email"
                    placeholderTextColor="grey"
                    value={email}
                    onChangeText={setEmail}
                    inputMode="email"
                    autoCapitalize="none"/>
                  
                    <Text style = {styles.contentText}>Password</Text>
                    <TextInput 
                    style ={styles.input}
                    placeholder="Password"
                    placeholderTextColor="grey"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry/>

                  
                  
                    <Button
                    title="Login"
                    onPress={handleLogin}
                    color="#841584"/>
                    
                    
                    <Text style = {styles.navigateTitle}>No account?</Text>
                    <Text style = {styles.navigateRegister} onPress={() => navigation.push('Register')}>
                    Sign Up Now!
                    </Text>
                    
                    
                
                </View>
                
              </View>
            </SafeAreaView>

        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    overall: {
        flex: 1,
        backgroundColor: '#fff'
    },
    container:{
      flex: 1,
      marginHorizontal: 50,
      backgroundColor: "white",
      paddingTop: 20,
    },
    logo: {
        textAlign: 'center',
        color: 'black',
        fontSize: 20,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      color: 'black',
      fontSize: 20,
      fontWeight: 'bold',
    },
    content: {
      flex: 5,
    },
    input: {
      borderBottomWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderTopWidth: 1,
      height: 60,
      fontSize: 17,
      marginVertical: 20,
      fontWeight: "300",
    },
    contentText: {
      fontSize: 20
    },
    navigateTitle: {
        fontSize:17,
        textAlign: 'center',
    },
    navigateRegister: {
        fontSize:18,
        textAlign: 'center',
        color: 'blue'
    }
});