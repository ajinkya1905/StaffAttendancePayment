import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  HomeScreen,
  AddStaffScreen,
  StaffDetailScreen,
  AttendanceScreen,
  PaymentsScreen,
  SettingsScreen,
} from '../screens';
import { COLORS, FONTS, SIZES } from '../styles/theme';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: COLORS.surface,
  },
  headerTintColor: COLORS.text,
  headerTitleStyle: {
    ...FONTS.semiBold,
    fontSize: SIZES.lg,
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: COLORS.background,
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={screenOptions}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddStaff"
          component={AddStaffScreen}
          options={({ route }) => ({
            title: route.params?.staff ? 'Edit Staff' : 'Add Staff',
          })}
        />
        <Stack.Screen
          name="StaffDetail"
          component={StaffDetailScreen}
          options={{ title: 'Staff Details' }}
        />
        <Stack.Screen
          name="Attendance"
          component={AttendanceScreen}
          options={{ title: 'Mark Attendance' }}
        />
        <Stack.Screen
          name="Payments"
          component={PaymentsScreen}
          options={{ title: 'Payment History' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
