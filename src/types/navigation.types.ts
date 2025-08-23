import { StackScreenProps } from '@react-navigation/stack';

// Auth Stack Parameter List
export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: {
    email: string;
    type?: 'signup' | 'forgot_password';
  };
  ForgotPassword: undefined;
  ResetPassword: {
    email: string;
  };
  ProfileSetup: undefined;
};

// Auth Stack Screen Props
export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  StackScreenProps<AuthStackParamList, T>;

// Main App Stack Parameter List (for future use)
export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
  // Add more main app screens as needed
};

// Main App Stack Screen Props
export type AppStackScreenProps<T extends keyof AppStackParamList> = 
  StackScreenProps<AppStackParamList, T>;

// Root Stack Parameter List (combines auth and main app)
export type RootStackParamList = {
  AuthStack: undefined;
  AppStack: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  StackScreenProps<RootStackParamList, T>;