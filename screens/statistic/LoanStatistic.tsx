import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TextInput, Button, Modal, Alert} from 'react-native';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation} from "@react-navigation/native";
import { getAuth, getMultiFactorResolver, signInWithRedirect } from 'firebase/auth';
import { getDatabase ,ref, update, get} from 'firebase/database';
import { collection, doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';

export default function LoanStatistic() {
    
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [loan, setLoan] = useState<{name: string, amount: number}[]>([]);
    const [mainIncome, setMainIncome] = useState<number>(0);
    const [sideIncomes, setSideIncomes] = useState<{ name: string, amount: number }[]>([]);
    // const [totalLoan, setTotalLoan] = useState<number>(0);
    const [totalSideIncome, setTotalSideIncome] = useState<number>(0);
    const [isEditable, setIsEditable] = useState<boolean>(false);
    
    const handleSave = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {

            const db = getFirestore();
            const userRef = doc(db, "users", user.uid);

            try {

                const checkZeroLoan = loan.some(loan => loan.amount <= 0);
                const checkEmptyLabel = loan.some(loan => loan.name == '');
                const checkIsNaN = loan.some(loan => isNaN(loan.amount));

                
                if (checkZeroLoan) {
                    Alert.alert("Error", "Loan must be greater than zero!")
                    return;
                }

                if (checkIsNaN) {
                    Alert.alert("Error", "Loan amount cannot be Empty!")
                    return;
                }

                if (checkEmptyLabel) {
                    Alert.alert("Error", "Please put the label/name")
                    return;
                }

                const totalLoan = loan.reduce(
                    (acc: number, loan: { name: string; amount: number }) =>
                      acc + loan.amount,
                    0
                );

                const totalTax = mainIncome * searchPercentageOfTax(mainIncome);
                const totalCPF = mainIncome * 0.2;
                const spendingPower = mainIncome + totalSideIncome - totalLoan - totalTax - totalCPF;

                await setDoc(userRef,{
                    loan: loan,
                    spendingPower: spendingPower
                },{merge:true})

                setIsEditable(false);
                
                Alert.alert("Success", "Update Successful")
                navigation.goBack();

            } catch (e) {
                Alert.alert("Error", "Try Again")
            }
        }
    }

    const handleLoan = async (text: string, index: number, field: 'name' | 'amount') => {
        const updatedLoan = [...loan];
        if (field === 'name') {
            updatedLoan[index].name = text;
        } else {
            updatedLoan[index].amount = parseFloat(text);
        }
        setLoan(updatedLoan);
    }

    const addLoan = () => {
        setLoan([...loan, {name: '', amount: 0}])
    }

    const removeLoan = (index: number) => {
        const updatedLoan = loan.filter((_, i) => i !== index);
        setLoan(updatedLoan);
    }

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

    useEffect(() => {
    
        const fetchUserData = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {

                const db = getFirestore();
                const userRef = doc(db, "users", user.uid);
                const snapshot = await getDoc(userRef);

                if (snapshot.exists()) {
                    const userData = snapshot.data();
                    if (userData.loan !== undefined) {
                        setLoan(userData.loan);
                    }

                    if (userData.mainIncome != undefined) {
                        setMainIncome(userData.mainIncome);
                    }

                    if (userData.sideIncomes !== undefined) {
                        setSideIncomes(userData.sideIncomes);
                        
                        const totalSideIncome = userData.sideIncomes.reduce(
                            (acc: number, income: { name: string; amount: number }) =>
                                acc + income.amount,
                                0
                        );
                                            
                        setTotalSideIncome(totalSideIncome);
                    }



                } 
            }
        }
        fetchUserData();
    
    },[])
    

    return (


        <ScrollView contentContainerStyle={styles.overall}>
            <Modal
            animationType='fade'
            transparent={false}
            visible={isEditable}
            onRequestClose={() => {
                setIsEditable(!isEditable);
            }}>
                <ScrollView contentContainerStyle={styles.overall}>
                    <View style={styles.modalHeader}>
                        <Button title="Save" onPress={handleSave}/>
                    </View>
                   
                    <View style={styles.container}>
                        <Text style={styles.title}>Loan</Text>
                        {loan.map((loan, index) => (
                            <View key={index} style={styles.input}>
                                <View style={styles.LoanTextContainer}>
                                    <Text style={styles.modalText}>Name:</Text>
                                    <TextInput 
                                        style={styles.modalInput}
                                        placeholder='Label'
                                        placeholderTextColor="#aaa"
                                        value={loan.name}
                                        onChangeText={(text) => handleLoan(text, index, 'name')}
                                    />
                                </View>
                                <View style={styles.LoanTextContainer}>
                                    <Text style={styles.modalText}>Amount:</Text>
                                    <TextInput 
                                        style={styles.modalInput}
                                        placeholder='Amount'
                                        placeholderTextColor="#aaa"
                                        value={Number.isNaN(loan.amount) ? '' : loan.amount.toString()}
                                        onChangeText={(text) => handleLoan(text, index, 'amount')}
                                    />

                                </View>

                                <Button title="Delete" onPress={() => removeLoan(index)}/>
                            </View>
                            
                        ))
                        }
                        <Button title="Add Loan" onPress={addLoan}/>
                    </View>
                </ScrollView>
            </Modal>

            <View style={styles.container}>
                <Text style={styles.title}>Loan</Text>
                {loan.length === 0 ? (
                    <Text>-</Text>
                ) : (
                    loan.map((loan, index) => (
                        <View key = {index} style={styles.input}>
                            <View style={styles.LoanTextContainer}>
                                <Text style={styles.modalText}>Name:</Text>
                                <Text style={styles.LoanText}>{loan.name}</Text>
                            </View>
                            <View style={styles.LoanTextContainer}>
                                <Text style={styles.modalText}>Amount:</Text>
                                <Text style={styles.LoanText}>${loan.amount}</Text>
                            </View>
                        </View>
                    ))
                )}
            </View>

            <Button title="Edit" onPress={() => setIsEditable(true)}/>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    overall: {
        // flex: 1,
        // backgroundColor: '#f5f6fa',
        justifyContent: 'flex-start',
        alignItems: 'center', // Center everything horizontally
        paddingVertical: 50,
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
        alignItems: 'center',
        marginBottom:10,
        marginTop:20
    },
    title: {
        color: '#2c3e50',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    contentText: {
        fontSize: 18,
        color: '#34495e',
        marginBottom: 5,
        fontWeight:'bold'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '100%'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'space-around',
        borderColor: '#dcdde1',
        backgroundColor: '#f5f6fa',
        marginBottom: 15,
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
        width:'100%'
    },
    modalInput: {
        flex: 1,
        padding: 10,
        fontSize: 16,
        color: '#2c3e50',
        borderWidth: 2,
        borderColor: '#dcdde1',
        borderRadius: 5,
        backgroundColor: '#ecf0f1',
    },
    modalText: {
        fontSize: 17,
        fontWeight:"bold",
        marginRight: 15
    },
    LoanText: {
        flex: 1,
        padding: 10,
        fontSize: 17,
        fontWeight:'bold',
    },
    LoanTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'space-around',
        marginBottom: 10,
    },
    LoanRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    }
});