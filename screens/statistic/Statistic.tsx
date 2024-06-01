import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  Button,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { getAuth, signOut } from "firebase/auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  collectionGroup,
  doc,
  getAggregateFromServer,
  getCountFromServer,
  getDoc,
  getFirestore,
  onSnapshot,
  query,
  sum,
  where,
} from "firebase/firestore";
//import PieChart from 'react-native-pie-chart';
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

const Statistic = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [mainIncome, setMainIncome] = useState<number>(0);
  const [sideIncome, setSideIncome] = useState<number>(0);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalLoan, setTotalLoan] = useState<number>(0);
  const [totalTax, setTotalTax] = useState<number>(0);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getFirestore();
      const incomeRef = doc(db, "users", user.uid);
      const loanRef = doc(db, "users", user.uid);

      const fetchUserIncome = onSnapshot(incomeRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          const mainIncome = userData.mainIncome || 0;
          const sideIncome = userData.sideIncomes || [];

          const totalSideIncome = sideIncome.reduce(
            (acc: number, income: { name: string; amount: number }) =>
              acc + income.amount,
            0
          );

          setMainIncome(mainIncome);
          setSideIncome(totalSideIncome);
        } else {
          setMainIncome(0);
          setSideIncome(0);
        }
      });

      const fetchUserLoan = onSnapshot(loanRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.data();
          const loan = userData.loan || [];

          const totalLoan = loan.reduce(
            (acc: number, loan: { name: string; amount: number }) =>
              acc + loan.amount,
            0
          );
          setTotalLoan(totalLoan);
        } else {
          setTotalLoan(0);
        }
      });
      
      // console.log(totalIncome);
      return () => {
        fetchUserIncome();
        fetchUserLoan();
      };
    }
  }, []);

  useEffect(() => {
    // console.log(`mainIncome: ${mainIncome}, sideIncome: ${sideIncome}`);
    // console.log(if(mainIncome))
    if (mainIncome !== undefined || sideIncome !== undefined) {
      const computedTotalIncome = mainIncome + sideIncome;
      setTotalIncome(computedTotalIncome);
      setTotalTax(mainIncome * searchPercentageOfTax(mainIncome));
    }
  }, [mainIncome, sideIncome]);

  const searchPercentageOfTax = (income: number) => {
    const annualIncome = income * 12;
    const taxRange = [
      { amount: 20000, tax: 0 },
      { amount: 30000, tax: 0.02 },
      { amount: 40000, tax: 0.035 },
      { amount: 80000, tax: 0.07 },
      { amount: 120000, tax: 0.115 },
      { amount: 160000, tax: 0.15 },
      { amount: 200000, tax: 0.18 },
      { amount: 240000, tax: 0.19 },
      { amount: 280000, tax: 0.195 },
      { amount: 320000, tax: 0.2 },
      { amount: 500000, tax: 0.22 },
      { amount: 1000000, tax: 0.23 },
      { amount: Number.POSITIVE_INFINITY, tax: 0.24 },
    ];

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
  };
  
  const totalCPF = mainIncome * 0.2;

  if (totalIncome > 0 && totalIncome > totalLoan && (totalIncome - totalCPF - totalTax) >= totalLoan) {
    
    const percentageOfTax = (totalTax / totalIncome) * 100;
    const percentageOfSideIncome = (sideIncome / totalIncome) * 100;
    const percentageOfLoan = (totalLoan / totalIncome) * 100;
    const percentageOfCPF = ((mainIncome * 0.2) / totalIncome) * 100;
    const percentageOfRemaining =
      100 - percentageOfCPF - percentageOfTax - percentageOfLoan;
    //const series = [percentageOfCPF, percentageOfLoan, percentageOfRemaining, percentageOfSideIncome, percentageOfTax];
    //const sliceColor = ['#d4f0f0', '#8fcaca', '#cce2cb', '#b6cfb6', '#97c1a9'];

    const data = [
      {
        name: `CPF`,
        population: parseFloat(percentageOfCPF.toFixed(2)),
        color: "#d4f0f0",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: `Loan`,
        population: parseFloat(percentageOfLoan.toFixed(2)),
        color: "#8fcaca",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: `Spend Power`,
        population: parseFloat(percentageOfRemaining.toFixed(2)),
        color: "#cce2cb",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: `Tax`,
        population: parseFloat(percentageOfTax.toFixed(2)),
        color: "#97c1a9",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
    ];

    return (
      <ScrollView contentContainerStyle={styles.overall}>
        <Text style={styles.pieChartTitle}>Statistics Record</Text>
        <TouchableOpacity
          style={styles.container}
          onPress={() => navigation.navigate("IncomeStatistic")}
        >
          <Text style={styles.title}>Income</Text>
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

        <TouchableOpacity
          style={styles.container}
          onPress={() => navigation.navigate("LoanStatistic")}
        >
          <Text style={styles.title}>Loan</Text>
          <View style={styles.content}>
            <Text style={styles.contentText}>Total Loan</Text>
            <Text style={styles.contentText}>${totalLoan}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.container}>
          <Text style={styles.summaryText}>
            Total Tax: ${totalTax.toFixed(2)}
          </Text>
          <Text style={styles.summaryText}>
            Total CPF: ${(mainIncome * 0.2).toFixed(2)}
          </Text>
          <Text style={styles.summaryText}>
            Remaining Spending Power: $
            {Math.floor((percentageOfRemaining * totalIncome) / 100)}
          </Text>
        </View>

        <Text style={styles.pieChartTitle}>Analysis Pie Chart</Text>

        <PieChart
          data={data}
          width={screenWidth * 0.9}
          height={220}
          chartConfig={{
            backgroundColor: "#1cc910",
            backgroundGradientFrom: "#eff3ff",
            backgroundGradientTo: "#efefef",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 20,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          hasLegend={true}
        />
      </ScrollView>
    );
  } else {
    return (
        
        <ScrollView contentContainerStyle={styles.overall}>
            <Text style={styles.pieChartTitle}>Statistics Record</Text>
            <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('IncomeStatistic')}>
                <Text style={styles.title}>Income</Text>
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

            <View style={styles.container}>
                <Text style={styles.summaryText}>Total Tax: ${totalTax.toFixed(2)}</Text>
                <Text style={styles.summaryText}>Total CPF: ${(mainIncome * 0.2).toFixed(2)}</Text>
                <Text style={styles.summaryText}>Remaining Spending Power: 0</Text>
            </View>

            <Text style={styles.pieChartTitle}>Analysis Pie Chart</Text>
            <Text style={styles.summaryText}>Total income is zero or undefined, cannot calculate percentages.</Text>
        </ScrollView>
    );
  }
};

const styles = StyleSheet.create({
  overall: {
    backgroundColor: "#f5f6fa",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 20,
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "90%",
    marginVertical: 10,
  },
  title: {
    color: "#3498db",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  content: {
    width: "100%",
    marginBottom: 20,
  },
  contentText: {
    fontSize: 18,
    color: "#2c3e50",
    marginBottom: 5,
    fontWeight: "bold",
  },
  rowContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  pieChartTitle: {
    color: "#3498db",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  pieChart: {
    marginVertical: 0,
  },
  summaryText: {
    fontSize: 18,
    color: "#2c3e50",
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
  },
});

export default Statistic;
