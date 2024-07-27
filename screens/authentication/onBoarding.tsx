import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAuth } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import React from 'react';
import { View, Text, Image } from 'react-native';
import {OnboardFlow} from 'react-native-onboard';


const OnBoarding = () => {

    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const handleDone = async () => {
        const auth = getAuth();
        const user = auth.currentUser;
        const db = getFirestore();

        if (user) {
            await setDoc(doc(db, 'users', user.uid), { hasCompletedOnboarding: true }, { merge: true });
            navigation.replace('DrawerNavigation');
        }
    }

    return (
        <OnboardFlow
            pages={[
            {
                imageUri: Image.resolveAssetSource(require('@/assets/images/logo2.png')).uri,
                title: 'Welcome to SaveV',
                subtitle: 'Effortlessly manage your money and stay on top of your finances.',
            },
            {
                imageUri: Image.resolveAssetSource(require('@/assets/images/accounting.png')).uri,
                title: 'Calculate Spending Power',
                subtitle: 'Enter your salary and loans to understand your spending limits.',
            },
            {
                imageUri: Image.resolveAssetSource(require('@/assets/images/capital.png')).uri,
                title: 'Track Your Expenses',
                subtitle: 'Keep a detailed log of all your expenses to manage your budget effectively.',
            },
            {
                imageUri: Image.resolveAssetSource(require('@/assets/images/loupe.png')).uri,
                title: 'Explore',
                subtitle: 'Connect with others and explore more hobbies',
            },
            {
                imageUri: Image.resolveAssetSource(require('@/assets/images/friends.png')).uri,
                title: 'Make new friends',
                subtitle: 'Share with people all around the country',
            },
            {
                imageUri: Image.resolveAssetSource(require('@/assets/images/logo2.png')).uri,
                title: 'Get Started',
                subtitle: "Let's get started!",
            },
            ]}
            onDone={handleDone}
        />
    );
};

export default OnBoarding;
