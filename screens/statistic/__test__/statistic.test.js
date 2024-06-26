import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Statistic from '../Statistic';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('@react-navigation/native');


const mockUser = { uid: 'test-uid' };

const mockIncomeData = {
  exists: jest.fn(() => true),
  data: jest.fn(() => ({
    mainIncome: 5000,
    sideIncomes: [{ name: 'Freelance', amount: 2000 }],
    loan: [{ name: 'Car Loan', amount: 1500 }],
  })),
};

const mockEmptyData = {
  exists: jest.fn(() => true),
  data: jest.fn(() => ({
    mainIncome: 0,
  })),
};

const mockNavigation = {
    navigate: jest.fn(),
};

describe('Statistic', () => {
  beforeEach(() => {

    jest.clearAllMocks();
    
    getAuth.mockReturnValue({
      currentUser: mockUser,
    });

    getFirestore.mockReturnValue({
      collection: jest.fn(),
    });


    useNavigation.mockReturnValue(mockNavigation);

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Renders Correctly', async () => {
      doc.mockReturnValue(mockIncomeData);
  
      onSnapshot.mockImplementation((ref, callback) => {
        callback(mockIncomeData);
        return jest.fn();
      });

    const { getByText } = render(<Statistic />);


    await waitFor(() => {
      expect(getByText('Income')).toBeTruthy();
      expect(getByText('$5000')).toBeTruthy();
      expect(getByText('$2000')).toBeTruthy();
      expect(getByText('$7000')).toBeTruthy();
      expect(getByText('Loan')).toBeTruthy();
      expect(getByText('$1500')).toBeTruthy();
    });
  });

  it('Correct Percentages and Pie Chart Data', async () => {
        const { getByText, queryByText } = render(<Statistic />);
    
        await waitFor(() => {
          expect(getByText('Statistics Record')).toBeTruthy();
          expect(getByText('Total Tax: $350.00')).toBeTruthy();
          expect(getByText('Total CPF: $1000.00')).toBeTruthy();
          expect(getByText('Remaining Spending Power: $4150')).toBeTruthy();
          expect(queryByText('Total income is zero or undefined, cannot calculate percentages.')).toBeNull();
        });
    });


  it('Renders "Cannot Calculate Percentages" when Total Income is Zero or Undefined', async () => {
      doc.mockReturnValue(mockEmptyData);
  
      onSnapshot.mockImplementation((ref, callback) => {
        callback(mockEmptyData);
        return jest.fn();
      });

    const { getByText } = render(<Statistic />);

    await waitFor(() => {
      expect(getByText('Statistics Record')).toBeTruthy();
      expect(getByText('Total income is zero or undefined, cannot calculate percentages.')).toBeTruthy();
    });
  });

});
