// Professional Color Palette for Billboard Detection App
export interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface Colors {
  primary: ColorPalette;
  secondary: ColorPalette;
  success: string;
  warning: string;
  error: string;
  info: string;
  gray: ColorPalette;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
    inverse: string;
  };
  billboard: {
    detection: string;
    violation: string;
    compliance: string;
    pending: string;
    approved: string;
    rejected: string;
  };
  gamification: {
    points: string;
    badge: string;
    achievement: string;
    leaderboard: string;
  };
}

export const COLORS: Colors = {
  // Primary Colors - Authority Blue Theme
  primary: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main secondary - Civic Green
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  
  // Secondary Colors - Civic Green
  secondary: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main secondary - Civic Green
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Status Colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Neutral Colors
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Semantic Colors
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E',
    inverse: '#FFFFFF',
  },
  
  // Billboard specific colors
  billboard: {
    detection: '#E3F2FD',
    violation: '#FFEBEE',
    compliance: '#E8F5E8',
    pending: '#FFF3E0',
    approved: '#E8F5E8',
    rejected: '#FFEBEE',
  },
  
  // Gamification colors
  gamification: {
    points: '#FFD700',
    badge: '#FF6B35',
    achievement: '#9C27B0',
    leaderboard: '#FF9800',
  },
};

// Typography Scale
export interface Typography {
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    '5xl': number;
  };
  lineHeight: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    '5xl': number;
  };
  fontWeight: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
}

export const TYPOGRAPHY: Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
    '4xl': 40,
    '5xl': 56,
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Spacing Scale (8px base unit)
export interface Spacing {
  0: number;
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  8: number;
  10: number;
  12: number;
  16: number;
  20: number;
  24: number;
}

export const SPACING: Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

// Border Radius
export interface Radius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  full: number;
}

export const RADIUS: Radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// Shadows
export interface Shadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Shadows {
  sm: Shadow;
  md: Shadow;
  lg: Shadow;
  xl: Shadow;
}

export const SHADOWS: Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,
    elevation: 9,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

// Animation Durations
export interface Animations {
  fast: number;
  normal: number;
  slow: number;
}

export const ANIMATIONS: Animations = {
  fast: 150,
  normal: 300,
  slow: 500,
};