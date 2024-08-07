import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import Navigator from './routes/authStack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StripeProvider } from '@stripe/stripe-react-native';
import { ActivityIndicator, View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';
import app from './firebaseConfig';
import {OnboardFlow} from 'react-native-onboard';

const auth = getAuth(app);
const db = getFirestore(app);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const App = () => {

  useEffect(() => {
    const handleUserSignIn = async (user: User) => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;

      if (user) {
        await setDoc(doc(db, 'users', user.uid), { expoPushToken: token }, { merge: true });
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        handleUserSignIn(user);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);


  return (
    <StripeProvider publishableKey="pk_test_51PSCEFJibWimjq7AqVa6XGIaZ7TQYtUH2HhPBm267Kl0VYABHZ2SqzsPxJFPVsURdYewQXvOTB52bzYdqMGKVqaP00KLq93nh1">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Navigator />
      </GestureHandlerRootView>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
  },
});

export default App;
