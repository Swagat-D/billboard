import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface DetectionData {
  mediaUri: string;
  mediaType: 'photo' | 'video';
  location: LocationData;
  timestamp: string;
}

export interface ViolationResult {
  type: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  description?: string;
}

export interface DetectionResult {
  id: string;
  violations: ViolationResult[];
  confidence: number;
  processedAt: string;
  metadata?: {
    imageSize?: { width: number; height: number };
    processingTime?: number;
    modelVersion?: string;
    saved?: boolean;
    savedAt?: string;
  };
}

export interface CameraState {
  currentLocation: LocationData | null;
  detectionResult: DetectionResult | null;
  isDetecting: boolean;
  error: string | null;
  lastDetectionId: string | null;
  detectionHistory: DetectionResult[];
}

// Mock API service for AI detection
const mockDetectionAPI = {
  async detectViolation(data: DetectionData): Promise<DetectionResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock detection results
    const mockViolations: ViolationResult[] = [
      {
        type: 'Oversized Billboard',
        confidence: 87,
        boundingBox: { x: 100, y: 150, width: 200, height: 100 },
        description: 'Billboard exceeds maximum allowed size'
      },
      {
        type: 'Illegal Placement',
        confidence: 72,
        boundingBox: { x: 50, y: 200, width: 300, height: 150 },
        description: 'Billboard placed in restricted zone'
      }
    ];

    // Randomly decide if violations are found
    const hasViolations = Math.random() > 0.3;
    
    return {
      id: `detection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      violations: hasViolations ? mockViolations : [],
      confidence: hasViolations ? 79 : 95,
      processedAt: new Date().toISOString(),
      metadata: {
        imageSize: { width: 1920, height: 1080 },
        processingTime: 1847,
        modelVersion: '2.1.0'
      }
    };
  }
};

// Async thunks
export const detectViolation = createAsyncThunk<
  DetectionResult,
  DetectionData,
  { rejectValue: string }
>(
  'camera/detectViolation',
  async (detectionData, { rejectWithValue }) => {
    try {
      console.log('🔍 Starting AI detection...', {
        mediaType: detectionData.mediaType,
        location: detectionData.location,
        timestamp: detectionData.timestamp
      });

      const result = await mockDetectionAPI.detectViolation(detectionData);
      
      console.log('✅ Detection completed:', {
        detectionId: result.id,
        violationsFound: result.violations.length,
        confidence: result.confidence
      });

      return result;
    } catch (error: any) {
      console.error('❌ Detection error:', error);
      return rejectWithValue(error.message || 'AI detection failed');
    }
  }
);

export const saveDetectionResult = createAsyncThunk<
  { saved: boolean; detectionId: string },
  { detectionResult: DetectionResult; mediaUri: string },
  { rejectValue: string }
>(
  'camera/saveDetectionResult',
  async ({ detectionResult, mediaUri }, { rejectWithValue }) => {
    try {
      // Mock saving to local storage or API
      console.log('💾 Saving detection result:', {
        detectionId: detectionResult.id,
        mediaUri: mediaUri.substring(0, 50) + '...',
        violations: detectionResult.violations.length
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        saved: true,
        detectionId: detectionResult.id
      };
    } catch (error: any) {
      console.error('❌ Save detection error:', error);
      return rejectWithValue(error.message || 'Failed to save detection result');
    }
  }
);

// Initial state
const initialState: CameraState = {
  currentLocation: null,
  detectionResult: null,
  isDetecting: false,
  error: null,
  lastDetectionId: null,
  detectionHistory: []
};

// Slice
const cameraSlice = createSlice({
  name: 'camera',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<LocationData>) => {
      state.currentLocation = action.payload;
      state.error = null;
      console.log('📍 Location updated:', action.payload);
    },
    
    clearDetectionResult: (state) => {
      state.detectionResult = null;
      state.error = null;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    resetCameraState: () => initialState,
    
    addToDetectionHistory: (state, action: PayloadAction<DetectionResult>) => {
      state.detectionHistory.unshift(action.payload);
      // Keep only last 50 detections
      if (state.detectionHistory.length > 50) {
        state.detectionHistory = state.detectionHistory.slice(0, 50);
      }
    },
    
    clearDetectionHistory: (state) => {
      state.detectionHistory = [];
    },
    
    updateDetectionMetadata: (
      state, 
      action: PayloadAction<{ detectionId: string; metadata: any }>
    ) => {
      if (state.detectionResult?.id === action.payload.detectionId) {
        state.detectionResult.metadata = {
          ...state.detectionResult.metadata,
          ...action.payload.metadata
        };
      }
      
      const historyIndex = state.detectionHistory.findIndex(
        detection => detection.id === action.payload.detectionId
      );
      if (historyIndex !== -1) {
        state.detectionHistory[historyIndex].metadata = {
          ...state.detectionHistory[historyIndex].metadata,
          ...action.payload.metadata
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Detect Violation
      .addCase(detectViolation.pending, (state) => {
        state.isDetecting = true;
        state.error = null;
        state.detectionResult = null;
      })
      .addCase(detectViolation.fulfilled, (state, action) => {
        state.isDetecting = false;
        state.detectionResult = action.payload;
        state.lastDetectionId = action.payload.id;
        state.error = null;
        
        // Add to history
        state.detectionHistory.unshift(action.payload);
        if (state.detectionHistory.length > 50) {
          state.detectionHistory = state.detectionHistory.slice(0, 50);
        }
      })
      .addCase(detectViolation.rejected, (state, action) => {
        state.isDetecting = false;
        state.error = action.payload || 'Detection failed';
        state.detectionResult = null;
      })
      
      // Save Detection Result
      .addCase(saveDetectionResult.pending, (state) => {
        // Keep detecting state as false since this is a background operation
      })
      .addCase(saveDetectionResult.fulfilled, (state, action) => {
        console.log('✅ Detection result saved:', action.payload);
        // Update metadata to mark as saved
        if (state.detectionResult?.id === action.payload.detectionId) {
          state.detectionResult.metadata = {
            ...state.detectionResult.metadata,
            saved: true,
            savedAt: new Date().toISOString()
          };
        }
      })
      .addCase(saveDetectionResult.rejected, (state, action) => {
        console.error('❌ Failed to save detection result:', action.payload);
        // Don't set global error as this is a background operation
      });
  },
});

// Export actions
export const {
  setCurrentLocation,
  clearDetectionResult,
  clearError,
  resetCameraState,
  addToDetectionHistory,
  clearDetectionHistory,
  updateDetectionMetadata
} = cameraSlice.actions;

// Selectors
export const selectCurrentLocation = (state: { camera: CameraState }) => state.camera.currentLocation;
export const selectDetectionResult = (state: { camera: CameraState }) => state.camera.detectionResult;
export const selectIsDetecting = (state: { camera: CameraState }) => state.camera.isDetecting;
export const selectCameraError = (state: { camera: CameraState }) => state.camera.error;
export const selectDetectionHistory = (state: { camera: CameraState }) => state.camera.detectionHistory;
export const selectLastDetectionId = (state: { camera: CameraState }) => state.camera.lastDetectionId;

// Export reducer
export default cameraSlice.reducer;