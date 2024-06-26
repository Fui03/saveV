import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgetPassword from '../ForgetPassword';
import { useNavigation } from '@react-navigation/native';
import { sendPasswordResetEmail, getAuth} from 'firebase/auth';
import { Alert } from 'react-native';



jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
}));

jest.mock('@react-navigation/native');


describe('Forget Password', () => {

    const mockNavigation = {
        replace: jest.fn(),
        navigate: jest.fn(),
        reset: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        useNavigation.mockReturnValue(mockNavigation);
    });

    it('Send Password Reset Email and Navigate to Login Screen', async () => {
        const { getByPlaceholderText, getByText } = render(<ForgetPassword />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        jest.spyOn(Alert, 'alert');

        fireEvent.press(getByText('Reset Password'));
        const mockUser = { uid: 'testUser', email: 'test@example.com' };

        getAuth.mockReturnValue({
            currentUser: mockUser,
        });
        
        await waitFor(() => {
            expect(sendPasswordResetEmail).toHaveBeenCalledWith(mockUser.currentUser, 'test@example.com');
        });

        expect(Alert.alert).toHaveBeenCalledWith("Password Reset Email Sent", "Please check your email!");


        expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });
});
