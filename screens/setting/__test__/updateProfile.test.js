import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import UpdateProfile from '../UpdateProfile';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import { Alert } from 'react-native';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('@react-navigation/native');

describe('UpdateProfile', () => {
  const mockNavigation = {
    replace: jest.fn(),
  };

  const mockCurrentUser = { uid: 'test-uid' };

  beforeEach(() => {
    jest.clearAllMocks();

    useNavigation.mockReturnValue(mockNavigation);
  
    getAuth.mockReturnValue({
      currentUser: mockCurrentUser,
    });

    jest.spyOn(Alert, 'alert');
  });

  it('Renders Correctly', async () => {

    const mockUserData = { userName: 'TestUser' };

    getDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUserData,
    });

    const { getByPlaceholderText, getByText } = render(<UpdateProfile />);
    
    await act(async () => {
        expect(getByText('Profile')).toBeTruthy();
        expect(getByPlaceholderText('User Name')).toBeTruthy();    
    })

  });

  it('Fetches User data', async () => {
    const mockUserData = { userName: 'TestUser' };
    getFirestore.mockReturnValue({});
    doc.mockReturnValue({});
    getDoc.mockResolvedValue({ exists: () => true, data: () => mockUserData });

    const { getByPlaceholderText } = render(<UpdateProfile />);

    await waitFor(() => {
      expect(getByPlaceholderText('User Name').props.value).toBe('TestUser');
    });
  });

  it('Error if no User Data Found', async () => {
    getFirestore.mockReturnValue({});
    doc.mockReturnValue({});
    getDoc.mockResolvedValue({ exists: () => false });

    render(<UpdateProfile />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'No data found!');
    });
  });

  it('Updates User Profile Successfully', async () => {

    updateDoc.mockImplementation((collectionPath, data) => {
        return Promise.resolve({ id: 'mockDocumentId', ...data });
    });
    const { getByPlaceholderText, getByText } = render(<UpdateProfile />);

    await fireEvent.changeText(getByPlaceholderText('User Name'), 'NewUserName');

    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(expect.any(Object), {
        userName: 'NewUserName',
      });
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Update Completed!');
      expect(mockNavigation.replace).toHaveBeenCalledWith('DrawerNavigation');
    });
  });

});
