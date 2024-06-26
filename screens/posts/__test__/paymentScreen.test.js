import React from 'react';
import { render, fireEvent, waitFor} from '@testing-library/react-native';
import PaymentScreen from '../PaymentScreen'; // Adjust the path as necessary
import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';
import { StripeProvider, CardField, useStripe, confirmPayment } from '@stripe/stripe-react-native';
import fetchMock from 'jest-fetch-mock';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useRoute: jest.fn(),
}));

jest.mock('@stripe/stripe-react-native', () => ({
  StripeProvider: ({ children }) => children,
  CardField: jest.fn(),
  useStripe: jest.fn(),
  confirmPayment: jest.fn()
}));

jest.spyOn(Alert, 'alert');

describe('PaymentScreen', () => {
  const mockNavigate = jest.fn();
  const mockRoute = {
    params: {
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      title: 'Test Title',
      caption: 'Test Caption',
      spendingRange: 100,
    },
  };

  const mockConfirmPayment = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
    useNavigation.mockReturnValue({ navigate: mockNavigate });
    useRoute.mockReturnValue(mockRoute);
    useStripe.mockReturnValue({
      confirmPayment: mockConfirmPayment,
    });
  });

  it('Renders Correctly', () => {
    const { getAllByTestId } = render(
      <StripeProvider publishableKey="pk_test_123">
        <PaymentScreen />
      </StripeProvider>
    );
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

  it('Payment Details and Card Input', async () => {
    const { getByText } = render(
      <StripeProvider publishableKey="pk_test_123">
        <PaymentScreen />
      </StripeProvider>
    );
    
    expect(getByText('Payment Details')).toBeTruthy();
    expect(getByText('$ 1.09')).toBeTruthy();
    expect(CardField).toBeTruthy();
  });

  it('Alert when Card Details are Incomplete', async () => {
    const { getByText } = render(
      <StripeProvider publishableKey="pk_test_123">
        <PaymentScreen />
      </StripeProvider>
    );

    fireEvent.press(getByText('Pay'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter complete card details');
    });
  });

});
