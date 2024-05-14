import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Register from "@/screens/Register";
import Home from "@/screens/Home";
import Login from "@/screens/Login";

export default function authStack() {
    const Stack = createNativeStackNavigator();

    return(
        <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShown: false}}>
                <Stack.Screen
                    name = "Login"
                    component={Login}/>
                <Stack.Screen
                    name = "Register"
                    component={Register}/>
                <Stack.Screen
                    name = "Home"
                    component={Home}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}