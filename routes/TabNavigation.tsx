import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Button, Pressable } from 'react-native';




import Home from "@/screens/Home";
import Transaction from "@/screens/transaction/Transaction";
import Statistic from "@/screens/statistic/Statistic";
import Profile from "@/screens/Profile";
import { getAuth, signOut } from "firebase/auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation} from "@react-navigation/native";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import AddPost from "@/screens/AddPost";




export default function TabNavigation() {
    const Tab = createBottomTabNavigator();
    
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [role, setRole] = useState<String>();


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

    return(
        <Tab.Navigator screenOptions={{headerShown: false}}>
            <Tab.Screen name = "Home" component={Home} />
            <Tab.Screen name = "Expenses" component={Transaction}/>
            {role == "Business" 
                ? <Tab.Screen name = "AddPost" component={AddPost}/>
                :<></>
            }
            <Tab.Screen name = "Statistic" component={Statistic}/>
            <Tab.Screen name = "Profile" component={Profile}/>
        </Tab.Navigator>
    );
}

