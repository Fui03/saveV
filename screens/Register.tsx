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

import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import db from "@react-native-firebase/database";



export default function Register() {
    const [userName, setUserName] = useState<string | undefined>();
    const [email, setEmail] = useState<string | undefined>();
    const [password, setPassword] = useState<string | undefined>();
    const [confirmPassword, setConfirmedPassword] = useState<string | undefined>();

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

              const response = await auth().createUserWithEmailAndPassword(
                  email,
                  password
              );

              if (response.user) {
                  await createUser(response);
                  // navigation.dispatch(
                  //   CommonActions.reset({
                  //       index: 0,
                  //       routes: [{ name: 'Home' }],
                  //   })
                  // );
                  navigation.reset({
                    index: 0,
                    routes: [{name: 'Home'}],
                  })
              }
            } catch (e) {
                let err = "Try Again";
                if (e instanceof Error && e.message ) {
                  console.log(e.message)
                  switch (e.message) {
                    case '[auth/email-already-in-use] The email address is already in use by another account.':
                      err = 'Email address is already in use!'
                      break;
                    case '[auth/invalid-email] The email address is badly formatted.':
                      err = 'Invalid email address!'
                      break;
                    case '[auth/operation-not-allowed] This operation is not allowed. This may be because the given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.':
                      err = 'Email/Password account are not enabled!'
                      break;
                    case '[auth/weak-password] The given password is invalid. [ Password should be at least 6 characters ]':
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

    const createUser = async (response: FirebaseAuthTypes.UserCredential) => {
        db().ref(`/users/${response.user.uid}`).set({ userName });
    }
 
    return (
        <TouchableWithoutFeedback onPress={() => {
            Keyboard.dismiss();
            // console.log("dismiss keyboard");
        }}>
            <SafeAreaView style = {styles.overall}>
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
      flex: 9,
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
    }
});