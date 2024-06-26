import React from 'react';
import { render, fireEvent, findByA11yLabel ,waitFor, act } from '@testing-library/react-native';
import Register from '../Register'; // Adjust the import path as necessary
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@react-navigation/native');

describe('Register', () => {
    const mockNavigation = {
        replace: jest.fn(),
        navigate: jest.fn(),
        reset: jest.fn(),
    };
    
    beforeEach(() => {
        jest.clearAllMocks();
        useNavigation.mockReturnValue(mockNavigation);

    });

    it('Renders Correctly', () => {
        const { getByPlaceholderText, getByText } = render(<Register />);

        expect(getByPlaceholderText('Username')).toBeTruthy();
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
        expect(getByText('Sign Up')).toBeTruthy();
    });

    it('Error when Passwords do not Match', () => {
        const { getByPlaceholderText, getByText } = render(<Register />);

        fireEvent.changeText(getByPlaceholderText('Username'), 'test');
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password321');
        jest.spyOn(Alert, 'alert');
        fireEvent.press(getByText('Sign Up'));


        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Password and Confirm Password do not match!');
    });

    it('Error when User Name is Empty', () => {
        const { getByPlaceholderText, getByText } = render(<Register />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
        
        jest.spyOn(Alert, 'alert');
        fireEvent.press(getByText('Sign Up'));

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'User Name cannot be empty!');
    });

    it('Error when Phone Number is Empty', () => {
        const { getByPlaceholderText, getByText } = render(<Register />);

        fireEvent.changeText(getByPlaceholderText('Username'), 'TestUser');
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
        
        jest.spyOn(Alert, 'alert');
        fireEvent.press(getByText('Sign Up'));

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Phone Number cannot be empty!');
    });

    it('Navigates to Login Screen', async () => {

        const { getByTestId } = render(<Register />);
        fireEvent.press(getByTestId('Login'));

        await waitFor(() => {
            expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
        });
    });

});
