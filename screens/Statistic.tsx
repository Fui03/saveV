import React, {useEffect, useState} from 'react';
import { SafeAreaView, Text, StyleSheet , Button, View, ScrollView, TextInput, TouchableOpacity, Image} from 'react-native';
import { getAuth, signOut } from "firebase/auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation} from "@react-navigation/native";
import { collection, collectionGroup, doc, getAggregateFromServer, getCountFromServer, getDoc, getFirestore, onSnapshot, query, sum, where } from 'firebase/firestore';
import PieChart from 'react-native-pie-chart';



const Statistic = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [mainIncome, setMainIncome] = useState<number>(0);
  const [sideIncome, setSideIncome] = useState<number>(0)
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalLoan, setTotalLoan] = useState<number>(0);
  const [totalTax, setTotalTax] = useState<number>(0);

  

  useEffect(() => {

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
        
        const db = getFirestore();
        const incomeRef = doc(db, "users", user.uid, "Income or Loan", "Income");
        const loanRef = doc(db, "users", user.uid, "Income or Loan", "Loan");
        const fetchUserIncome = onSnapshot(incomeRef, (snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.data();
                const mainIncome = userData.mainIncome || 0;
                const sideIncome = userData.sideIncomes;

                const totalSideIncome = sideIncome.reduce((acc: number, income: {name: string, amount: number}) => acc + income.amount, 0);

                setMainIncome(mainIncome);
                setSideIncome(totalSideIncome);

            } else {
                setMainIncome(0);
                setSideIncome(0);
            }
        })

        const fetchUserLoan = onSnapshot(loanRef, (snapshot) => {
            if(snapshot.exists()) {
                const userData = snapshot.data();
                const loan = userData.loan;

                const totalLoan = loan.reduce((acc: number, loan: {name: string, amount: number}) => acc + loan.amount, 0);
                setTotalLoan(totalLoan);  
            } else {
                setTotalLoan(0);
            }
        })

        return () => {
            fetchUserIncome();
            fetchUserLoan();
        }
    }
  }, [])

  useEffect(() => {
    setTotalIncome(mainIncome + sideIncome);
    setTotalTax(mainIncome *searchPercentageOfTax(mainIncome));
  }, [mainIncome, sideIncome]);


  
    // const widthAndHeight = 250
    // const series = [0.2,0.1,0.1,0.1,0.4]
    // const sliceColor = ['#fbd203', '#ffb300', '#ff9100', '#ff6c00', '#ff3c00']

    // const tax = () => {
    //     const annualIncome = mainIncome * 12;
    //     if (annualIncome <)
    // }

    const searchPercentageOfTax = (income:number) => {
        const annualIncome = income * 12;
        const taxRange = [
            {amount: 20000, tax: 0},
            {amount: 30000, tax: 0.02},
            {amount: 40000, tax: 0.035},
            {amount: 80000, tax: 0.07},
            {amount: 120000, tax: 0.115},
            {amount: 160000, tax: 0.15},
            {amount: 200000, tax: 0.18},
            {amount: 240000, tax: 0.19},
            {amount: 280000, tax: 0.195},
            {amount: 320000, tax: 0.2},
            {amount: 500000, tax: 0.22},
            {amount: 1000000, tax: 0.23},
            {amount: Number.POSITIVE_INFINITY, tax: 0.24},
        ]
        
        var begin = 0;
        var end = taxRange.length;
        
        while (begin < end) {
            const mid = Math.floor((begin + end) / 2);
            if (annualIncome <= taxRange[mid].amount) {
                end = mid;
            } else {
                begin = mid + 1;
            }
        }
        
        return taxRange[begin].tax;
    }
    
    const percentageOfTax = totalTax / totalIncome * 100;
    const percentageOfSideIncome = sideIncome / totalIncome * 100;
    const percentageOfLoan = totalLoan / totalIncome * 100;
    const percentageOfCPF = mainIncome * 0.2 / totalIncome * 100;
    const percentageOfRemaining = 100 - percentageOfCPF -percentageOfTax - percentageOfSideIncome - percentageOfLoan;

    const series = [percentageOfCPF, percentageOfLoan, percentageOfRemaining, percentageOfSideIncome, percentageOfTax];
    const sliceColor = ['red', 'blue', 'green', 'yellow', 'black'];

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
            <View style={styles.rowContent}>
                <Text style={styles.contentText}>${mainIncome}</Text>
                <Text style={styles.contentText}>${sideIncome}</Text>
                <Text style={styles.contentText}>${totalIncome}</Text>
            </View>
            
          </View>
          
        </TouchableOpacity>

        <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('LoanStatistic')}>
          <Text style={styles.title}>Loan</Text>
          <View style={styles.content}>
            <Text style={styles.contentText}>Total Loan</Text>
            <Text style={styles.contentText}>${totalLoan}</Text>
          </View>
        </TouchableOpacity>


        <PieChart
            widthAndHeight={250}
            series={series}
            sliceColor={sliceColor}
            coverRadius={0.45}
            coverFill={'#FFF'}
        />

        <View style={styles.container}>
          <Text style={styles.contentText}>Total Tax:{totalTax}</Text>
          <Text style={styles.contentText}>Total CPF:{mainIncome * 0.2}</Text>
          <Text style={styles.contentText}>Remaining Spending Power:{Math.floor(percentageOfRemaining * totalIncome)}</Text>

        </View>


      </ScrollView>

  );
};

const styles = StyleSheet.create({
  overall: {
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
