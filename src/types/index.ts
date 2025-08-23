// User Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  nickname?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: Address;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  isActive: boolean;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  notifications: {
    reportStatus: boolean;
    gamification: boolean;
    system: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
  };
  privacy: {
    shareLocation: boolean;
    shareStats: boolean;
    publicProfile: boolean;
  };
  app: {
    language: string;
    darkMode: boolean;
    autoDetection: boolean;
  };
}

export interface UserStats {
  reportsSubmitted: number;
  reportsVerified: number;
  reportsRejected: number;
  totalPoints: number;
  badges: Badge[];
  accuracy: number;
  rank: number;
  streak: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?: Coordinates;
}

// Location Types
export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

export interface Location {
  coordinates: Coordinates;
  address?: string;
  timestamp: Date;
}

// Report Types
export interface ViolationReport {
  id: string;
  userId: string;
  user?: User;
  violationType: ViolationType;
  status: ReportStatus;
  evidence: Evidence[];
  location: Location;
  description?: string;
  dimensions?: Dimensions;
  aiDetectionResults?: AIDetectionResult;
  submittedAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
  pointsAwarded?: number;
  isPublic: boolean;
}

export interface Evidence {
  id: string;
  type: 'image' | 'video';
  uri: string;
  thumbnailUri?: string;
  size: number;
  duration?: number; // for videos
  timestamp: Date;
}

export interface Dimensions {
  width: number;
  height: number;
  area: number;
  unit: 'meters' | 'feet';
}

export type ViolationType = 
  | 'oversized'
  | 'improper_placement'
  | 'structural_hazard'
  | 'content_violation'
  | 'no_permit'
  | 'other';

export type ReportStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'resolved'
  | 'rejected';

// AI Detection Types
export interface AIDetectionResult {
  confidence: number;
  detectedViolations: DetectedViolation[];
  dimensions?: EstimatedDimensions;
  structuralAnalysis?: StructuralAnalysis;
  contentAnalysis?: ContentAnalysis;
  complianceCheck?: ComplianceCheck;
  processingTime: number;
  timestamp: Date;
}

export interface DetectedViolation {
  type: ViolationType;
  confidence: number;
  boundingBox?: BoundingBox;
  description: string;
}

export interface EstimatedDimensions {
  width: number;
  height: number;
  area: number;
  confidence: number;
  referenceObjects?: string[];
}

export interface StructuralAnalysis {
  stability: 'stable' | 'unstable' | 'critical';
  issues: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ContentAnalysis {
  hasText: boolean;
  language?: string;
  textContent?: string[];
  inappropriateContent: boolean;
  categories: string[];
}

export interface ComplianceCheck {
  sizeCompliant: boolean;
  placementCompliant: boolean;
  permitRequired: boolean;
  regulations: string[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt?: Date;
  progress?: number;
  requirement: number | string;
  category: BadgeCategory;
}

export type BadgeCategory = 
  | 'reporting'
  | 'accuracy' 
  | 'participation'
  | 'safety'
  | 'community';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  target: number;
  progress: number;
  reward: number; // points
  badge?: Badge;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  participants: number;
}

export type ChallengeType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'special_event';

export interface LeaderboardEntry {
  rank: number;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'nickname' | 'avatar'>;
  points: number;
  reportsCount: number;
  accuracy: number;
  badges: Badge[];
  isCurrentUser?: boolean;
}

// Map Types
export interface MapViolation {
  id: string;
  coordinates: Coordinates;
  violationType: ViolationType;
  status: ReportStatus;
  submittedAt: Date;
  isResolved: boolean;
}

export interface HeatmapData {
  coordinates: Coordinates;
  intensity: number;
  violationCount: number;
  types: ViolationType[];
}

export interface MapCluster {
  id: string;
  coordinates: Coordinates;
  violationCount: number;
  radius: number;
  violations: MapViolation[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface ReportForm {
  violationType: ViolationType;
  description?: string;
  estimatedWidth?: number;
  estimatedHeight?: number;
  additionalNotes?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'report_status_update'
  | 'points_earned'
  | 'badge_earned'
  | 'challenge_completed'
  | 'system_announcement';

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Camera Types
export interface CameraConfig {
  aspectRatio: '4:3' | '16:9';
  quality: 'low' | 'medium' | 'high';
  flashMode: 'on' | 'off' | 'auto';
  focusMode: 'on' | 'off';
  whiteBalance: 'auto' | 'sunny' | 'cloudy' | 'shadow' | 'incandescent' | 'fluorescent';
}

export interface CapturedMedia {
  uri: string;
  type: 'image' | 'video';
  size: number;
  duration?: number;
  timestamp: Date;
}

// Filter Types
export interface ReportFilters {
  status?: ReportStatus[];
  violationType?: ViolationType[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  location?: {
    coordinates: Coordinates;
    radius: number; // in meters
  };
  sortBy?: 'date' | 'status' | 'type' | 'location';
  sortOrder?: 'asc' | 'desc';
}

export interface MapFilters {
  violationTypes?: ViolationType[];
  status?: ReportStatus[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  showResolved?: boolean;
}

// App State Types
export interface AppState {
  isOnline: boolean;
  isBackground: boolean;
  permissions: {
    camera: boolean;
    location: boolean;
    notifications: boolean;
  };
  settings: {
    darkMode: boolean;
    language: string;
    autoSync: boolean;
  };
}