import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Button, Modal, Alert } from 'react-native';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { getAuth, getIdToken, getMultiFactorResolver, signInWithRedirect } from 'firebase/auth';
import { getDatabase, ref, update, get } from 'firebase/database';
import { doc, getDoc, getFirestore, setDoc, onSnapshot } from 'firebase/firestore';

export default function IncomeStatistic() {

    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [mainIncome, setMainIncome] = useState<number>(0);
    const [sideIncomes, setSideIncomes] = useState<{ name: string, amount: number }[]>([]);
    const [isEditable, setIsEditable] = useState<boolean>(false);
    const [totalLoan, setTotalLoan] = useState<number>(0);

    const MAX_AMOUNT = 1e13;

    const handleSave =  async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {


            const db = getFirestore();
            const userRef = doc(db, "users", user.uid);

            try {

                const checkZeroSides = sideIncomes.some(income => income.amount <= 0);
                const checkEmptyLabel = sideIncomes.some(income => income.name == '');
                const checkIsNaN = sideIncomes.some(income => isNaN(income.amount));


                if (mainIncome && mainIncome <= 0) {
                    Alert.alert("Error", "Income must be greater than or equal to zero!")
                    return;
                }

                if (checkZeroSides) {
                    Alert.alert("Error", "Side Income must be greater than zero!")
                    return;
                }
                
                if (checkIsNaN) {
                    Alert.alert("Error", "Side Income amount cannot be Empty!")
                    return;
                }

                if (checkEmptyLabel) {
                    Alert.alert("Error", "Please put the label/name")
                    return;
                }

                if (mainIncome > MAX_AMOUNT || sideIncomes.some(income => income.amount > MAX_AMOUNT)) {
                    Alert.alert("Error", `Amount should not exceed ${MAX_AMOUNT}!`);
                    return;
                }
                

                const totalSideIncome = sideIncomes.reduce(
                    (acc: number, income: { name: string; amount: number }) =>
                        acc + income.amount,
                        0
                );

                if (mainIncome === undefined || isNaN(mainIncome)) {
                    const totalTax = 0;

                    await setDoc(userRef, {
                        mainIncome: mainIncome || 0,
                        sideIncomes: sideIncomes,
                        totalTax: totalTax,
                        spendingPower: totalSideIncome
                    }, { merge: true })

                } else {

                    const totalTax = mainIncome * await searchPercentageOfTax(mainIncome);
                    const totalCPF = mainIncome * 0.2;
                    const spendingPower = mainIncome + totalSideIncome - totalLoan - totalTax - totalCPF;

                    await setDoc(userRef, {
                        mainIncome: mainIncome,
                        sideIncomes: sideIncomes,
                        totalTax: totalTax,
                        spendingPower: spendingPower
                    }, { merge: true })
                }

                setIsEditable(false);

                Alert.alert("Success", "Update Successful")
                navigation.goBack();
            } catch (e) {
                console.error(e)
                Alert.alert("Error", "Try Again")
            }
        }
    }

    const handleSideIncome = async (text: string, index: number, field: 'name' | 'amount') => {
        const updatedSideIncomes = [...sideIncomes];
        if (field === 'name') {
            updatedSideIncomes[index].name = text;
        } else {
            updatedSideIncomes[index].amount = parseFloat(text);
        }
        setSideIncomes(updatedSideIncomes);
    }

    const addSideIncome = () => {
        setSideIncomes([...sideIncomes, { name: '', amount: 0 }])
    }

    const removeSideIncome = (index: number) => {
        const updatedSideIncomes = sideIncomes.filter((_, i) => i !== index);
        setSideIncomes(updatedSideIncomes);
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

                    setMainIncome(userData.mainIncome);

                    if (userData.sideIncomes !== undefined) {
                        setSideIncomes(userData.sideIncomes);                       
                        
                    }

                    const loan = userData.loan || [];
                    const totalLoan = loan.reduce(
                        (acc: number, loan: { name: string; amount: number }) =>
                          acc + loan.amount,
                        0
                    );
                    
                    setTotalLoan(totalLoan);

                } else {
                    setMainIncome(0);
                    setTotalLoan(0);
                }
                
            }
        }
        fetchUserData();

    }, []);
    


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
                        <Button title="Save" onPress={handleSave} />
                    </View>
                    <View style={styles.container}>
                        <Text style={styles.title}>Main Income</Text>
                        <TextInput
                            style={styles.input}
                            placeholder='Main Income'
                            placeholderTextColor="#aaa"
                            keyboardType='number-pad'
                            value={(mainIncome === undefined || Number.isNaN(mainIncome)) ? '' : mainIncome.toString(10)}
                            onChangeText={(text) => setMainIncome(parseFloat(text))}
                        />

                    </View>
                    <View style={styles.container}>
                        <Text style={styles.title}>Side Income</Text>
                        {sideIncomes.map((income, index) => (
                            <View key={index} style={styles.input}>
                                <View style={styles.sideIncomeTextContainer}>
                                    <Text style={styles.modalText}>Name:</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder='Label'
                                        placeholderTextColor="#aaa"
                                        value={income.name}
                                        onChangeText={(text) => handleSideIncome(text, index, 'name')}
                                    />
                                </View>
                                <View style={styles.sideIncomeTextContainer}>
                                    <Text style={styles.modalText}>Amount:</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder='Amount'
                                        placeholderTextColor="#aaa"
                                        value={Number.isNaN(income.amount) ? '' : income.amount.toString()}
                                        onChangeText={(text) => handleSideIncome(text, index, 'amount')}
                                    />

                                </View>

                                <Button title="Delete" onPress={() => removeSideIncome(index)} />
                            </View>

                        ))
                        }
                        <Button title="Add Side Income" onPress={addSideIncome} />
                    </View>
                </ScrollView>
            </Modal>

            <View style={styles.container}>
                <Text style={styles.title}>Main Income</Text>
                <Text style={styles.title}>${(mainIncome === undefined || Number.isNaN(mainIncome)) ? '0' : mainIncome.toString(10)}</Text>
            </View>
            <View style={styles.container}>
                <Text style={styles.title}>Side Income</Text>
                {sideIncomes.length === 0 ? (
                    <Text>-</Text>
                ) : (
                    sideIncomes.map((income, index) => (
                        <View key={index} style={styles.input}>
                            <View style={styles.sideIncomeTextContainer}>
                                <Text style={styles.modalText}>Name:</Text>
                                <Text style={styles.sideIncomeText}>{income.name}</Text>
                            </View>
                            <View style={styles.sideIncomeTextContainer}>
                                <Text style={styles.modalText}>Amount:</Text>
                                <Text style={styles.sideIncomeText}>${income.amount}</Text>
                            </View>
                        </View>
                    ))
                )}
            </View>

            <Button title="Edit" onPress={() => setIsEditable(true)} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    overall: {
        //  flex: 1,
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
        marginBottom: 10,
        marginTop: 20
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
        fontWeight: 'bold'
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
        justifyContent: 'space-around',
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
        width: '100%'
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
        fontWeight: "bold",
        marginRight: 15
    },
    sideIncomeText: {
        flex: 1,
        padding: 10,
        fontSize: 17,
        fontWeight: 'bold',
    },
    sideIncomeTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    sideIncomeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    }
});