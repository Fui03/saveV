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
import ChatList from "@/screens/chat/ChatList";
import UserProfile from "@/screens/profile/UserProfile";
import Chat from "@/screens/chat/Chat";
import OnBoarding from "@/screens/authentication/onBoarding";
import UpdateProfile from "@/screens/setting/UpdateProfile";

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
                        component={ForgetPassword}
                        options={{headerShown: true, title: "Forget Password", headerBackTitle:"Login"}}/>
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
                        options={{headerShown: true, title: "Add Expense", headerBackTitle:"Expenses"}}/>
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
                    <Stack.Screen 
                        name="ChatList" 
                        component={ChatList}
                        options={{headerShown: true, title: "Chat", headerBackTitle: "Home"}}/>
                    <Stack.Screen 
                        name="UserProfile" 
                        component={UserProfile}
                        options={{headerShown: true, title: "Profile", headerBackTitle: "Home"}}/>
                    <Stack.Screen 
                        name="Chat" 
                        component={Chat}
                        options={{headerShown: false, title: "Profile", headerBackTitle: "Home"}}/>
                    <Stack.Screen 
                        name="OnBoarding" 
                        component={OnBoarding}
                        options={{headerShown: false, title: "Profile", headerBackTitle: "Home"}}/>
                    <Stack.Screen
                        name = "UpdateProfile"
                        component={UpdateProfile}
                        options={{headerShown: true, title: "Update Profile", headerBackTitle: "Home"}}
                        />
                </Stack.Navigator>
            </NavigationContainer>
    );
}
