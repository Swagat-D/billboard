import { StackScreenProps } from "@react-navigation/stack";

export type NavigatorScreenParams<ParamList = Record<string, object | undefined>> = {
  screen?: never;
  params?: never;
  initial?: never;
  path?: never;
} & {
  [K in keyof ParamList]: undefined extends ParamList[K]
    ? { screen: K; params?: ParamList[K] }
    : { screen: K; params: ParamList[K] };
}[keyof ParamList];

// Root Stack Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppTabParamList>;
};

// Auth Stack Navigator
export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  OTPVerification: {
    phoneNumber?: string;
    email?: string;
    verificationType: 'phone' | 'email';
  };
  ProfileSetup: {
    userId: string;
  };
};

// Main App Tab Navigator
export type AppTabParamList = {
  Dashboard: undefined;
  Camera: undefined;
  Map: undefined;
  Profile: undefined;
  Leaderboard: undefined;
};

// Dashboard Stack
export type DashboardStackParamList = {
  Home: undefined;
  Statistics: undefined;
  Notifications: undefined;
  ReportHistory: undefined;
  ReportDetails: {
    reportId: string;
  };
};

// Camera Stack
export type CameraStackParamList = {
  CameraView: undefined;
  PhotoPreview: {
    imageUri: string;
    detectionResults?: AIDetectionResult;
  };
  VideoPreview: {
    videoUri: string;
    detectionResults?: AIDetectionResult;
  };
  ViolationReview: {
    evidenceUri: string;
    evidenceType: 'image' | 'video';
    location?: LocationCoordinates;
    detectionResults?: AIDetectionResult;
  };
  ReportSubmission: {
    reportData: ViolationReportData;
  };
  ReportSuccess: {
    reportId: string;
    pointsEarned: number;
  };
};

// Map Stack
export type MapStackParamList = {
  MapView: undefined;
  Heatmap: undefined;
  ViolationDetails: {
    violationId: string;
    coordinates: LocationCoordinates;
  };
  NearbyViolations: {
    userLocation: LocationCoordinates;
  };
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileView: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Privacy: undefined;
  Tutorial: undefined;
  FAQ: undefined;
  Guidelines: undefined;
  About: undefined;
};

// Gamification Stack
export type GamificationStackParamList = {
  LeaderboardView: undefined;
  Badges: undefined;
  Challenges: undefined;
  Rewards: undefined;
  UserProfile: {
    userId: string;
  };
};



// Common Types
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

export interface AIDetectionResult {
  violationType?: ViolationType;
  confidence: number;
  dimensions?: {
    width: number;
    height: number;
    area: number;
  };
  structuralIssues?: string[];
  contentAnalysis?: {
    hasText: boolean;
    language?: string;
    inappropriateContent?: boolean;
  };
  complianceCheck?: {
    sizeCompliant: boolean;
    placementCompliant: boolean;
    permitRequired: boolean;
  };
}

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<
  AuthStackParamList,
  T
>;

export interface ViolationReportData {
  evidenceUri: string;
  evidenceType: 'image' | 'video';
  location: LocationCoordinates;
  address?: string;
  violationType: ViolationType;
  description?: string;
  dimensions?: {
    estimatedWidth: number;
    estimatedHeight: number;
  };
  detectionResults?: AIDetectionResult;
  timestamp: Date;
}

export type ViolationType = 
  | 'oversized'
  | 'improper_placement'
  | 'structural_hazard'
  | 'content_violation'
  | 'no_permit'
  | 'other';

// Screen Props Types
export interface ScreenProps<T extends keyof any> {
  route: {
    params: T;
  };
  navigation: any;
}