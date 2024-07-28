import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Home from '../Home';
import fetchMock from 'jest-fetch-mock';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, getDocs, query, orderBy, limit, startAfter, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'


fetchMock.enableMocks();

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('firebase/firestore');

jest.mock('firebase/auth');

const mockCurrentUser = { uid: 'test-uid' };

const mockNavigation = { navigate: jest.fn() };

describe('Home', () => {

    beforeEach(() => {
        jest.resetAllMocks();
        fetchMock.resetMocks();
        useNavigation.mockReturnValue(mockNavigation);
        getFirestore.mockReturnValue({});
        collection.mockReturnValue({});
        orderBy.mockReturnValue({});
        limit.mockReturnValue({});
        startAfter.mockReturnValue({});
        getAuth.mockReturnValue({
            currentUser: mockCurrentUser,
          });
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => '',
        });
        getDocs.mockResolvedValue({
            docs: [
            {
                id: '1',
                data: () => ({
                title: 'Post 1',
                caption: 'Caption 1',
                spendingRange: 100,
                imageURLs: ['https://example.com/image1.jpg'],
                timestamp: { toDate: () => new Date() },
                likes: 10,
                }),
            },
            {
                id: '2',
                data: () => ({
                title: 'Post 2',
                caption: 'Caption 2',
                spendingRange: 200,
                imageURLs: ['https://example.com/image2.jpg'],
                timestamp: { toDate: () => new Date() },
                likes: 20,
                }),
            },
            ],
        });

    });

    it('Render Correctly', async () => {
        const { getByPlaceholderText, getByTestId } = render(<Home />);

        expect(getByPlaceholderText('Search ......')).toBeTruthy();

        await waitFor(() => expect(getByTestId('flatlist').props.data.length).toBeTruthy());
    });

    it('Search and Navigate to Search Screen', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(['postId1', 'postId2', 'postId3']));

        const { getByPlaceholderText, getByText } = render(<Home />);
        const searchInput = getByPlaceholderText('Search ......');

        fireEvent.changeText(searchInput, 'test search');
        fireEvent(searchInput, 'submitEditing');

        await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith('https://save-elbrpbsd6-savevs-projects.vercel.app/api/search', expect.any(Object));
        });
    });
});
