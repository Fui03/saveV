import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TextInput, Button, Modal, Alert} from 'react-native';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation} from "@react-navigation/native";
import { getAuth, getMultiFactorResolver, signInWithRedirect } from 'firebase/auth';
import { getDatabase ,ref, update, get} from 'firebase/database';

export default function IncomeStatistic() {
    
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [mainIncome, setMainIncome] = useState<number | undefined>();
    const [sideIncomes, setSideIncomes] = useState<{name: string, amount: number}[]>([]);
    const [isEditable, setIsEditable] = useState<boolean>(false);
    
    const handleSave = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const db = getDatabase();
            const userRef = ref(db, `users/${user.uid}/Income`);

            try {

                const checkZeroSides = sideIncomes.some(income => income.amount <= 0);
                const checkEmptyLabel = sideIncomes.some(income => income.name == '');

                if (mainIncome && mainIncome <= 0) {
                    Alert.alert("Error", "Income must be greater than zero!")
                    return;
                }
                
                if (checkZeroSides) {
                    Alert.alert("Error", "Side Income must be greater than zero!")
                    return;
                }

                if (checkEmptyLabel) {
                    Alert.alert("Error", "Please put the label/name")
                    return;
                }

                await update(userRef, {
                    mainIncome: mainIncome,
                    sideIncomes: sideIncomes,
                })

                setIsEditable(false);
                
                Alert.alert("Success", "Update Successful")
            } catch (e) {
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
        setSideIncomes([...sideIncomes, {name: '', amount: 0}])
    }

    const removeSideIncome = (index: number) => {
        const updatedSideIncomes = sideIncomes.filter((_, i) => i !== index);
        setSideIncomes(updatedSideIncomes);
    }

    useEffect(() => {
    
        const fetchUserData = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                const db = getDatabase();
                const userRef = ref(db, `users/${user.uid}/Income`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setMainIncome(userData.mainIncome);
                    if (userData.sideIncomes !== undefined) {
                        setSideIncomes(userData.sideIncomes);
                    }
                } else {
                    setMainIncome(0);
                    
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
                        <Button title="Back" onPress={() => setIsEditable(false)}/>
                        <Button title="Save" onPress={handleSave}/>
                    </View>
                    <View style={styles.container}>
                        <Text style={styles.title}>Main Income</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder='Main Income'
                            placeholderTextColor="#aaa"
                            keyboardType='number-pad'
                            value={(mainIncome === undefined || Number.isNaN(mainIncome))  ? '' :mainIncome.toString(10)}
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

                                <Button title="Delete" onPress={() => removeSideIncome(index)}/>
                            </View>
                            
                        ))
                        }
                        <Button title="Add Side Income" onPress={addSideIncome}/>
                    </View>
                </ScrollView>
            </Modal>

            <View style={styles.container}>
                <Text style={styles.title}>Main Income</Text>
                <Text style={styles.title}>${mainIncome}</Text>
            </View>
            <View style={styles.container}>
                <Text style={styles.title}>Side Income</Text>
                {sideIncomes.length === 0 ? (
                    <Text>-</Text>
                ) : (
                    sideIncomes.map((income, index) => (
                        <View key = {index} style={styles.input}>
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
    sideIncomeText: {
        flex: 1,
        padding: 10,
        fontSize: 17,
        fontWeight:'bold',
    },
    sideIncomeTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'space-around',
        marginBottom: 10,
    },
    sideIncomeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    }
});