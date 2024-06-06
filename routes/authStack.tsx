import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
import AddPost from "@/screens/AddPost";

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
                        options={{headerShown: true, title: "Income", headerBackTitle:"Statistics"}}/>
                    <Stack.Screen
                        name = "LoanStatistic"
                        component={LoanStatistic}
                        options={{headerShown: true, title: "Loan", headerBackTitle:"Statistics"}}/>
                    <Stack.Screen 
                        name="AddTransaction" 
                        component={AddTransaction}
                        options={{headerShown: true, title: "Add transaction", headerBackTitle:"Expenses"}}/>
                    <Stack.Screen 
                        name="TransactionDetail" 
                        component={TransactionDetail}
                        options={{headerShown: true, title: "Expense Detail", headerBackTitle:"Expenses"}}/>
                    <Stack.Screen 
                        name="AddPost" 
                        component={AddPost}
                        options={{headerShown: true, title: "New Post", headerBackTitle:"Home"}}/>
                </Stack.Navigator>
            </NavigationContainer>
    );
}
