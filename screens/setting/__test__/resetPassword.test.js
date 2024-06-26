import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ResetPassword from '../ResetPassword';
import { useNavigation } from '@react-navigation/native';
import { getAuth, reauthenticateWithCredential, updatePassword} from 'firebase/auth';
import { Alert } from 'react-native';

jest.mock('firebase/auth');

jest.mock('@react-navigation/native');


describe('Reset Password', () => {

    const mockNavigation = {
        replace: jest.fn(),
    };

    const mockCurrentUser = { uid: 'testUser' , email: 'test@example.com'};

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigation.mockReturnValue(mockNavigation);
        getAuth.mockReturnValue({
            currentUser: mockCurrentUser,
        });
    });

    it('Renders Correctly', () => {
        const { getByPlaceholderText, getAllByText } = render(<ResetPassword />);

        expect(getAllByText('Reset Password')).toBeTruthy();
        expect(getByPlaceholderText('Old Password')).toBeTruthy();
        expect(getByPlaceholderText('New Password')).toBeTruthy();
        expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    });

    it('New Password and Confirm Password do not Match', async () => {
        const { getByPlaceholderText , getByTestId} = render(<ResetPassword />);

        jest.spyOn(Alert, 'alert')
        fireEvent.changeText(getByPlaceholderText('Old Password'), 'oldpassword123');
        fireEvent.changeText(getByPlaceholderText('New Password'), 'newpassword123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'newpassword456');
        fireEvent.press(getByTestId('ResetPassword'));



        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith("Error", "New Password and Confirm Password do not match!");
        });
    });

    it('Error if Old Password is Incorrect', async () => {
        const { getByPlaceholderText, getByTestId } = render(<ResetPassword />);

        getAuth.mockReturnValue({ currentUser: mockCurrentUser });
        reauthenticateWithCredential.mockRejectedValue(new Error('Firebase: Error (auth/invalid-credential).'));

        fireEvent.changeText(getByPlaceholderText('Old Password'), 'wrongoldpassword');
        fireEvent.changeText(getByPlaceholderText('New Password'), 'newpassword123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'newpassword123');

        fireEvent.press(getByTestId('ResetPassword'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith("Error", "Wrong Old Password");
        });
    });

    it('Navigates to DrawerNavigation after Successful Password Reset', async () => {
        const { getByPlaceholderText, getByTestId } = render(<ResetPassword />);
        getAuth.mockReturnValue({ currentUser: mockCurrentUser });
        reauthenticateWithCredential.mockResolvedValue({});
        updatePassword.mockResolvedValue();


        fireEvent.changeText(getByPlaceholderText('Old Password'), 'oldpassword123');
        fireEvent.changeText(getByPlaceholderText('New Password'), 'newpassword123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'newpassword123');

        fireEvent.press(getByTestId('ResetPassword'));

        await waitFor(() => {
            expect(mockNavigation.replace).toHaveBeenCalledWith('DrawerNavigation');
        });
    });
});