import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getFirestore, onSnapshot, query } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Transaction from '../Transaction';




jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('Transaction', () => {
    const mockNavigation = { navigate: jest.fn() };
    const mockUser = { uid: 'testUser', email: 'test@example.com' };
    const mockTransaction = {
        id: 'mockTransactionId',
        name: 'Groceries',
        amount: 50,
        date: new Date(),
    };
        
    beforeEach(() => {
        jest.clearAllMocks();

        getAuth.mockReturnValue({
            currentUser: mockUser,
        });

        useNavigation.mockReturnValue(mockNavigation);

        getFirestore.mockReturnValue({});

        getDoc.mockResolvedValue({ exists: jest.fn(() => true), data: jest.fn(() => ({ userName: 'Test User' })) });

        onSnapshot.mockImplementation((q, callback) => {
        callback({
            docs: [{ id: 'mockTransactionId', data: () => mockTransaction }],
        });
        return jest.fn();
        });

    });

    it('Renders Correctly', async () => {
        const { getByText, queryByText, getAllByText } = render(<Transaction />);

        await waitFor(() => {
            expect(getByText('Monthly Expenses:')).toBeTruthy();
        });

        const amountElements = getAllByText('$50');
        expect(amountElements.length).toBeGreaterThan(0);
        expect(queryByText('Groceries')).toBeTruthy();
    });

    it('Navigates to AddTransaction screen', async () => {
        const { getByText } = render(<Transaction />);
        
        await act( async () => {
            fireEvent.press(getByText('+'));
        })

        expect(mockNavigation.navigate).toHaveBeenCalledWith('AddTransaction');
    });

    it('Navigates to TransactionDetail screen', async () => {
        const { getByText } = render(<Transaction />);

        await waitFor(() => {
            fireEvent.press(getByText('Groceries'));
        });

        expect(mockNavigation.navigate).toHaveBeenCalledWith('TransactionDetail', { transaction: mockTransaction });
    });

    it('Opens month and year picker modal', async () => {
        const { getByText, getByTestId } = render(<Transaction />);

        await act(async () => {
            fireEvent.press(getByTestId('open-picker'));
        });

        expect(getByText('Select Month and Year')).toBeTruthy();
    });

 
});
