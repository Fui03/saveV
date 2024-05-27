import React, {useState} from 'react';
import { SafeAreaView, Text, StyleSheet , Button, View, ScrollView, TextInput, TouchableOpacity, Image} from 'react-native';
import { getAuth, signOut } from "firebase/auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation} from "@react-navigation/native";




const Statistic = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();


  return (
      <ScrollView contentContainerStyle={styles.overall}>
        <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('IncomeStatistic')}>
          <Text style = {styles.title}>Income</Text>

          <View style={styles.content}>
            <View style={styles.rowContent}>
                <Text style={styles.contentText}>Main</Text>
                <Text style={styles.contentText}>Side</Text>
                <Text style={styles.contentText}>Total</Text>
            </View>
          </View>
          
        </TouchableOpacity>

        <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('LoanStatistic')}>
          <Text style={styles.title}>Loan</Text>
          <View style={styles.content}>
            <Text style={styles.contentText}>Total Loan</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>

  );
};

const styles = StyleSheet.create({
  overall: {
      flex: 1,
      backgroundColor: '#f5f6fa',
      justifyContent: 'flex-start',
      alignItems: 'center', // Center everything horizontally
  },
  
  logo: {
      width: 400, // Adjust width as needed
      height: '30%', // Adjust height as needed
      marginBottom: 20,
  },
  container: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
      marginHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: {
          width: 0,
          height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      width: '80%', // Adjust width as needed
      alignItems: 'flex-start',
      // marginBottom:5,
      marginTop:20
  },
  title: {
      color: '#2c3e50',
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
  },
  content: {
      width: '100%',
      marginBottom: 20,
  },
  contentText: {
      fontSize: 18,
      color: '#34495e',
      marginBottom: 5,
      fontWeight:'bold'
  },
  rowContent: {
      flexDirection:"row",
      justifyContent:"space-around"
  },
  input: {
      borderWidth: 1,
      borderColor: '#dcdde1',
      padding: 10,
      borderRadius: 5,
      marginBottom: 15,
      backgroundColor: '#ecf0f1',
      fontSize: 16,
      color: '#2c3e50',
  },
  passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#dcdde1',
      borderRadius: 5,
      backgroundColor: '#ecf0f1',
      marginBottom: 15,
  },
  passwordInput: {
      flex: 1,
      padding: 10,
      fontSize: 16,
      color: '#2c3e50',
  },
  showPasswordButton: {
      padding: 10,
  },
  showPasswordText: {
      color: '#3498db',
      fontSize: 16,
  },
  loginButton: {
      backgroundColor: '#3498db',
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
      width: '100%',
  },
  loginButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
  },
  registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
  },
  navigateTitle: {
      fontSize: 14,
      color: '#7f8c8d',
  },
  navigateRegister: {
      fontSize: 14,
      color: '#3498db',
      marginLeft: 5,
      fontWeight: 'bold',
  },
  forgetPasswordContainer: {
      flexDirection:'row',
      justifyContent:'flex-end',
      alignItems:'flex-end',
      marginTop: 15,
  },
  forgetPasswordNavigation: {
      fontSize: 14,
      color: '#3498db',
  }
});

export default Statistic;
