import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PreferenceManagement from '../PreferenceManagement';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


jest.mock('@react-navigation/native');
jest.mock('firebase/firestore');
jest.mock('firebase/auth');

describe('Preference Management', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const mockPosts = [
    {
      id: '1',
      title: 'Post 1',
      caption: 'Caption 1',
      spendingRange: 100,
      imageURLs: ['https://example.com/image1.jpg'],
      timestamp: new Date(),
      likes: 10,
    },
    {
      id: '2',
      title: 'Post 2',
      caption: 'Caption 2',
      spendingRange: 200,
      imageURLs: ['https://example.com/image2.jpg'],
      timestamp: new Date(),
      likes: 20,
    },
  ];

  const mockUser = { uid: 'testUser', email: 'test@example.com' };

  beforeEach(() => {
    useNavigation.mockReturnValue(mockNavigation);

    getFirestore.mockReturnValue({});
    
    getAuth.mockReturnValue({
        currentUser: mockUser,
    });
    
    collection.mockReturnValue({
      doc: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
    });
    
    query.mockReturnValue({
      onSnapshot: jest.fn(),
    });
    
    onSnapshot.mockImplementation((query, callback) => {
      callback({
        forEach: (callback) => {
          mockPosts.forEach((post) => callback({ id: post.id, data: () => post }));
        },
      });
      return jest.fn();
    });

  });

  it('Renders Correctly', async () => {
    const { getByText, getByTestId } = render(<PreferenceManagement />);

    expect(getByText('Post 1')).toBeTruthy();
    expect(getByText('Post 2')).toBeTruthy();
    expect(getByTestId('flatlist')).toBeTruthy();

    const flatList = getByTestId('flatlist');
    expect(flatList.props.data.length).toBe(2);
  });

  it('Navigates to PostDetails Screen', async () => {
    const { getByText } = render(<PreferenceManagement />);

    fireEvent.press(getByText('Post 1'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('PostDetails', { post: mockPosts[0] });
  });
});
