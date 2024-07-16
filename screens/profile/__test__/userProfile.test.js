import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import UserProfile from '../UserProfile';
import { getAuth } from 'firebase/auth';
import { getDoc, getFirestore, collection, getDocs } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';

jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useRoute: jest.fn(),
}));

const mockUserData = {
    userName: 'Test User',
    profilePic: 'https://example.com/profile.jpg',
    posts: [
        { id: '1', title: 'Post 1', caption: 'Caption 1', spendingRange: 1, imageURLs: ['https://example.com/post1.jpg'], timestamp: new Date(), likes: 0 },
        { id: '2', title: 'Post 2', caption: 'Caption 2', spendingRange: 1, imageURLs: ['https://example.com/post2.jpg'], timestamp: new Date(), likes: 0 },
    ],
};

const mockGetDoc = jest.fn(() => ({
    exists: () => true,
    data: () => mockUserData,
}));

const mockGetDocs = jest.fn(() => ({
    docs: mockUserData.posts.map(post => ({ id: post.id, data: () => post })),
}));

const mockNavigation = { navigate: jest.fn() };


getAuth.mockReturnValue({ currentUser: { uid: 'test-uid' } });
getFirestore.mockReturnValue({});
getDoc.mockImplementation(mockGetDoc);
getDocs.mockImplementation(mockGetDocs);
useRoute.mockReturnValue({ params: { userId: 'test-user-id', userData: mockUserData } });
useNavigation.mockReturnValue(mockNavigation);

describe('UserProfile', () => {
    it('Renders Correctly', async () => {
        const { getByText, getByTestId } = render(<UserProfile />);

        await waitFor(() => {
            expect(getByText('Test User')).toBeTruthy();
            expect(getByTestId('profile-pic').props.source.uri).toBe(mockUserData.profilePic);
        });
    });

    it('Fetches Posts Correctly', async () => {
        const { getByTestId } = render(<UserProfile />);

        await waitFor(() => {
            expect(mockUserData.posts).toBeDefined();
            mockUserData.posts.forEach(post => {
                expect(getByTestId(`post-image-${post.id}`)).toBeTruthy();
            });
        });
    });

    it('Navigates to Chat Screen', async () => {
        const { getByText } = render(<UserProfile />);
        
        const button = getByText('Send Message');
        fireEvent.press(button);
        
        await waitFor(() => {
            expect(mockNavigation.navigate).toHaveBeenCalledWith('Chat', { userId: 'test-user-id' });
        });
    });
        
});
