import React from 'react';
import { View, Button } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { getAuth, signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

function CustomDrawerContent(props: DrawerContentComponentProps) {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const HandleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            navigation.replace('Login');
        }).catch((error) => {
            // Handle error
        });
    };

    return (
        <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
            <View style={{ padding: 20 }}>
                <Button title="Sign Out" onPress={HandleSignOut} />
            </View>
        </DrawerContentScrollView>
    );
}

export default CustomDrawerContent;
