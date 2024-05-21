import React from 'react';
import { SafeAreaView, Text, StyleSheet , Button} from 'react-native';
import { getAuth, signOut } from "firebase/auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation} from "@react-navigation/native";




const Home = () => {

  const HandleSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
        navigation.replace('Login');
    }).catch((error) => {

    });
  }
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  return (
    <SafeAreaView style={styles.container}>

      <Button title = "Sign Out" onPress={HandleSignOut}/>
      <Text>Home</Text>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
