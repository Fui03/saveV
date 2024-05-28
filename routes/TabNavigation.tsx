import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Button, Pressable } from 'react-native';




import Home from "@/screens/Home";
import Transaction from "@/screens/Transaction";
import Statistic from "@/screens/Statistic";
import Profile from "@/screens/Profile";
import { getAuth, signOut } from "firebase/auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation} from "@react-navigation/native";




export default function TabNavigation() {
    const Tab = createBottomTabNavigator();
    
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const HandleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            navigation.replace('Login');
        }).catch((error) => {
    
        });
    }

   

    return(
        <Tab.Navigator screenOptions={{headerShown: false}}>
            <Tab.Screen name = "Home" component={Home} />
            <Tab.Screen name = "Transaction" component={Transaction}/>
            <Tab.Screen name = "Statistic" component={Statistic}/>
            <Tab.Screen name = "Profile" component={Profile}/>
        </Tab.Navigator>
    );
}

