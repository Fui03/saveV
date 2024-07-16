import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Button, Pressable, Alert } from 'react-native';

import Home from "@/screens/posts/Home";
import Transaction from "@/screens/transaction/Transaction";
import Statistic from "@/screens/statistic/Statistic";
import Profile from "@/screens/profile/Profile";
import { getAuth, signOut } from "firebase/auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import AddPostNavigator from "@/screens/posts/AddPostNavigator";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import CustomHeader from "./CustomHeader";

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
            const fetchUserData = onSnapshot(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.data();
                    const userRole = userData.role || 'normal';

                    setRole(userRole);
                } else {
                    setRole('normal');
                }
            });
        
        }
        
        
    }, []);

    const navigateToAddPost = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert('Permission required', 'Permission to access camera roll is required!');
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 10,
            aspect: [3, 4],
            quality: 1,
        });

        if (!pickerResult.canceled) {
            const uris = pickerResult.assets.map((asset) => asset.uri);
            navigation.navigate("AddPost", { images: uris });
        }
    };

    return (
        <Tab.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
                if (route.name == "Home") {
                    return (<Feather name="home" size={24} color="black" />);
                } else if(route.name == "Expenses") {
                    return (<FontAwesome name="money" size={24} color="black" />)
                } else if (route.name == 'AddPost') {
                    return (<FontAwesome6 name="add" size={24} color="black" />)
                } else if (route.name == 'Statistic') {
                    return (<Feather name="pie-chart" size={24} color="black" />)
                } else {
                    return (<MaterialIcons name="account-circle" size={24} color="black" />)
                }
                
            },
            headerShown:false
          })}
        >
            <Tab.Screen name="Home" component={Home} />
            <Tab.Screen name="Expenses" component={Transaction} />
            {role == "Business"
                ? <Tab.Screen name="AddPost" component={AddPostNavigator}
                    listeners={{
                        tabPress: e => {
                            e.preventDefault();
                            navigateToAddPost();
                        }
                    }}
                />
                : <></>
            }
            <Tab.Screen name="Statistic" component={Statistic} />
            <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
    );
}
