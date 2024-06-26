import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ResetEmail from '../ResetEmail';
import { useNavigation } from '@react-navigation/native';
import { getAuth, reauthenticateWithCredential, verifyBeforeUpdateEmail, signOut } from 'firebase/auth';
import { Alert } from 'react-native';

jest.mock('firebase/auth');
jest.mock('@react-navigation/native');

describe('Reset Email', () => {

    const mockNavigation = {
        replace: jest.fn(),
    };

    const mockCurrentUser = { email: 'test@example.com' };

    beforeEach(() => {
        jest.clearAllMocks();

        useNavigation.mockReturnValue(mockNavigation);

        getAuth.mockReturnValue({
            currentUser: mockCurrentUser,
        });

        jest.spyOn(Alert, 'alert');
    });

    it('Renders Correctly', () => {
        const { getByPlaceholderText, getByText } = render(<ResetEmail />);
        expect(getByText('Reset Email')).toBeTruthy();
        expect(getByPlaceholderText('Current Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
    });

    it('Error if Current Email does not Match Account Email', async () => {
        const { getByPlaceholderText, getByText } = render(<ResetEmail />);

        fireEvent.changeText(getByPlaceholderText('Current Email'), 'wrongemail@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getByText('Next'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', "Current Email doesn't match the account!");
        });
    });

    it('Error if Password is Incorrect', async () => {
        reauthenticateWithCredential.mockRejectedValue(new Error('Firebase: Error (auth/wrong-password).'));

        const { getByPlaceholderText, getByText } = render(<ResetEmail />);

        fireEvent.changeText(getByPlaceholderText('Current Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpassword');
        fireEvent.press(getByText('Next'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Wrong Password');
        });
    });

    it('Opens Modal when Password is Correct', async () => {
        reauthenticateWithCredential.mockResolvedValue({});

        const { getByPlaceholderText, getByText } = render(<ResetEmail />);

        fireEvent.changeText(getByPlaceholderText('Current Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
        fireEvent.press(getByText('Next'));

        await waitFor(() => {
            expect(Alert.alert).not.toHaveBeenCalled();
        });
    });

    it('Error if New Email matches Current Email', async () => {
        reauthenticateWithCredential.mockResolvedValue({});

        const { getByPlaceholderText, getByText, getByTestId } = render(<ResetEmail />);

        fireEvent.changeText(getByPlaceholderText('Current Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
        fireEvent.press(getByText('Next'));

        await waitFor(() => {
            fireEvent.changeText(getByPlaceholderText('New Email'), 'test@example.com');
            fireEvent.press(getByTestId('Reset Email'));
        });

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'You cannot change back original email!');
        });
    });

    it('Handles Email Reset Correctly and Signs Out', async () => {
        reauthenticateWithCredential.mockResolvedValue({});
        verifyBeforeUpdateEmail.mockResolvedValue({});

        const { getByPlaceholderText, getByText, getByTestId } = render(<ResetEmail />);

        fireEvent.changeText(getByPlaceholderText('Current Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
        fireEvent.press(getByText('Next'));

        await waitFor(() => {
            fireEvent.changeText(getByPlaceholderText('New Email'), 'newemail@example.com');
            fireEvent.press(getByTestId('Reset Email'));
        });

        await waitFor(() => {
            expect(mockNavigation.replace).toHaveBeenCalledWith('Login');
            expect(verifyBeforeUpdateEmail).toHaveBeenCalledWith(mockCurrentUser, 'newemail@example.com');
            expect(signOut).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith('Reminder', 'Verification Email sent! \nPlease verify your new email! \n Your email will be change right after you verified your email!');
        });
    });

    it('Error for Email Reset', async () => {
        reauthenticateWithCredential.mockResolvedValue({});
        verifyBeforeUpdateEmail.mockRejectedValue(new Error('Firebase: Error (auth/email-already-in-use).'));

        const { getByPlaceholderText, getByText , getByTestId} = render(<ResetEmail />);

        fireEvent.changeText(getByPlaceholderText('Current Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'correctpassword');
        fireEvent.press(getByText('Next'));

        await waitFor(() => {
            fireEvent.changeText(getByPlaceholderText('New Email'), 'existingemail@example.com');
            fireEvent.press(getByTestId('Reset Email'));
        });

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Email address is already in use!');
        });
    });
});
