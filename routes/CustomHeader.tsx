import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';



type StackParamList = {
  DrawerNavigation: undefined;
  ChatList: undefined;
};

const CustomHeader = () => {
    const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

    return (
        <SafeAreaView style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                <Ionicons name="menu" size={28} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ChatList')}>
                <Ionicons name="chatbubbles-outline" size={28} color="black" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // padding: 10,
    paddingHorizontal:10,
    backgroundColor: 'white',
    height: 70
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomHeader;
