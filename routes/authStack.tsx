import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TransactionProvider } from "@/screens/transaction/TransactionContext";
import Register from "@/screens/Register";
import Home from "@/screens/Home";
import Login from "@/screens/Login";
import TabNavigation from "@/routes/TabNavigation";
import LoginPhoneNumber from "@/screens/LoginPhoneNumber";
import ForgetPassword from "@/screens/ForgetPassword";
import DrawerNavigation from "@/routes/DrawerNavigation";
import IncomeStatistic from "@/screens/IncomeStatistic";
import LoanStatistic from "@/screens/LoanStatistic";
import AddTransaction from "@/screens/transaction/AddTransaction";
import Transaction from "@/screens/transaction/Transaction";

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

// const Stack = createNativeStackNavigator();

//     return(
//         <NavigationContainer>
//             <Stack.Navigator initialRouteName="Login" screenOptions={{headerShown: false}}>
//                 <Stack.Screen
//                     name = "Login"
//                     component={Login}/>
//                 <Stack.Screen
//                     name = "Register"
//                     component={Register}/>
//                 <Stack.Screen
//                     name = "DrawerNavigation"
//                     component={DrawerNavigation}/>

//                 <Stack.Screen
//                     name = "LoginPhoneNumber"
//                     component={LoginPhoneNumber}/>
//                 <Stack.Screen
//                     name = "ForgetPassword"
//                     component={ForgetPassword}/>
//                 <Stack.Screen
//                     name = "IncomeStatistic"
//                     component={IncomeStatistic}
//                     options={{headerShown: true, title: "Income"}}/>
//                 <Stack.Screen
//                     name = "LoanStatistic"
//                     component={LoanStatistic}
//                     options={{headerShown: true, title: "Loan"}}/>
//             </Stack.Navigator>
//         </NavigationContainer>
// export default function AuthStack() {
//     return (
//         <TransactionProvider>
//             <NavigationContainer>
//                 <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
//                     <Stack.Screen name="Login" component={Login} />
//                     <Stack.Screen name="Register" component={Register} />
//                     <Stack.Screen name="TabNavigation" component={TabNavigation} />
//                     <Stack.Screen name="AddTransaction" component={AddTransaction} />
//                     <Stack.Screen name="Transaction" component={Transaction} />
//                 </Stack.Navigator>
//             </NavigationContainer>
//         </TransactionProvider>
//     );
// }
