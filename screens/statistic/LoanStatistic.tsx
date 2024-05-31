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
    const [isEditable, setIsEditable] = useState<boolean>(false);
    
    const handleSave = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            // const db = getDatabase();
            // const userRef = ref(db, `users/${user.uid}/Loan`);

            const db = getFirestore();
            const userRef = doc(db, "users", user.uid, "Income or Loan", "Loan");

            try {

                const checkZeroLoan = loan.some(loan => loan.amount <= 0);
                const checkEmptyLabel = loan.some(loan => loan.name == '');

                
                if (checkZeroLoan) {
                    Alert.alert("Error", "Loan must be greater than zero!")
                    return;
                }

                if (checkEmptyLabel) {
                    Alert.alert("Error", "Please put the label/name")
                    return;
                }

                // await update(userRef, {
                //     loan: loan,
                // })

                await setDoc(userRef,{
                    loan: loan,
                },{merge:true})

                setIsEditable(false);
                
                Alert.alert("Success", "Update Successful")
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

    useEffect(() => {
    
        const fetchUserData = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                // const db = getDatabase();
                // const userRef = ref(db, `users/${user.uid}/Loan`);
                // const snapshot = await get(userRef);

                const db = getFirestore();
                const userRef = doc(db, "users", user.uid, "Income or Loan", "Loan");
                const snapshot = await getDoc(userRef);

                if (snapshot.exists()) {
                    const userData = snapshot.data();
                    if (userData.loan !== undefined) {
                        setLoan(userData.loan);
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
                        {/* <Button title="Back" onPress={() => setIsEditable(false)}/> */}
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
        justifyContent: 'space-between',
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