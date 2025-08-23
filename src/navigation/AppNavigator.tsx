/*import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/themes/theme';
import { AppTabParamList } from '../types/navigation.types';

// Tab Screens
import DashboardScreen from '../screens/home/DashboardScreen';
import CameraScreen from '../screens/camera/CameraScreen';
import MapScreen from '../screens/map/MapScreen';
import LeaderboardScreen from '../screens/gamification/LeaderboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Stack Screens for deeper navigation
import PhotoPreviewScreen from '../screens/camera/PhotoPreviewScreen';
import VideoPreviewScreen from '../screens/camera/VideoPreviewScreen';
import ViolationReviewScreen from '../screens/reporting/ViolationReviewScreen';
import ReportSubmissionScreen from '../screens/reporting/ReportSubmissionScreen';
import ReportStatusScreen from '../screens/reporting/ReportStatusScreen';
import ReportHistoryScreen from '../screens/reporting/ReportHistoryScreen';
import ViolationDetailsScreen from '../screens/map/ViolationDetailsScreen';
import HeatmapScreen from '../screens/map/HeatmapScreen';
import BadgesScreen from '../screens/gamification/BadgesScreen';
import ChallengesScreen from '../screens/gamification/ChallengesScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import TutorialScreen from '../screens/information/TutorialScreen';
import FAQScreen from '../screens/information/FAQScreen';
import GuidelinesScreen from '../screens/information/GuidelinesScreen';
import NotificationsScreen from '../screens/home/NotificationsScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();
const Stack = createStackNavigator();

// Dashboard Stack
const DashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="DashboardMain" 
      component={DashboardScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Notifications" 
      component={NotificationsScreen}
      options={{ title: 'Notifications' }}
    />
    <Stack.Screen 
      name="ReportHistory" 
      component={ReportHistoryScreen}
      options={{ title: 'My Reports' }}
    />
    <Stack.Screen 
      name="ReportStatus" 
      component={ReportStatusScreen}
      options={{ title: 'Report Status' }}
    />
  </Stack.Navigator>
);

// Camera Stack
const CameraStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="CameraMain" 
      component={CameraScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="PhotoPreview" 
      component={PhotoPreviewScreen}
      options={{ title: 'Review Photo', headerShown: false }}
    />
    <Stack.Screen 
      name="VideoPreview" 
      component={VideoPreviewScreen}
      options={{ title: 'Review Video', headerShown: false }}
    />
    <Stack.Screen 
      name="ViolationReview" 
      component={ViolationReviewScreen}
      options={{ title: 'Report Violation' }}
    />
    <Stack.Screen 
      name="ReportSubmission" 
      component={ReportSubmissionScreen}
      options={{ title: 'Submit Report' }}
    />
  </Stack.Navigator>
);

// Map Stack
const MapStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="MapMain" 
      component={MapScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Heatmap" 
      component={HeatmapScreen}
      options={{ title: 'Violation Heatmap' }}
    />
    <Stack.Screen 
      name="ViolationDetails" 
      component={ViolationDetailsScreen}
      options={{ title: 'Violation Details' }}
    />
  </Stack.Navigator>
);

// Leaderboard Stack
const LeaderboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="LeaderboardMain" 
      component={LeaderboardScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Badges" 
      component={BadgesScreen}
      options={{ title: 'My Badges' }}
    />
    <Stack.Screen 
      name="Challenges" 
      component={ChallengesScreen}
      options={{ title: 'Challenges' }}
    />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="EditProfile" 
      component={EditProfileScreen}
      options={{ title: 'Edit Profile' }}
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
    <Stack.Screen 
      name="Tutorial" 
      component={TutorialScreen}
      options={{ title: 'How to Use' }}
    />
    <Stack.Screen 
      name="FAQ" 
      component={FAQScreen}
      options={{ title: 'FAQ' }}
    />
    <Stack.Screen 
      name="Guidelines" 
      component={GuidelinesScreen}
      options={{ title: 'Guidelines' }}
    />
  </Stack.Navigator>
);

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Camera':
              iconName = focused ? 'camera' : 'camera-outline';
              break;
            case 'Map':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'Leaderboard':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary[500],
        tabBarInactiveTintColor: COLORS.gray[500],
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: COLORS.gray[200],
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraStack}
        options={{
          tabBarLabel: 'Report',
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapStack}
        options={{
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen 
        name="Leaderboard" 
        component={LeaderboardStack}
        options={{
          tabBarLabel: 'Rewards',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;*/