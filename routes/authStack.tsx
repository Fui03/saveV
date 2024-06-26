import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Register from "@/screens/authentication/Register";
import Login from "@/screens/authentication/Login";
import LoginPhoneNumber from "@/screens/authentication/LoginPhoneNumber";
import ForgetPassword from "@/screens/authentication/ForgetPassword";
import DrawerNavigation from "@/routes/DrawerNavigation";
import IncomeStatistic from "@/screens/statistic/IncomeStatistic";
import LoanStatistic from "@/screens/statistic/LoanStatistic";
import AddTransaction from "@/screens/transaction/AddTransaction";
import TransactionDetail from "@/screens/transaction/TransactionDetail";
import AddPost from "@/screens/posts/AddPost";
import PostDetails from "@/screens/posts/PostDetails";
import PaymentScreen from "@/screens/posts/PaymentScreen";
import PdfReceipt from "@/screens/posts/PdfReceipt";
import Search from "@/screens/posts/Search";

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
                    <Stack.Screen 
                        name="PostDetails" 
                        component={PostDetails}
                        options={{headerShown: true, title: "New Post", headerBackTitle:"Home"}}/>
                    <Stack.Screen 
                        name="PaymentScreen" 
                        component={PaymentScreen}
                        options={{headerShown: true, title: "Payment", headerBackTitle:"Home"}}/>
                    <Stack.Screen 
                        name="PdfReceipt" 
                        component={PdfReceipt}
                        options={{headerShown: false, title: "Payment", headerBackTitle:"Home"}}/>
                    <Stack.Screen 
                        name="Search" 
                        component={Search}
                        options={{headerShown: true, title: "Home", headerBackTitle: "Home"}}/>
                </Stack.Navigator>
            </NavigationContainer>
    );
}
