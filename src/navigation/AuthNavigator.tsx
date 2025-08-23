import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../types/navigation.types';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
//import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
//import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
      initialRouteName="Splash"
    >
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen} 
      />
      
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="OTPVerification" 
        component={OTPVerificationScreen}
        options={{
          title: 'Verify Code',
          headerShown: true,
          headerBackTitleVisible: false,
        }}
      />
      
    </Stack.Navigator>
  );
};

export default AuthNavigator;