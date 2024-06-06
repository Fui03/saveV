import React, { useState, useRef, useEffect } from "react";
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
  KeyboardAvoidingView,
  Modal,
  Image
} from "react-native";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, CommonActions } from "@react-navigation/native";

import {
  createUserWithEmailAndPassword,
  UserCredential,
  getAuth,
  updateProfile,
  sendEmailVerification,
  linkWithPhoneNumber,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ApplicationVerifier,
} from "firebase/auth";
import firebase from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import app from "../../firebaseConfig";

import PhoneInput from "react-native-phone-input";
import CountryPicker from "react-native-country-picker-modal";
import { collection, doc, getFirestore, setDoc } from "firebase/firestore";

// import db from "@react-native-firebase/database";

export default function Register() {
  const [userName, setUserName] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
  const [password, setPassword] = useState<string | undefined>();
  const [confirmPassword, setConfirmedPassword] = useState<
    string | undefined
  >();
  const [modalVisibility, setModalVisibility] = useState<boolean>(false);
  const [Recaptcha, setRecaptcha] = useState<ApplicationVerifier>();

  // const selectCountry

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const samePassword = (
    password: string | undefined,
    confirmPassword: string | undefined
  ) => {
    if (password && confirmPassword && password === confirmPassword) {
      return true;
    } else {
      return false;
    }
  };

  const handleSignUp = async () => {
    if (email && password && confirmPassword) {
      try {
        if (!samePassword(password, confirmPassword)) {
          Alert.alert("Error", "Password and Confirm Password do not match!");
          return;
        }

        if (userName == undefined) {
          Alert.alert("Error", "User Name cannot be empty!");
          return;
        }

        if (phoneNumber == undefined) {
          Alert.alert("Error", "Phone Number cannot be empty!");
          return;
        }

        const auth = getAuth(app);

        const response = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // console.log()
        // const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        //   'size': 'invisible',
        //   'callback': () => {}
        // })

        if (response.user) {
          await sendEmailVerification(response.user).then(() => {
            setModalVisibility(true);
            Alert.alert(
              "Waiting for email verification",
              "Please verify your email!"
            );
          });
          await createUser(response);
          await updateProfile(response.user, { displayName: userName });
          // linkWithPhoneNumber(response.user, phoneNumber, recaptchaVerifier);
          // linkWithPhoneNumber()
        }
      } catch (e) {
        let err = "Try Again";
        if (e instanceof Error && e.message) {
          switch (e.message) {
            case "Firebase: Error (auth/email-already-in-use).":
              err = "Email address is already in use!";
              break;
            case "Firebase: Error (auth/invalid-email).":
              err = "Invalid email address!";
              break;
            case "[auth/operation-not-allowed] This operation is not allowed. This may be because the given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.":
              err = "Email/Password account are not enabled!";
              break;
            case "Firebase: Password should be at least 6 characters (auth/weak-password).":
              err = "Password should be at least 6 characters!";
              break;
            default:
              err = e.message;
              break;
          }
        }
        Alert.alert("Error", err);
      }
    }
  };

  const createUser = async (response: UserCredential) => {
    // const database = getDatabase();
    // set(ref(database, `users/${response.user.uid}`), {userName, phoneNumber});
    const db = getFirestore();
    const documents = doc(db, `users`, response.user.uid);
    await setDoc(documents, {
      userName,
      phoneNumber,
      role : 'normal'
    });
  };

  const resendVerificationEmail = () => {
    const auth = getAuth(app);
    const user = auth.currentUser;
    if (user) {
      sendEmailVerification(user)
        .then(() =>
          Alert.alert("Verification Email Resent", "Please check your email")
        )
        .catch((e) => {
          Alert.alert("Error sending email", "Please try again later");
        });
    }
  };

  const handleCheckEmailVerification = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      user.reload().then(() => {
        if (user.emailVerified) {
          Alert.alert("Email verified!", "You may proceed!");
          setModalVisibility(false);
          navigation.reset({
            index: 0,
            routes: [{ name: "DrawerNavigation" }],
          });
        }
      });
    }
  };

  useEffect(() => {
    if (modalVisibility) {
      const interval = setInterval(() => {
        handleCheckEmailVerification();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [modalVisibility]);

  // useEffect(() => {
  //   const auth = getAuth(app);
  //   const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
  //     "size": "invisible",
  //     "callback":() => {}
  //   });

  //   setRecaptcha(recaptchaVerifier);

  //   return () => {
  //     recaptchaVerifier.clear();
  //   }
  // },[Recaptcha])

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <SafeAreaView style={styles.overall}>
        
        <View id="recaptcha-container"></View>
        <KeyboardAvoidingView behavior="padding" />
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
                <Button title="Resend Verification Email" onPress={resendVerificationEmail} testID="Resend"/>
              </View>
            </View>
          </Modal>
          <Image source={require('@/assets/images/logo1.png')} style={styles.logo_image} />
          <Text style={styles.title}>Register</Text>
          <View style={styles.content}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#aaa"
              value={userName}
              onChangeText={setUserName}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
              inputMode="email"
              autoCapitalize="none"
            />

            <PhoneInput
              initialValue={phoneNumber}
              initialCountry="sg"
              onChangePhoneNumber={(number) => setPhoneNumber(number)}
              style={styles.phoneInput}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#aaa"
              value={confirmPassword}
              onChangeText={setConfirmedPassword}
              secureTextEntry
            />

            <Button
              title="Sign Up"
              testID="signup"
              onPress={handleSignUp}
              color="#3897f0"
            />

            <Text style={styles.navigateTitle}>Already Have an account?</Text>
            <Text
              style={styles.navigateRegister}
              onPress={() => navigation.navigate("Login")}
            >
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
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  logo_image: {
    width: 370, // Adjust width as needed
    height: 200, // Adjust height as needed
    marginBottom: 20,
    alignItems: "center",
  },
  container: {
    flex: 1,
    marginHorizontal: 40,
    backgroundColor: "white",
    paddingTop: 20,
  },
  title: {
    textAlign: 'center',
    color: '#262626',
    fontSize: 30,
    fontWeight: 'bold',
    height: '5%'
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    height: 50,
    fontSize: 16,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: "#fafafa",
  },
  phoneInput: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: "#fafafa",
  },
  navigateTitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#888",
  },
  navigateRegister: {
    fontSize: 15,
    textAlign: "center",
    color: "#3897f0",
    fontWeight: "bold",
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    color: "#333",
  },
});
