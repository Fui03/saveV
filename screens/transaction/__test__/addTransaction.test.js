import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AddTransaction from '../AddTransaction';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('AddTransaction', () => {

    const mockCurrentUser = { uid: 'testUser' };
    const mockNavigation = { goBack: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
        
        getAuth.mockReturnValue({
            currentUser: mockCurrentUser,
        });

        useNavigation.mockReturnValue(mockNavigation);

        addDoc.mockImplementation((collectionPath, data) => {
            return Promise.resolve({ id: 'mockDocumentId', ...data });
        });

        collection.mockReturnValue({
            addDoc: addDoc.mockResolvedValue({ id: 'mockDocumentId' }),
        });
    });

    it('Renders Correctly', () => {

        const { getByPlaceholderText, getByText } = render(<AddTransaction />);

        expect(getByPlaceholderText('Transaction Name')).toBeTruthy();
        expect(getByPlaceholderText('Amount')).toBeTruthy();
        expect(getByText('Add Transaction')).toBeTruthy();

    });

    it('Error if amount is not entered', async () => {

        const { getByText } = render(<AddTransaction />);
        
        jest.spyOn(Alert, 'alert');
        fireEvent.press(getByText('Add Transaction'));
        
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter your amount!');
        });
    });

    it('shows error if amount is zero or negative', async () => {

        const { getByPlaceholderText, getByText } = render(<AddTransaction />);

        jest.spyOn(Alert, 'alert');
        fireEvent.changeText(getByPlaceholderText('Amount'), '-100');
        
        fireEvent.press(getByText('Add Transaction'));
        
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please ensure the amount is greater than zero!');
        });
    });

    it('shows error if name is not entered', async () => {

        const { getByPlaceholderText, getByText } = render(<AddTransaction />);

        jest.spyOn(Alert, 'alert');
        fireEvent.changeText(getByPlaceholderText('Amount'), '100');

        fireEvent.press(getByText('Add Transaction'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a name for the expenses!');
        });
    });

    it('adds transaction correctly', async () => {
        const { getByPlaceholderText, getByText } = render(<AddTransaction />);

        fireEvent.changeText(getByPlaceholderText('Transaction Name'), 'Test Transaction');
        fireEvent.changeText(getByPlaceholderText('Amount'), '100');

        fireEvent.press(getByText('Add Transaction'));

        await waitFor(() => {
            expect(addDoc).toHaveBeenCalledWith(expect.any(Object), {
                name: 'Test Transaction',
                amount: 100,
                date: expect.any(String),
            });

            expect(mockNavigation.goBack).toHaveBeenCalled();
        });
    });
});