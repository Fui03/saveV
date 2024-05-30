import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TransactionProvider } from "@/screens/transaction/TransactionContext";
import Register from "@/screens/authentication/Register";
import Home from "@/screens/Home";
import Login from "@/screens/authentication/Login";
import TabNavigation from "@/routes/TabNavigation";
import LoginPhoneNumber from "@/screens/authentication/LoginPhoneNumber";
import ForgetPassword from "@/screens/authentication/ForgetPassword";
import DrawerNavigation from "@/routes/DrawerNavigation";
import IncomeStatistic from "@/screens/statistic/IncomeStatistic";
import LoanStatistic from "@/screens/statistic/LoanStatistic";
import AddTransaction from "@/screens/transaction/AddTransaction";
import Transaction from "@/screens/transaction/Transaction";
import TransactionDetail from "@/screens/transaction/TransactionDetail";

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
                    <Stack.Screen 
                        name="AddTransaction" 
                        component={AddTransaction}
                        options={{headerShown: true, title: "Add transaction"}}/>
                    <Stack.Screen 
                        name="TransactionDetail" 
                        component={TransactionDetail}
                        options={{headerShown: true, title: "Transaction Detail"}}/>
                </Stack.Navigator>
            </NavigationContainer>
    );
}
