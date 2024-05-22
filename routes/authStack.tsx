import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Register from "@/screens/Register";
import Home from "@/screens/Home";
import Login from "@/screens/Login";
import TabNavigation from "@/routes/TabNavigation";

export default function authStack() {
    const Stack = createNativeStackNavigator();

    return(
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login" screenOptions={{headerShown: false}}>
                <Stack.Screen
                    name = "Login"
                    component={Login}/>
                <Stack.Screen
                    name = "Register"
                    component={Register}/>
                <Stack.Screen
                    name = "TabNavigation"
                    component={TabNavigation}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}