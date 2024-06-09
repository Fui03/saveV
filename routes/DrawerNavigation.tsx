import React from "react";
import { createDrawerNavigator } from '@react-navigation/drawer';

import Home from "@/screens/Home";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation} from "@react-navigation/native";

import TabNavigation from "./TabNavigation";
import CustomDrawerContent from "./customDrawer";
import ResetPassword from "@/screens/setting/ResetPassword";
import ResetEmail from "@/screens/setting/ResetEmail";
import UpdateProfile from "@/screens/setting/UpdateProfile";
import PreferenceManagement from "@/screens/setting/PreferenceManagement";



const Drawer = createDrawerNavigator();

export default function DrawerNavigation() {

    const navigation = useNavigation<NativeStackNavigationProp<any>>();
   

    return(
        <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent{...props}/>}>
            <Drawer.Screen
                    name = "TabNavigation"
                    component={TabNavigation}
                    options={{title:"Home"}}/>
            <Drawer.Screen
                name = "ResetPassword"
                component={ResetPassword}
                options={{title:"Reset Password"}}/>
            <Drawer.Screen
                name = "ResetEmail"
                component={ResetEmail}
                options={{title:"Reset Email"}}/>
            <Drawer.Screen
                name = "UpdateProfile"
                component={UpdateProfile}
                options={{title:"Update Profile"}}/>
            <Drawer.Screen
                name = "PreferenceManagement"
                component={PreferenceManagement}
                options={{title:"Preference Management"}}/>
        </Drawer.Navigator>
    );
}

