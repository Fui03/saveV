import React from 'react';
import { render, fireEvent, waitFor, userEvent } from '@testing-library/react-native';
import Search from '../Search';
import { useRoute } from '@react-navigation/native';
import { getFirestore, getDoc, doc } from 'firebase/firestore';

jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

const mockPostIds = ['post1', 'post2', 'post3', 'post4', 'post5', 'post6', 'post7', 'post8', 'post9', 'post10',
  'post11', 'post12', 'post13', 'post14', 'post15', 'post16', 'post17', 'post18', 'post19', 'post20'];

const mockPostData = (id) => ({
  id,
  title: `Title ${id}`,
  caption: `Caption ${id}`,
  spendingRange: 100,
  imageURLs: [`https://example.com/image${id}.jpg`],
  timestamp: new Date(),
  likes: 0,
});

useRoute.mockReturnValue({
  params: {
    postIds: mockPostIds,
  },
});

describe('Search Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    doc.mockImplementation((db, collection, id) => ({ id }));
    getDoc.mockImplementation((docRef) => {
      const id = docRef.id;
      return Promise.resolve({
        exists: () => true,
        data: () => mockPostData(id),
      });
    });
  });

  it('Renders Correctly', async () => {
    const { findAllByText } = render(<Search />);

    const titles = await waitFor(() => findAllByText(/Title/));
    expect(titles).toHaveLength(10);
  });

  it('Refreshes the Posts', async () => {
    const { getByTestId, findAllByText } = render(<Search />);

    await waitFor(() => findAllByText(/Title/));

    fireEvent(getByTestId('flatlist'), 'onRefresh');

    const titles = await waitFor(() => findAllByText(/Title/));
    expect(titles).toHaveLength(10);

    mockPostIds.slice(0, 10).forEach(postId => {
      expect(titles.find(title => title.props.children === `Title ${postId}`)).toBeTruthy();
    });
  });
});
