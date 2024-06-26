import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import IncomeStatistic from '../IncomeStatistic';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('@react-navigation/native');

describe('Income Statistic', () => {
  
    const mockNavigation = {
    navigate: jest.fn(),
  };

  const mockUser = { uid: 'testUserId' };

  const mockUserData = {
    mainIncome: 5000,
    sideIncomes: [
      { name: 'Freelancing', amount: 2000 },
      { name: 'Investments', amount: 1500 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getAuth.mockReturnValue({
      currentUser: mockUser,
    });
    useNavigation.mockReturnValue(mockNavigation);
    getFirestore.mockReturnValue({});
    doc.mockReturnValue({});
    getDoc.mockResolvedValue({ exists: () => true, data: () => mockUserData });
    setDoc.mockResolvedValue({});
  });

  it('Renders Correctly', async () => {
    const { getByText, queryByText } = render(<IncomeStatistic />);

    await act(async () => {

        await waitFor(() => {
          expect(getByText('$5000')).toBeTruthy();
          expect(getByText('Freelancing')).toBeTruthy();
          expect(getByText('$2000')).toBeTruthy();
          expect(getByText('Investments')).toBeTruthy();
          expect(getByText('$1500')).toBeTruthy();
        });
    
        expect(queryByText('Main Income')).toBeTruthy();
        expect(queryByText('Side Income')).toBeTruthy();
    })

  });

  it('Opens Modal and Allows Editing of Income', async () => {
    const { getByPlaceholderText, getAllByPlaceholderText, getByText } = render(<IncomeStatistic />);

    jest.spyOn(Alert, 'alert');

    fireEvent.press(getByText('Edit'));

    await waitFor(() => {
      expect(getByPlaceholderText('Main Income')).toBeTruthy();
    });
    
    
    fireEvent.changeText(getByPlaceholderText('Main Income'), '6000');
    
    const labelInputs = getAllByPlaceholderText('Label');
    fireEvent.changeText(labelInputs[0], 'Consulting');
    
    const amoutInputs = getAllByPlaceholderText('Amount');
    fireEvent.changeText(amoutInputs[0], '3000');
    
    fireEvent.press(getByText('Save'));
    
    await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith("Success", "Update Successful");
    });
});

it('Alert when income is zero or negative and Alert when Label is Empty', async () => {
    const { getByText, getByPlaceholderText , getAllByPlaceholderText} = render(<IncomeStatistic />);

    jest.spyOn(Alert, 'alert');

    fireEvent.press(getByText('Edit'));

    await waitFor(() => {
        expect(getByPlaceholderText('Main Income')).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText('Main Income'), '-100');
    fireEvent.press(getByText('Save'));

    await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Income must be greater than or equal to zero!');
    });

    fireEvent.changeText(getByPlaceholderText('Main Income'), '5000');

    const labelInputs = getAllByPlaceholderText('Label');
    fireEvent.changeText(labelInputs[0], 'Consulting');
    

    const amoutInputs = getAllByPlaceholderText('Amount');
    fireEvent.changeText(amoutInputs[0], '-100');
    
    fireEvent.press(getByText('Save'));

    await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Side Income must be greater than zero!');
    });


    const amoutInputs2 = getAllByPlaceholderText('Amount');
    fireEvent.changeText(amoutInputs2[0], '100');

    const labelInputs2 = getAllByPlaceholderText('Label');
    fireEvent.changeText(labelInputs2[0], '');
    fireEvent.press(getByText('Save'));

    await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please put the label/name');
    });
});
});
