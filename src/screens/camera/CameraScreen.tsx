/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Animated,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';

// CameraType values for expo-camera
const CAMERA_TYPE_BACK = 'back';
const CAMERA_TYPE_FRONT = 'front';
type CameraType = typeof CAMERA_TYPE_BACK | typeof CAMERA_TYPE_FRONT;

// Define FlashMode values since only the type is exported
const FLASH_MODE_ON = 'on';
const FLASH_MODE_OFF = 'off';
const FLASH_MODE_AUTO = 'auto';
type FlashModeType = typeof FLASH_MODE_ON | typeof FLASH_MODE_OFF | typeof FLASH_MODE_AUTO;

type CameraScreenProps = {
  navigation: StackNavigationProp<any>;
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Types for detection results
interface DetectionResult {
  type: 'violation' | 'hazard' | 'qr' | 'license' | 'dimension';
  confidence: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ViolationAlert {
  id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
}

const AICameraScreen = ({ navigation }: CameraScreenProps) => {
  const [flashMode, setFlashMode] = useState<FlashModeType>(FLASH_MODE_OFF);
  const [cameraType, setCameraType] = useState<CameraType>(CAMERA_TYPE_BACK);

  // Camera ref for taking pictures
  const cameraRef = useRef<any>(null);

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // State management
  const [isActive, setIsActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [violationAlerts, setViolationAlerts] = useState<ViolationAlert[]>([]);
  const [isDetectionEnabled, setIsDetectionEnabled] = useState(true);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const alertFadeAnim = useRef(new Animated.Value(0)).current;

  // Frame processing interval
  const frameProcessingInterval = useRef<number | null>(null);

  useEffect(() => {
    startScanAnimation();
    startFrameProcessing();
    
    return () => {
      setIsActive(false);
      if (frameProcessingInterval.current) {
        clearInterval(frameProcessingInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (violationAlerts.length > 0) {
      showAlertAnimation();
    }
  }, [violationAlerts]);

  useEffect(() => {
    if (isDetectionEnabled && isActive) {
      startFrameProcessing();
    } else {
      stopFrameProcessing();
    }
  }, [isDetectionEnabled, isActive]);

  const startScanAnimation = () => {
    const scanAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    scanAnimation.start();
  };

  const showAlertAnimation = () => {
    Animated.sequence([
      Animated.timing(alertFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Mock Google Vision API call - replace with actual implementation
  const processFrameWithGoogleVision = async (imageUri: string): Promise<DetectionResult[]> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock detection results - replace with actual Google Vision API calls
    const mockResults: DetectionResult[] = [
      {
        type: 'violation',
        confidence: 0.87,
        bounds: { x: 100, y: 200, width: 200, height: 150 },
        message: 'Oversized billboard detected',
        severity: 'high'
      },
      {
        type: 'dimension',
        confidence: 0.92,
        bounds: { x: 50, y: 100, width: 300, height: 200 },
        message: 'Dimensions: 24ft x 16ft (Exceeds 20ft x 12ft limit)',
        severity: 'medium'
      }
    ];
    
    return Math.random() > 0.7 ? mockResults : [];
  };

  // Start frame processing simulation
  const startFrameProcessing = () => {
    if (frameProcessingInterval.current) {
      clearInterval(frameProcessingInterval.current);
    }
    
    frameProcessingInterval.current = setInterval(() => {
      if (isDetectionEnabled && !isProcessing) {
        handleFrameProcessing();
      }
    }, 1000); // Process every second
  };

  const stopFrameProcessing = () => {
    if (frameProcessingInterval.current) {
      clearInterval(frameProcessingInterval.current);
      frameProcessingInterval.current = null;
    }
  };

  const handleFrameProcessing = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // In real implementation, you'd extract frame data here
      const mockImageUri = 'mock://frame';
      const results = await processFrameWithGoogleVision(mockImageUri);
      
      setDetectionResults(results);
      
      // Check for violations
      const violations = results.filter(r => r.type === 'violation' && r.confidence > 0.8);
      if (violations.length > 0) {
        const newAlert: ViolationAlert = {
          id: Date.now().toString(),
          type: violations[0].type,
          message: violations[0].message,
          severity: violations[0].severity,
          timestamp: Date.now(),
        };
        
        setViolationAlerts(prev => [newAlert, ...prev.slice(0, 2)]); // Keep last 3 alerts
      }
    } catch (error) {
      console.error('Frame processing error:', error);
    } finally {
      setTimeout(() => setIsProcessing(false), 500); // Throttle processing
    }
  }, [isProcessing, isDetectionEnabled]);

  const takePicture = async () => {
  if (!cameraRef.current || !permission?.granted) return;

  try {
    setIsProcessing(true);
    
    const photo = await cameraRef.current.takePictureAsync({
      quality: 1,
      base64: false,
      exif: false,
    });

    if (!photo) return;

    setCapturedPhoto(photo.uri);
    
    navigation.navigate('ViolationReview', {
      photoUri: photo.uri,
      detectionResults: detectionResults,
    });
    
  } catch (error) {
    Alert.alert('Error', 'Failed to capture photo. Please try again.');
    console.error('Capture error:', error);
  } finally {
    setIsProcessing(false);
  }
};

  const toggleFlash = () => {
    setFlashMode(prev => {
      switch (prev) {
        case FLASH_MODE_OFF: return FLASH_MODE_ON;
        case FLASH_MODE_ON: return FLASH_MODE_AUTO;
        case FLASH_MODE_AUTO: return FLASH_MODE_OFF;
        default: return FLASH_MODE_OFF;
      }
    });
  };

  const toggleCamera = () => {
    setCameraType(prev => prev === CAMERA_TYPE_BACK ? CAMERA_TYPE_FRONT : CAMERA_TYPE_BACK);
  };



  const getFlashIcon = () => {
    switch (flashMode) {
      case FLASH_MODE_ON: return 'flash';
      case FLASH_MODE_AUTO: return 'flash-outline';
      default: return 'flash-off';
    }
  };

  const getFlashLabel = () => {
    switch (flashMode) {
      case FLASH_MODE_ON: return 'ON';
      case FLASH_MODE_AUTO: return 'AUTO';
      default: return 'OFF';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#D97706';
      default: return '#65A30D';
    }
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading Camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="#9CA3AF" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionMessage}>
            Enable camera access to start detecting billboard violations
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
          flash={flashMode}
        />
        
        {/* Scan Line Animation */}
        {isDetectionEnabled && (
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [
                  {
                    translateY: scanLineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, screenHeight - 200],
                    }),
                  },
                ],
              },
            ]}
          />
        )}

        {/* Detection Overlays */}
        {detectionResults.map((result, index) => (
          <View
            key={index}
            style={[
              styles.detectionOverlay,
              {
                left: result.bounds.x,
                top: result.bounds.y,
                width: result.bounds.width,
                height: result.bounds.height,
                borderColor: getSeverityColor(result.severity),
              },
            ]}
          >
            <View style={[styles.detectionLabel, { backgroundColor: getSeverityColor(result.severity) }]}>
              <Text style={styles.detectionText}>
                {result.type.toUpperCase()} ({Math.round(result.confidence * 100)}%)
              </Text>
            </View>
          </View>
        ))}

        {/* Header Controls */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>AI Billboard Scanner</Text>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: isDetectionEnabled ? '#10B981' : '#6B7280' }]} />
              <Text style={styles.statusText}>
                {isDetectionEnabled ? 'Scanning Active' : 'Scanning Paused'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setIsDetectionEnabled(!isDetectionEnabled)}
          >
            <Ionicons 
              name={isDetectionEnabled ? "eye" : "eye-off"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        {/* Violation Alerts */}
        {violationAlerts.length > 0 && (
          <Animated.View 
            style={[
              styles.alertContainer,
              { 
                opacity: alertFadeAnim,
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <View style={[styles.alertCard, { borderLeftColor: getSeverityColor(violationAlerts[0].severity) }]}>
              <View style={styles.alertHeader}>
                <Ionicons name="warning" size={20} color={getSeverityColor(violationAlerts[0].severity)} />
                <Text style={styles.alertTitle}>Possible Violation Detected!</Text>
              </View>
              <Text style={styles.alertMessage}>{violationAlerts[0].message}</Text>
              <Text style={styles.alertSubtext}>Click &apos;Capture&apos; to report this violation</Text>
            </View>
          </Animated.View>
        )}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.controlRow}>
            {/* Flash Control */}
            <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
              <Ionicons name={getFlashIcon()} size={24} color="white" />
              <Text style={styles.controlLabel}>{getFlashLabel()}</Text>
            </TouchableOpacity>

            {/* Capture Button */}
            <TouchableOpacity
              style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" size="large" />
              ) : (
                <>
                  <View style={styles.captureButtonInner} />
                  {violationAlerts.length > 0 && (
                    <View style={styles.captureButtonAlert}>
                      <Ionicons name="warning" size={16} color="#DC2626" />
                    </View>
                  )}
                </>
              )}
            </TouchableOpacity>

            {/* Camera Toggle */}
            <TouchableOpacity style={styles.controlButton} onPress={toggleCamera}>
              <Ionicons name="camera-reverse" size={24} color="white" />
              <Text style={styles.controlLabel}>FLIP</Text>
            </TouchableOpacity>
          </View>

          {/* Detection Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{detectionResults.length}</Text>
              <Text style={styles.statLabel}>Detections</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{violationAlerts.length}</Text>
              <Text style={styles.statLabel}>Violations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {detectionResults.length > 0 ? Math.round(detectionResults[0]?.confidence * 100 || 0) : 0}%
              </Text>
              <Text style={styles.statLabel}>Confidence</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scanLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  detectionOverlay: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 8,
  },
  detectionLabel: {
    position: 'absolute',
    top: -25,
    left: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  detectionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
  },
  alertContainer: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
  },
  alertCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  alertMessage: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  alertSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingBottom: 34,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlLabel: {
    color: 'white',
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    position: 'relative',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  captureButtonAlert: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
});

export default AICameraScreen;