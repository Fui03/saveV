import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TransactionDetail from '../TransactionDetail'
import { getAuth } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useRoute: jest.fn()
  }));

describe('Transaction Detail', () => {

    const mockCurrentUser = { uid: 'testUser' };
    const mockNavigation = { goBack: jest.fn() };
    const mockUseRoute = { params: {
        transaction: {
            id: 'mockDocumentId',
            name: 'Food',
            amount: 100,
            date: new Date(2024, 5, 24),
        }
    }}

    beforeEach(() => {
        jest.clearAllMocks();

        getAuth.mockReturnValue({
            currentUser: mockCurrentUser,
        });

        useNavigation.mockReturnValue(mockNavigation);
        useRoute.mockReturnValue(mockUseRoute);


        deleteDoc.mockImplementation((ref) => {
            return Promise.resolve({ id: 'mockDocumentId' });
        })

        doc.mockReturnValue({ id: 'mockDocumentId' });

    });

    it('Renders Correctly', () => {

        const { getByText } = render(<TransactionDetail />);

        expect(getByText('Expense Detail')).toBeTruthy();
        expect(getByText('Food')).toBeDefined();
        expect(getByText('Amount')).toBeTruthy();
        expect(getByText('$ 100')).toBeDefined();
        expect(getByText('Date')).toBeTruthy();
        expect(getByText('24-06-2024')).toBeDefined();
        expect(getByText('Delete Expense')).toBeTruthy();

    });

    it('Delete Transaction Correctly', async () => {
        const { getByText } = render(<TransactionDetail />);

        fireEvent.press(getByText('Delete Expense'));

        await waitFor(() => {
            expect(deleteDoc).toHaveBeenCalledWith(expect.objectContaining({ id: 'mockDocumentId' }));
            expect(mockNavigation.goBack).toHaveBeenCalled();
        });
    
    });

});