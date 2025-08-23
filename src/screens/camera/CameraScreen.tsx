/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Camera, CameraType, CameraView, FlashMode } from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import LoadingOverlay from '../../components/common/LoadingSpinner';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/themes/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  clearDetectionResult,
  detectViolation,
  setCurrentLocation
} from '../../store/slices/cameraSlice';

const { width, height } = Dimensions.get('window');
// const isSmallDevice = width < 375; // Remove unused

interface DetectionOverlayProps {
  detectionResult: any;
  isVisible: boolean;
}

interface CameraControlsProps {
  onTakePhoto: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  canTakePhoto: boolean;
  flashMode: FlashMode;
  onFlashToggle: () => void;
  cameraType: CameraType;
  onCameraFlip: () => void;
}

const CameraScreen: React.FC = ({ navigation }: any) => {
  const dispatch = useAppDispatch();
  const { 
    currentLocation, 
    detectionResult, 
    isDetecting
  } = useAppSelector((state) => state.camera);
  
  const cameraRef = useRef<CameraView>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null); 
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState<boolean | null>(null); 
  const [cameraType, setCameraType] = useState<CameraType>(CameraType.back);
  const [flashMode, setFlashMode] = useState<FlashMode>(FlashMode.off);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showDetectionOverlay, setShowDetectionOverlay] = useState(false);

  // Animations
  const recordingAnimation = useRef(new Animated.Value(1)).current;
  const detectionAnimation = useRef(new Animated.Value(0)).current;
  const controlsAnimation = useRef(new Animated.Value(1)).current;
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setRecordingTime(0);
    recordingAnimation.stopAnimation();
    recordingAnimation.setValue(1);
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  }, [recordingAnimation, cameraRef]);

  const showDetectionAnimation = useCallback(() => {
    setShowDetectionOverlay(true);
    
    Animated.sequence([
      Animated.timing(detectionAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(detectionAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDetectionOverlay(false);
    });
  }, [detectionAnimation]);

  const getCurrentLocation = useCallback(async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      dispatch(setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: location.timestamp,
      }));
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please ensure location services are enabled.',
        [
          { text: 'Retry', onPress: getCurrentLocation },
          { text: 'Continue', style: 'cancel' }
        ]
      );
    }
  }, [dispatch]);


  const requestPermissions = useCallback(async () => {
    try {
      setIsInitializing(true);

      // Camera permissions
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus === 'granted');

      // Location permissions
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(locationStatus === 'granted');

      // Media library permissions
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaLibraryPermission(mediaStatus === 'granted');

      // Audio permissions for video recording
      const { status: audioStatus } = await Camera.requestMicrophonePermissionsAsync();

      const allPermissionsGranted = cameraStatus === 'granted' && 
                                   locationStatus === 'granted' && 
                                   mediaStatus === 'granted' && 
                                   audioStatus === 'granted';

      setHasPermission(allPermissionsGranted);

      if (!allPermissionsGranted) {
        showPermissionAlert();
      }
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      requestPermissions();
      return () => {
        if (isRecording) {
          stopRecording();
        }
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
        dispatch(clearDetectionResult());
      };
    }, [isRecording, requestPermissions, stopRecording, dispatch])
  );

  useEffect(() => {
    if (hasPermission && hasLocationPermission) {
      getCurrentLocation();
    }
  }, [hasPermission, hasLocationPermission, getCurrentLocation]);

  useEffect(() => {
    if (detectionResult) {
      showDetectionAnimation();
    }
  }, [detectionResult, showDetectionAnimation]);

  const showPermissionAlert = () => {
    Alert.alert(
      'Permissions Required',
      'This app needs camera, location, and media library permissions to detect and report billboard violations.',
      [
        {
          text: 'Settings',
          onPress: () => Linking.openSettings(),
        },
        {
          text: 'Retry',
          onPress: requestPermissions,
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const takePhoto = async () => {
    if (!cameraRef.current || !hasPermission) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (photo) {
        // Trigger AI detection
        await handleAIDetection(photo.uri, 'photo');
        
        // Navigate to preview screen
        navigation.navigate('PhotoPreview', {
          photoUri: photo.uri,
          location: currentLocation,
          detectionResult,
        });
      }
    } catch (error) {
      console.error('Photo capture error:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current || !hasPermission || isRecording) return;

    try {
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimation, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      const video = await cameraRef.current.recordAsync({
        quality: '720p',
        maxDuration: 60, // 60 seconds max
        mute: false,
      });

      if (video) {
        await handleAIDetection(video.uri, 'video');
        
        navigation.navigate('VideoPreview', {
          videoUri: video.uri,
          location: currentLocation,
          detectionResult,
        });
      }
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to record video. Please try again.');
    } finally {
      stopRecording();
    }
  };

  const handleAIDetection = async (mediaUri: string, mediaType: 'photo' | 'video') => {
    if (!currentLocation) {
      Alert.alert('Location Required', 'Location data is required for violation detection.');
      return;
    }

    try {
      const detectionData = {
        mediaUri,
        mediaType,
        location: currentLocation,
        timestamp: new Date().toISOString(),
      };

      const result = await dispatch(detectViolation(detectionData)).unwrap();
      
      if (result.violations && result.violations.length > 0) {
        setShowDetectionOverlay(true);
        showDetectionAnimation();
      }
    } catch (error) {
      console.error('AI Detection error:', error);
      // Don't show error to user for detection failures, as it's supplementary
    }
  };

  const toggleFlash = () => {
    setFlashMode(current => 
      current === FlashMode.off 
        ? FlashMode.on 
        : current === FlashMode.on 
        ? FlashMode.auto 
        : FlashMode.off
    );
  };

  const flipCamera = () => {
    setCameraType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFlashIcon = () => {
    switch (flashMode) {
      case FlashMode.on: return 'flash';
      case FlashMode.auto: return 'flash-outline';
      default: return 'flash-off';
    }
  };

  const DetectionOverlay: React.FC<DetectionOverlayProps> = ({ detectionResult, isVisible }) => {
    if (!isVisible || !detectionResult) return null;

    return (
      <Animated.View
        style={[
          styles.detectionOverlay,
          {
            opacity: detectionAnimation,
            transform: [{
              scale: detectionAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            }],
          },
        ]}
      >
        <View style={styles.detectionAlert}>
          <Ionicons name="warning" size={24} color={COLORS.warning} />
          <Text style={styles.detectionText}>
            Potential violation detected!
          </Text>
        </View>
        
        {detectionResult.violations && detectionResult.violations.length > 0 && (
          <View style={styles.violationsList}>
            {detectionResult.violations.slice(0, 2).map((violation: any, index: number) => (
              <Text key={index} style={styles.violationItem}>
                • {violation.type}: {violation.confidence}% confidence
              </Text>
            ))}
          </View>
        )}
      </Animated.View>
    );
  };

  const CameraControls: React.FC<CameraControlsProps> = ({
    onTakePhoto,
    onStartRecording,
    onStopRecording,
    isRecording,
    canTakePhoto,
    flashMode,
    onFlashToggle,
    cameraType,
    onCameraFlip,
  }) => (
    <Animated.View
      style={[
        styles.controlsContainer,
        { opacity: controlsAnimation },
      ]}
    >
      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color={COLORS.text.inverse} />
        </TouchableOpacity>
        
        <View style={styles.topRightControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onFlashToggle}
          >
            <Ionicons name={getFlashIcon() as any} size={24} color={COLORS.text.inverse} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onCameraFlip}
          >
            <Ionicons name="camera-reverse" size={24} color={COLORS.text.inverse} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recording Timer */}
      {isRecording && (
        <View style={styles.recordingTimer}>
          <Animated.View
            style={[
              styles.recordingDot,
              { opacity: recordingAnimation },
            ]}
          />
          <Text style={styles.recordingTime}>
            REC {formatRecordingTime(recordingTime)}
          </Text>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <View style={styles.captureControls}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={() => navigation.navigate('ReportHistory')}
          >
            <Ionicons name="images" size={24} color={COLORS.text.inverse} />
          </TouchableOpacity>

          <View style={styles.mainCaptureContainer}>
            {/* Photo Button */}
            <TouchableOpacity
              style={[
                styles.captureButton,
                !canTakePhoto && styles.disabledButton,
              ]}
              onPress={onTakePhoto}
              disabled={!canTakePhoto || isRecording}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            {/* Video Button */}
            <TouchableOpacity
              style={[
                styles.videoButton,
                isRecording && styles.videoButtonRecording,
              ]}
              onPress={isRecording ? onStopRecording : onStartRecording}
              disabled={!canTakePhoto}
            >
              <Ionicons 
                name={isRecording ? "stop" : "videocam"} 
                size={24} 
                color={isRecording ? COLORS.error : COLORS.text.inverse}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => navigation.navigate('Tutorial')}
          >
            <Ionicons name="information-circle" size={24} color={COLORS.text.inverse} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsText}>
          Point camera at billboard and tap to capture
        </Text>
        {currentLocation && (
          <Text style={styles.locationText}>
            📍 Location: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </Text>
        )}
      </View>
    </Animated.View>
  );

  if (hasPermission === null || isInitializing) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
        <Text style={styles.permissionText}>Initializing camera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="close" size={64} color={COLORS.gray[400]} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          Please grant camera and location permissions to report billboard violations.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermissions}>
          <Text style={styles.permissionButtonText}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="black" />
        <LoadingOverlay visible={isDetecting} message="Analyzing image..." />

        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
          flash={flashMode}
          mode="picture"
        >
          <DetectionOverlay 
            detectionResult={detectionResult}
            isVisible={showDetectionOverlay}
          />
          
          <CameraControls
            onTakePhoto={takePhoto}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            isRecording={isRecording}
            canTakePhoto={hasPermission && !isDetecting}
            flashMode={flashMode}
            onFlashToggle={toggleFlash}
            cameraType={cameraType}
            onCameraFlip={flipCamera}
          />
        </CameraView>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING[6],
  },
  permissionTitle: {
  fontSize: TYPOGRAPHY.fontSize.xl,
  fontWeight: "bold",
    color: COLORS.text.primary,
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  permissionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING[6],
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
    borderRadius: RADIUS.lg,
  },
  permissionButtonText: {
  color: COLORS.text.inverse,
  fontSize: TYPOGRAPHY.fontSize.md,
  fontWeight: "600",
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: SPACING[4],
    paddingHorizontal: SPACING[4],
  },
  topRightControls: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.full,
    alignSelf: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginRight: SPACING[2],
  },
  recordingTime: {
  color: COLORS.text.inverse,
  fontSize: TYPOGRAPHY.fontSize.md,
  fontWeight: "bold",
  },
  bottomControls: {
    paddingBottom: SPACING[8],
    paddingHorizontal: SPACING[4],
  },
  captureControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING[4],
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCaptureContainer: {
    alignItems: 'center',
    gap: SPACING[3],
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 4,
    borderColor: COLORS.text.inverse,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.text.inverse,
  },
  disabledButton: {
    opacity: 0.5,
  },
  videoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: COLORS.text.inverse,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoButtonRecording: {
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
    borderColor: COLORS.error,
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING[6],
  },
  instructionsText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    textAlign: 'center',
    marginBottom: SPACING[2],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: RADIUS.lg,
  },
  locationText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.md,
  },
  detectionOverlay: {
    position: 'absolute',
    top: '30%',
    left: SPACING[4],
    right: SPACING[4],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  detectionAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  detectionText: {
  color: COLORS.text.inverse,
  fontSize: TYPOGRAPHY.fontSize.md,
  fontWeight: "600",
  marginLeft: SPACING[2],
  },
  violationsList: {
    gap: SPACING[1],
  },
  violationItem: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
});

export default CameraScreen;