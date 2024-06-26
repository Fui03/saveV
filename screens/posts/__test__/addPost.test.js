import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddPost from '../AddPost'; // Adjust the path as necessary
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('AddPost', () => {
  const mockNavigate = jest.fn();
  const mockRoute = {
    params: {
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigation.mockReturnValue({ navigate: mockNavigate });
    useRoute.mockReturnValue(mockRoute);
  });


  it('Renders Correctly', () => {
    const { getAllByTestId } = render(<AddPost />);

    const images = getAllByTestId(/image-\d+/);

    const uniqueImages = images.reduce((unique, image) => {
        const uri = image.props.source.uri;
        if (!unique.some(img => img.props.source.uri === uri)) {
          unique.push(image);
        }
        return unique;
      }, []);

    expect(uniqueImages.length).toBe(2);
    expect(uniqueImages[0].props.source.uri).toBe('https://example.com/image2.jpg');
    expect(uniqueImages[1].props.source.uri).toBe('https://example.com/image1.jpg');
  });

  it('Updates Title, Caption, and Spending Range', () => {
    const { getByPlaceholderText } = render(<AddPost />);

    const titleInput = getByPlaceholderText('Enter Title');
    fireEvent.changeText(titleInput, 'My Title');
    expect(titleInput.props.value).toBe('My Title');

    const captionInput = getByPlaceholderText('Enter caption');
    fireEvent.changeText(captionInput, 'My Caption');
    expect(captionInput.props.value).toBe('My Caption');

    const spendingInput = getByPlaceholderText('Spending Range');
    fireEvent.changeText(spendingInput, '100');
    expect(spendingInput.props.value).toBe('100');
  });

  it('Navigates to PaymentScreen', async () => {
    const { getByPlaceholderText, getByText } = render(<AddPost />);

    fireEvent.changeText(getByPlaceholderText('Enter Title'), 'My Title');
    fireEvent.changeText(getByPlaceholderText('Enter caption'), 'My Caption');
    fireEvent.changeText(getByPlaceholderText('Spending Range'), '100');

    fireEvent.press(getByText('Save Post'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('PaymentScreen', {
        images: mockRoute.params.images,
        title: 'My Title',
        caption: 'My Caption',
        spendingRange: 100,
      });
    });
  });

  it('Alert when Fields are Missing', async () => {
    const { getByText } = render(<AddPost />);

    fireEvent.press(getByText('Save Post'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Fill in all the details needed!');
    });
  });
});
