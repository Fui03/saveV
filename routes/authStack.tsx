import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Register from "@/screens/Register";
import Home from "@/screens/Home";
import Login from "@/screens/Login";
import TabNavigation from "@/routes/TabNavigation";
import LoginPhoneNumber from "@/screens/LoginPhoneNumber";
import ForgetPassword from "@/screens/ForgetPassword";
import DrawerNavigation from "@/routes/DrawerNavigation";
import IncomeStatistic from "@/screens/IncomeStatistic";
import LoanStatistic from "@/screens/LoanStatistic";

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
                    name = "DrawerNavigation"
                    component={DrawerNavigation}/>

                <Stack.Screen
                    name = "LoginPhoneNumber"
                    component={LoginPhoneNumber}/>
                <Stack.Screen
                    name = "ForgetPassword"
                    component={ForgetPassword}/>
                <Stack.Screen
                    name = "IncomeStatistic"
                    component={IncomeStatistic}
                    options={{headerShown: true, title: "Income"}}/>
                <Stack.Screen
                    name = "LoanStatistic"
                    component={LoanStatistic}
                    options={{headerShown: true, title: "Loan"}}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
}