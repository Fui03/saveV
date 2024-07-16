import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatList from '../ChatList';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn().mockImplementation((...args) => ({ id: args[1] })),
  onSnapshot: jest.fn(),
  getDoc: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

const mockUser = { uid: 'testUserId' };

const mockChatRooms = [
  {
    id: 'chatRoom1',
    participants: ['testUserId', 'userId1'],
    lastMessage: 'Hello User1',
    lastMessageTime: { toDate: () => new Date() },
  },
];

const mockUserProfiles = {
  userId1: { userName: 'User 1', profilePic: 'https://example.com/user1.jpg' },
  userId2: { userName: 'User 2', profilePic: 'https://example.com/user2.jpg' },
};

const mockNavigation = {
  navigate: jest.fn(),
};

describe('ChatList', () => {
  beforeAll(() => {
    useNavigation.mockReturnValue(mockNavigation);

    getAuth.mockReturnValue({
      currentUser: mockUser,
    });

    getFirestore.mockReturnValue({});

    collection.mockReturnThis();
    query.mockReturnThis();
    where.mockReturnThis();
    onSnapshot.mockImplementation((query, callback) => {
      setTimeout(() => {
        callback({
          docs: mockChatRooms.map(chatRoom => ({
            id: chatRoom.id,
            data: () => chatRoom,
          })),
        });
      }, 100); 
      return jest.fn();
    });

    getDoc.mockImplementation((docRef) => {
      const userId = docRef.id;
      return Promise.resolve({
        exists: jest.fn().mockReturnValue(true),
        data: jest.fn().mockReturnValue(mockUserProfiles[userId]),
      });
    });
  });

  it('renders correctly', async () => {
    const { getByPlaceholderText, getByText } = render(<ChatList />);

    await waitFor(() => {
      expect(getByPlaceholderText('Search by userId')).toBeTruthy();
    });

    await waitFor(() => {
      expect(getByText('Hello User1')).toBeTruthy();
    });
  });

  it('navigates to user profile on search', async () => {
    const { getByPlaceholderText } = render(<ChatList />);
    const searchInput = getByPlaceholderText('Search by userId');

    fireEvent.changeText(searchInput, 'userId1');
    fireEvent(searchInput, 'submitEditing');

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('UserProfile', { userId: 'userId1' });
    });
  });

  it('navigates to chat room on chat room press', async () => {
    const { getByTestId } = render(<ChatList />);

    const chatRoom1 = await waitFor(() => getByTestId('user'));
    fireEvent.press(chatRoom1);

    await waitFor(() => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Chat', { userId: 'userId1' });
    });

  });
});
