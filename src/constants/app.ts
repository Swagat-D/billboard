export const APP_CONFIG = {
  // App Info
  APP_NAME: 'Billboard Detective',
  VERSION: '1.0.0',
  
  // Timing
  SPLASH_DURATION: 4000, 
  CAMERA_DETECTION_DELAY: 500,
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds
  
  // Limits
  MAX_REPORT_IMAGES: 5,
  MAX_VIDEO_DURATION: 60, // seconds
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_PASSWORD_LENGTH: 8,
  
  // File Settings
  IMAGE_COMPRESSION_QUALITY: 0.8,
  IMAGE_MAX_WIDTH: 1920,
  IMAGE_MAX_HEIGHT: 1080,
  
  // Location
  LOCATION_ACCURACY: 'high' as const,
  LOCATION_TIMEOUT: 15000,
  
  // Gamification
  POINTS: {
    FIRST_REPORT: 50,
    SUCCESSFUL_REPORT: 10,
    VERIFIED_REPORT: 25,
    WEEKLY_STREAK: 5,
    MONTHLY_CHALLENGE: 100,
  },
  
  // API
  REQUEST_TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  
  // Camera
  CAMERA_ASPECT_RATIO: '16:9' as const,
  DETECTION_CONFIDENCE_THRESHOLD: 0.7,
  
  // Map
  DEFAULT_MAP_DELTA: {
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  
  // Notifications
  NOTIFICATION_CATEGORIES: {
    REPORT_STATUS: 'report_status',
    GAMIFICATION: 'gamification',
    SYSTEM: 'system',
  },
};

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  AGE_MIN: 1,
  AGE_MAX: 120,
} as const;

export interface APIConfig {
  BASE_URL: string;
  TIMEOUT: number;
  HEADERS: Record<string, string>;
}

export const API_CONFIG: APIConfig = {
  BASE_URL: __DEV__ ? 'http://192.168.145.210:5000/api' : 'http://134.209.159.190/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// API Endpoints
export const API_ENDPOINTS = {  
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_OTP: '/auth/verify-otp',
  LOGOUT: '/auth/logout',
  
  // User
  PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  CHANGE_PASSWORD: '/user/change-password',
  
  // Reports
  REPORTS: '/reports',
  SUBMIT_REPORT: '/reports',
  REPORT_DETAILS: '/reports/:id',
  USER_REPORTS: '/reports/user',
  
  // AI Detection
  DETECT_BILLBOARD: '/ai/detect',
  ANALYZE_CONTENT: '/ai/analyze',
  
  // Gamification
  LEADERBOARD: '/gamification/leaderboard',
  USER_STATS: '/gamification/stats',
  BADGES: '/gamification/badges',
  CHALLENGES: '/gamification/challenges',
  
  // Maps
  VIOLATIONS_MAP: '/map/violations',
  HEATMAP_DATA: '/map/heatmap',
  NEARBY_VIOLATIONS: '/map/nearby',
  
  // Upload
  UPLOAD_IMAGE: '/upload/image',
  UPLOAD_VIDEO: '/upload/video',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@billboard_app:auth_token',
  USER_DATA: '@billboard_app:user_data',
  ONBOARDING_COMPLETED: '@billboard_app:onboarding_completed',
  CAMERA_PERMISSIONS: '@billboard_app:camera_permissions',
  LOCATION_PERMISSIONS: '@billboard_app:location_permissions',
  NOTIFICATION_SETTINGS: '@billboard_app:notification_settings',
  DRAFT_REPORTS: '@billboard_app:draft_reports',
  APP_SETTINGS: '@billboard_app:app_settings',
};

// Violation Types
export const VIOLATION_TYPES = {
  OVERSIZED: {
    id: 'oversized',
    label: 'Oversized Billboard',
    description: 'Billboard exceeds permitted dimensions',
    icon: 'resize-outline',
    color: '#FF6B35',
  },
  IMPROPER_PLACEMENT: {
    id: 'improper_placement',
    label: 'Improper Placement',
    description: 'Billboard placed in restricted area',
    icon: 'location-outline',
    color: '#FF9800',
  },
  STRUCTURAL_HAZARD: {
    id: 'structural_hazard',
    label: 'Structural Hazard',
    description: 'Billboard poses safety risk',
    icon: 'warning-outline',
    color: '#F44336',
  },
  CONTENT_VIOLATION: {
    id: 'content_violation',
    label: 'Content Violation',
    description: 'Inappropriate or illegal content',
    icon: 'eye-off-outline',
    color: '#9C27B0',
  },
  NO_PERMIT: {
    id: 'no_permit',
    label: 'No Permit',
    description: 'Billboard lacks proper permits',
    icon: 'document-outline',
    color: '#795548',
  },
  OTHER: {
    id: 'other',
    label: 'Other Violation',
    description: 'Other regulatory violation',
    icon: 'help-circle-outline',
    color: '#607D8B',
  },
} as const;

// Report Status
export const REPORT_STATUS = {
  DRAFT: {
    id: 'draft',
    label: 'Draft',
    color: '#9E9E9E',
    icon: 'create-outline',
  },
  SUBMITTED: {
    id: 'submitted',
    label: 'Submitted',
    color: '#2196F3',
    icon: 'paper-plane-outline',
  },
  UNDER_REVIEW: {
    id: 'under_review',
    label: 'Under Review',
    color: '#FF9800',
    icon: 'time-outline',
  },
  VERIFIED: {
    id: 'verified',
    label: 'Verified',
    color: '#4CAF50',
    icon: 'checkmark-circle-outline',
  },
  RESOLVED: {
    id: 'resolved',
    label: 'Resolved',
    color: '#4CAF50',
    icon: 'checkmark-done-outline',
  },
  REJECTED: {
    id: 'rejected',
    label: 'Rejected',
    color: '#F44336',
    icon: 'close-circle-outline',
  },
} as const;

// Badge Types
export const BADGE_TYPES = {
  FIRST_REPORT: {
    id: 'first_report',
    name: 'First Reporter',
    description: 'Submitted your first violation report',
    icon: 'trophy-outline',
    color: '#FFD700',
    requirement: 1,
  },
  FREQUENT_REPORTER: {
    id: 'frequent_reporter',
    name: 'Frequent Reporter',
    description: 'Submitted 10 violation reports',
    icon: 'medal-outline',
    color: '#FF6B35',
    requirement: 10,
  },
  TOP_CONTRIBUTOR: {
    id: 'top_contributor',
    name: 'Top Contributor',
    description: 'Submitted 50 violation reports',
    icon: 'star-outline',
    color: '#9C27B0',
    requirement: 50,
  },
  ACCURACY_EXPERT: {
    id: 'accuracy_expert',
    name: 'Accuracy Expert',
    description: '90% of reports verified as valid',
    icon: 'target-outline',
    color: '#4CAF50',
    requirement: 0.9,
  },
  SAFETY_HERO: {
    id: 'safety_hero',
    name: 'Safety Hero',
    description: 'Reported 5 structural hazards',
    icon: 'shield-checkmark-outline',
    color: '#F44336',
    requirement: 5,
  },
} as const;