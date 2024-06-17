import 'react-native-gesture-handler';
import React from 'react';
import Navigator from './routes/authStack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StripeProvider } from '@stripe/stripe-react-native';



const App = () => {
  return (
    <StripeProvider publishableKey="pk_test_51PSCEFJibWimjq7AqVa6XGIaZ7TQYtUH2HhPBm267Kl0VYABHZ2SqzsPxJFPVsURdYewQXvOTB52bzYdqMGKVqaP00KLq93nh1">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Navigator/>
      </GestureHandlerRootView>
    </StripeProvider>

  );
};



export default App;
