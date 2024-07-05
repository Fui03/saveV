import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';



type StackParamList = {
  DrawerNavigation: undefined;
  ChatList: undefined;
};

const CustomHeader = () => {
    const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

    return (
        <SafeAreaView style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={{marginLeft:10}}>
                <Ionicons name="menu" size={28} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ChatList')}>
                <Ionicons name="chatbubbles-outline" size={28} color="black" style={{marginRight:10}}/>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical:10,
    paddingTop:20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomHeader;
