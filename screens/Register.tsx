import React, {useState, useRef} from "react";
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
    KeyboardAvoidingView
} from 'react-native'


import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, CommonActions } from "@react-navigation/native";

import {createUserWithEmailAndPassword, UserCredential, getAuth, updateProfile} from "firebase/auth";
import firebase from "firebase/app"
import {getDatabase, ref, set} from "firebase/database";
import app from '../firebaseConfig';

import PhoneInput from 'react-native-phone-input'; 
import CountryPicker from 'react-native-country-picker-modal'; 

// import db from "@react-native-firebase/database";



export default function Register() {
    const [userName, setUserName] = useState<string | undefined>();
    const [email, setEmail] = useState<string | undefined>();
    const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
    const [password, setPassword] = useState<string | undefined>();
    const [confirmPassword, setConfirmedPassword] = useState<string | undefined>();

    // const [phoneNumber, setPhoneNumber] = useState(''); 

    
    // const selectCountry

    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const samePassword = (password: string | undefined, confirmPassword: string | undefined) => {
      if (password && confirmPassword && password === confirmPassword) {
        return true;
      } else {
        return false;
      }
    }

    

    const handleSignUp = async () => {
        if (email && password && confirmPassword) {
            try {
              
              if (!samePassword(password, confirmPassword)) {
                Alert.alert("Error", "Password and Confirm Password do not match!");
                return;
              }
              
              if(userName == undefined) {
                Alert.alert("Error", "User Name cannot be empty!");
                return;
              }

              if(phoneNumber == undefined) {
                Alert.alert("Error", "Phone Number cannot be empty!");
                return;
              }

              const auth = getAuth(app);

              const response = await createUserWithEmailAndPassword(
                  auth,  
                  email,
                  password
              );

              if (response.user) {
                await createUser(response);
                await updateProfile(response.user, {displayName: userName});
                navigation.reset({
                  index: 0,
                  routes: [{name: 'TabNavigation'}],
                })
              }
            } catch (e) {
                let err = "Try Again";
                if (e instanceof Error && e.message ) {
                  switch (e.message) {
                    case 'Firebase: Error (auth/email-already-in-use).':
                      err = 'Email address is already in use!'
                      break;
                    case 'Firebase: Error (auth/invalid-email).':
                      err = 'Invalid email address!'
                      break;
                    case '[auth/operation-not-allowed] This operation is not allowed. This may be because the given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.':
                      err = 'Email/Password account are not enabled!'
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

    
    const createUser = async (response: UserCredential) => {
      console.log(1)
      const database = getDatabase();
      set(ref(database, `users/${response.user.uid}`), {phoneNumber, email, userName});
      // (`/users/${response.user.uid}`).set({ userName });
    }
 
    return (
        <TouchableWithoutFeedback onPress={() => {
            Keyboard.dismiss();
            // console.log("dismiss keyboard");
        }}>

            <SafeAreaView style = {styles.overall}>
              <KeyboardAvoidingView behavior="padding"/>
              <View style = {styles.container}>
                
                <Text style = {styles.logo}>saveV</Text>
                <Text style = {styles.title}>Register</Text>
                <View style = {styles.content}>
                  <Text style = {styles.contentText}>User Name</Text>
                  <TextInput 
                  style ={styles.input}
                  placeholder="UserName"
                  placeholderTextColor="grey"
                  value={userName}
                  onChangeText={setUserName}/>

                  <Text style = {styles.contentText}>Email</Text>
                  <TextInput 
                  style ={styles.input}
                  placeholder="Email"
                  placeholderTextColor="grey"
                  value={email}
                  onChangeText={setEmail}
                  inputMode="email"
                  autoCapitalize="none"/>
                  
                  <Text style = {styles.contentText}>PhoneNumber</Text>
                  <PhoneInput 
                  initialValue={phoneNumber}
                  initialCountry="sg"
                  onChangePhoneNumber={(number) => setPhoneNumber(number)}
                  style = {styles.input}/>

                  <Text style = {styles.contentText}>Password</Text>
                  <TextInput 
                  style ={styles.input}
                  placeholder="Password"
                  placeholderTextColor="grey"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry/>

                  <Text style = {styles.contentText}>Confirm Password</Text>
                  <TextInput 
                  style ={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="grey"
                  value={confirmPassword}
                  onChangeText={setConfirmedPassword}
                  secureTextEntry/>
                  
                  <Button
                    title="Sign Up"
                    onPress={handleSignUp}
                    color="#841584"/>

                  <Text style = {styles.navigateTitle}>Already Have an acoount?</Text>
                  <Text style = {styles.navigateRegister} onPress={() => navigation.navigate('Login')}>
                  Login Now!
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
      flex: 10,
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
      flex: 20,
    },
    input: {
      borderBottomWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderTopWidth: 1,
      height: 50,
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
    },
    phoneInput: { 
      height: 50, 
      width: '100%', 
      borderWidth: 1, 
      borderColor: '#ccc', 
      marginBottom: 20, 
      paddingHorizontal: 10, 
  },
});