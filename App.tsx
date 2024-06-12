import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import Navigator from './routes/authStack';
import tabNavigation from "./routes/TabNavigation";
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Navigator/>
    </GestureHandlerRootView>
  );
};



export default App;
