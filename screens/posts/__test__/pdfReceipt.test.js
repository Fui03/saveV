import React from 'react';
import { render, fireEvent, waitFor , act} from '@testing-library/react-native';
import PdfReceipt from '../PdfReceipt'; 
import { useRoute, useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
  };
});

jest.mock('expo-sharing');
jest.mock('expo-file-system');

describe('PdfReceipt', () => {
  const mockNavigate = jest.fn();
  const mockReplace = jest.fn();
  
  beforeEach(() => {
    
    jest.clearAllMocks();
    useNavigation.mockReturnValue({
      navigate: mockNavigate,
      replace: mockReplace,
    });

    useRoute.mockReturnValue({
      params: { pdfUri: 'testPdfUri' },
    });

    getAuth.mockReturnValue({
      currentUser: {
        uid: 'testUid',
        email: 'test@example.com',
      },
    });

    getFirestore.mockReturnValue({});
    doc.mockReturnValue({});
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ userName: 'Test User' }),
    });

    Sharing.isAvailableAsync.mockResolvedValue(true);
    FileSystem.writeAsStringAsync.mockResolvedValue();
    Sharing.shareAsync.mockResolvedValue();
  });

  it('Renders Correctly', async () => {
    const { getByText } = render(<PdfReceipt />);

    await act(async () => {
        expect(getByText('Done Payment!')).toBeTruthy();
        expect(getByText('You may print out your receipt!')).toBeTruthy();
    })
  });

  it('Navigation when Done button is Pressed', async () => {
    const { getByText } = render(<PdfReceipt />);

    const doneButton = getByText('Done');
    await act(async () => {
    
        fireEvent.press(doneButton);
    
        expect(mockReplace).toHaveBeenCalledWith('DrawerNavigation');
    })
  });

});
