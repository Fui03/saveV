import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Profile from '../Profile';
import { getAuth, signOut } from "firebase/auth";
import { collection, doc, getDocs, getFirestore, onSnapshot, query, where, setDoc, startAfter, orderBy } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    onSnapshot: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    setDoc: jest.fn(),
    startAfter: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
}));

jest.mock('firebase/storage', () => ({
    getStorage: jest.fn(),
    ref: jest.fn(),
    getDownloadURL: jest.fn(),
    uploadBytesResumable: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
    launchImageLibraryAsync: jest.fn(),
    requestMediaLibraryPermissionsAsync: jest.fn(),
    MediaTypeOptions: jest.fn(),
}));

const mockUser = {
    uid: 'testUserId',
    displayName: 'Test User',
    email: 'test@example.com',
};

const mockUserData = {
    role: 'normal',
    userName: 'Test User',
    profilePic: 'https://example.com/profile.jpg',
};

const mockPosts = [
    {
        id: 'post1',
        title: 'Post 1',
        caption: 'Caption 1',
        spendingRange: 100,
        imageURLs: ['https://example.com/image1.jpg'],
        timestamp: { toDate: () => new Date() },
        likes: 10,
    },
];

const mockNavigation = {
    navigate: jest.fn(),
};

global.fetch = jest.fn(() =>
    Promise.resolve({
        blob: () => Promise.resolve(new Blob()),
    })
);

const mockStorageRef = {};
const mockUploadTask = {
    on: jest.fn((event, progress, error, success) => {
        if (event === 'state_changed') {
            success();
        }
    }),
    snapshot: {
        ref: { getDownloadURL: jest.fn().mockResolvedValue('https://example.com/new-profile-pic.jpg') },
    },
};

getStorage.mockReturnValue({});
ref.mockReturnValue(mockStorageRef);
uploadBytesResumable.mockReturnValue(mockUploadTask);


describe('Profile', () => {
    beforeAll(() => {
        jest.clearAllMocks();

        getAuth.mockReturnValue({
            currentUser: mockUser,
        });

        getFirestore.mockReturnValue({});

        useNavigation.mockReturnValue(mockNavigation);

        onSnapshot.mockImplementation((docRef, callback) => {
            callback({
                exists: jest.fn().mockReturnValue(true),
                data: jest.fn().mockReturnValue(mockUserData),
            });
            return jest.fn();
        });

        getDocs.mockResolvedValue({
            docs: mockPosts.map(post => ({
                id: post.id,
                data: () => post,
            })),
        });

        getDownloadURL.mockResolvedValue('https://example.com/profile.jpg');
    });

    it('Renders User Profile Correctly', async () => {
        const { getByText, getByTestId } = render(<Profile />);

        await waitFor(() => {
            expect(getByText('Test User')).toBeTruthy();
            expect(getByText(mockUser.uid)).toBeTruthy();
        });

        const profilePic = getByTestId('profile-pic');
        expect(profilePic.props.source.uri).toBe(mockUserData.profilePic);
    });

    it('Handles Image Upload Correctly', async () => {
        ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
            granted: true,
        });
        ImagePicker.launchImageLibraryAsync.mockResolvedValue({
            canceled: false,
            mediaType: 'photo',
            assets: [{ uri: 'file://mock-image.jpg' }],
        });

        const { getByTestId } = render(<Profile />);

        const profilePic = getByTestId('profile-pic');
        fireEvent.press(profilePic);

        await waitFor(() => {
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
        });
    });

});
