import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../store';
import { checkAuthStatus } from '../store/slices/authSlice';

// Navigators
import AuthNavigator from './AuthNavigator';
//import AppNavigator from './AppNavigator';
//import SplashScreen from '../screens/auth/SplashScreen';
import { RootStackParamList } from '../types/navigation.types';
import { APP_CONFIG } from '../constants/app';

const Stack = createStackNavigator<RootStackParamList>();

const MainNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const initializeApp = async() => {
      await dispatch(checkAuthStatus());

      setTimeout(() => {
        setShowSplash(false);
      }, APP_CONFIG.SPLASH_DURATION);
    };

    initializeApp();
  }, [dispatch]);

  /*if (showSplash) {
    return <SplashScreen />
  }*/

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated && user ? (
        // User is authenticated - show main app navigation
        <Stack.Screen 
          name="App" 
          component={AuthNavigator} 
        />
      ) : (
        // User is not authenticated - show auth navigation
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator} 
        />
      )}
    </Stack.Navigator>
  );
};

export default MainNavigator;