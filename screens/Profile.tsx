import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet , Button, Alert} from 'react-native';
import { getAuth, signOut } from "firebase/auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation} from "@react-navigation/native";
import { doc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore';





const Profile = () => {

  const [role, setRole] = useState<String>();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      const fetchUserData =  onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()){
          const userData = snapshot.data();
          const userRole = userData.role || 'normal';

          setRole(userRole);
        } else {
          setRole('normal')
        }
      })
    }
  }, [])

  const handleUpgrade = async () => {
    const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            // const db = getDatabase();
            // const userRef = ref(db, `users/${user.uid}/Income`);

            const db = getFirestore();
            const userRef = doc(db, "users", user.uid);

            try {

                await setDoc(userRef, {
                    role: "Business"
                },{merge:true})
                                
                Alert.alert("Success", "Update Successful")
            } catch (e) {
                Alert.alert("Error", "Try Again")
            }
        }
  }

  return (
    <SafeAreaView style={styles.container}>

      <Text>Profile</Text>
      {role == 'normal' ?
        <Button title="Upgrade to Business Account!" onPress={handleUpgrade}/>  
        : <Text></Text>
      }
      <Button title='Payment' onPress={()=> navigation.navigate(`PaymentScreen`)}/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Profile;
