import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import Navigator from './routes/authStack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StripeProvider } from '@stripe/stripe-react-native';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getFirestore, collection, getDocs, onSnapshot, getDoc } from 'firebase/firestore';
import app from './firebaseConfig';


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
      // console.log(token);

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
        <Navigator/>
      </GestureHandlerRootView>
    </StripeProvider>

  );
};



export default App;
