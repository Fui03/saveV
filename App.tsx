import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import Navigator from './routes/authStack';
import tabNavigation from "./routes/TabNavigation";
import { NavigationContainer } from '@react-navigation/native';


const App = () => {
  return (
      <Navigator/>
  );
};



export default App;
