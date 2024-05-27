import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TransactionProvider } from "@/screens/transaction/TransactionContext";
import Register from "@/screens/Register";
import Home from "@/screens/Home";
import Login from "@/screens/Login";
import TabNavigation from "@/routes/TabNavigation";
import AddTransaction from "@/screens/transaction/AddTransaction";
import Transaction from "@/screens/transaction/Transaction";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
    return (
        <TransactionProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="Register" component={Register} />
                    <Stack.Screen name="TabNavigation" component={TabNavigation} />
                    <Stack.Screen name="AddTransaction" component={AddTransaction} />
                    <Stack.Screen name="Transaction" component={Transaction} />
                </Stack.Navigator>
            </NavigationContainer>
        </TransactionProvider>
    );
}
