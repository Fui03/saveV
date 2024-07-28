import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from '../Login'; 
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { getAuth, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, getDoc, doc } from 'firebase/firestore';

jest.mock('@react-navigation/native');
jest.mock('firebase/auth');
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    getDoc: jest.fn(),
    doc: jest.fn(),
}));
  
describe('Login', () => {
    const mockNavigation = {
        replace: jest.fn(),
        navigate: jest.fn(),
        reset: jest.fn(),
    };
    
    const mockUser = { uid: 'testUserId', email: 'test@test.com' , hasCompletedOnboarding: false};
    const mockUser2 = { uid: 'testUserId', email: 'test@test.com', hasCompletedOnboarding: true};

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigation.mockReturnValue(mockNavigation);
    });

    it('Renders Correctly', () => {
        const { getAllByText, getByPlaceholderText } = render(<Login />);
        
        expect(getAllByText('Login')).toBeTruthy();
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
    });

    it('Shows Error Message on Invalid Login', async () => {
        signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid Email or Password'));

        const { getByPlaceholderText, getByTestId } = render(<Login />);

        jest.spyOn(Alert, 'alert');
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
        fireEvent.press(getByTestId('Login'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith("Error", "Invalid Email or Password");
        });
    });

    it('Navigates to OnBoarding on First Successful Login', async () => {
        getDoc.mockResolvedValue({ exists: jest.fn().mockReturnValue(true), data: jest.fn().mockReturnValue(mockUser) });

        signInWithEmailAndPassword.mockResolvedValue({
        user: {
            emailVerified: true,
        },
        });

        const { getByPlaceholderText, getByTestId} = render(<Login />);
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
        fireEvent.press(getByTestId('Login'));

        await waitFor(() => {
            expect(mockNavigation.replace).toHaveBeenCalledWith('OnBoarding');
        });
    });
    
    it('Navigates to OnBoarding on First Successful Login', async () => {
        signInWithEmailAndPassword.mockResolvedValue({
        user: {
            emailVerified: true,
        },
        });

        const { getByPlaceholderText, getByTestId} = render(<Login />);
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
        fireEvent.press(getByTestId('Login'));

        await waitFor(() => {
            expect(mockNavigation.replace).toHaveBeenCalledWith('OnBoarding');
        });
    });
    it('Navigates to Singup Screen', async () => {

        const { getByTestId} = render(<Login />);
        fireEvent.press(getByTestId('Register'));

        await waitFor(() => {
            expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
        });
    });
    
    it('Navigates to Forger Password Screen', async () => {

        const { getByTestId} = render(<Login />);
        fireEvent.press(getByTestId('ForgetPassword'));

        await waitFor(() => {
            expect(mockNavigation.navigate).toHaveBeenCalledWith('ForgetPassword');
        });
    });

    it('Shows Modal if Email not Verified', async () => {
        signInWithEmailAndPassword.mockResolvedValue({
        user: {
            emailVerified: false,
        },
        });

        const { getByPlaceholderText, getByText, getByTestId } = render(<Login />);
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
        fireEvent.press(getByTestId('Login'));

        await waitFor(() => {
            expect(getByText('Please verify your email address to proceed.')).toBeTruthy();
        });
    });

    it('Shows Modal if Email not Verified and Resends Verification Email', async () => {
        const mockSendEmailVerification = jest.fn().mockResolvedValue();
        getAuth.mockReturnValue({
            currentUser: { sendEmailVerification: mockSendEmailVerification },
        });

        signInWithEmailAndPassword.mockResolvedValue({
        user: {
            emailVerified: false,
        },
        });

        const { getByPlaceholderText, getByText, queryByText , getByTestId} = render(<Login />);
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
        fireEvent.press(getByTestId('Login'));

        await waitFor(() => {
            expect(getByText('Please verify your email address to proceed.')).toBeTruthy();
        });

        fireEvent.press(getByText('Resend Verification Email'));

        jest.spyOn(Alert, 'alert');

        await waitFor(() => {
            expect(sendEmailVerification).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith("Verification Email Resent", "Please check your email");
        });
    });

});
