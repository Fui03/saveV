import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Chat from '../Chat';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs, arrayUnion, orderBy, limit , startAfter, onSnapshot} from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  updateDoc: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
  arrayUnion: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
  startAfter:jest.fn(),
  onSnapshot: jest.fn(),
  serverTimestamp: jest.fn(() => ({ toDate: () => new Date() })),
}));
  

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

const mockUser = { uid: 'testUserId', email: 'test@test.com' };

const mockChatRoom = {
  id: 'chatRoomId',
  participants: ['testUserId', 'userId'],
};

const mockMessages = [
  { id: 'msg1', text: 'Hello', senderId: 'testUserId', createdAt: { toDate: () => new Date() } },
  { id: 'msg2', text: 'Hi', senderId: 'userId', createdAt: { toDate: () => new Date() } },
];
const mockMessages2 = [
  { id: 'msg3', text: 'Hello', senderId: 'testUserId', createdAt: { toDate: () => new Date() } },
  { id: 'msg4', text: 'Hi', senderId: 'userId', createdAt: { toDate: () => new Date() } },
];

const mockNavigation = {
  replace: jest.fn(),
  navigate: jest.fn(),
  reset: jest.fn(),
  addListener: jest.fn(),
  focusListener: jest.fn(),
};

useRoute.mockReturnValue({
  params: {
    userId: 'userId',
  },
});

describe('Chat', () => {
  beforeAll(() => {

    useNavigation.mockReturnValue(mockNavigation);

    getAuth.mockReturnValue({
      currentUser: mockUser,
    });

    getFirestore.mockReturnValue({});

    collection.mockReturnValue({
      doc: jest.fn().mockReturnThis(),
      addDoc: jest.fn(),
      get: jest.fn(),
    });

    addDoc.mockImplementation((collectionPath, data) => {
        return Promise.resolve({
          id: 'mockDocumentId',
          ...data, 
        });
      });
      
    updateDoc.mockResolvedValue({});

    getDoc.mockResolvedValue({ exists: jest.fn().mockReturnValue(true), data: jest.fn().mockReturnValue(mockUser) });
    
    getDocs.mockResolvedValue({
      forEach: jest.fn((callback) => {
        callback({
          id: '1',
          data: () => ({
            participants: ['user1', 'user2'],
            messages: ['Hello', 'Hi']
          })
        });
      }),

      docs: mockMessages2.map((msg, index) => ({
        id: msg.id,
        data: () => msg,
      }))
    });


    orderBy.mockReturnValue({ createdAt: 'desc' }); 

    limit.mockReturnThis(15);

    startAfter.mockResolvedValue(jest.fn());

    onSnapshot.mockImplementation((query, callback) => {
        const unsubscribe = jest.fn();
        callback({
          docChanges: jest.fn().mockReturnValue(mockMessages.map((msg, index) => ({
            type: 'added',
            doc: {
              id: msg.id,
              data: () => msg,
            }
          }))),
        });
        return unsubscribe;
      });
  });

  it('renders correctly', async () => {
    const { getByPlaceholderText, getByText } = render(<Chat />);

    await act(async () => {
        expect(getByPlaceholderText('Type your message')).toBeTruthy();
    })
  });

  it('sends a message', async () => {
    const { getByPlaceholderText, getByText, getByTestId } = render(<Chat />);

    const input = getByPlaceholderText('Type your message');
    const sendButton = getByTestId('send');

    fireEvent.changeText(input, 'New message');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledTimes(2);
      expect(updateDoc).toHaveBeenCalledTimes(2); 
    });
  });

  it('fetches messages on load', async () => {
    const { getAllByText } = render(<Chat />);

    await waitFor(() => {
      expect(getAllByText('Hello')).toBeTruthy();
      expect(getAllByText('Hi')).toBeTruthy();
    });
  });

  it('creates or joins chat room on load', async () => {
    render(<Chat />);

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
    });
  });

});
