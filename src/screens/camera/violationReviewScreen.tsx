/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { StackNavigationProp } from '@react-navigation/stack';

type ViolationReviewScreenProps = {
  navigation: StackNavigationProp<any>;
  route: {
    params: {
      photoUri: string;
      detectionResults?: any[];
    };
  };
};

interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

interface LocationInfo {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
}

const ViolationReviewScreen = ({ navigation, route }: ViolationReviewScreenProps) => {
  const { photoUri } = route.params;
  
  // State management
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: 'John Doe', // This should come from user profile/auth
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
  });
  
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [violationType, setViolationType] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [estimatedDimensions, setEstimatedDimensions] = useState('24ft x 16ft');
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const violationTypes = [
    { id: 'size', label: 'Oversized Billboard', icon: 'resize-outline' },
    { id: 'placement', label: 'Illegal Placement', icon: 'location-outline' },
    { id: 'hazard', label: 'Safety Hazard', icon: 'warning-outline' },
    { id: 'content', label: 'Inappropriate Content', icon: 'eye-off-outline' },
    { id: 'permit', label: 'Missing Permit', icon: 'document-text-outline' },
    { id: 'other', label: 'Other Violation', icon: 'ellipsis-horizontal-outline' },
  ];

  useEffect(() => {
    getCurrentLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Location access is needed to include violation coordinates in the report.',
          [
            { text: 'Skip', onPress: () => setIsLoadingLocation(false) },
            { text: 'Grant Permission', onPress: getCurrentLocation },
          ]
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Get address from coordinates
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const locationData: LocationInfo = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address[0] ? 
          `${address[0].street || ''} ${address[0].city || ''}, ${address[0].region || ''} ${address[0].postalCode || ''}`.trim() :
          'Address not available',
        timestamp: new Date().toISOString(),
      };

      setLocationInfo(locationData);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Location Error', 'Unable to get current location. You can still submit the report.');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const validateForm = () => {
    if (!violationType) {
      Alert.alert('Required Field', 'Please select a violation type.');
      return false;
    }
    
    if (additionalNotes.trim().length < 10) {
      Alert.alert('Required Field', 'Please provide at least 10 characters in additional notes describing the violation.');
      return false;
    }

    return true;
  };

  const submitReport = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call to submit report
      const reportData = {
        photoUri,
        userInfo,
        locationInfo,
        violationType,
        additionalNotes,
        estimatedDimensions,
        timestamp: new Date().toISOString(),
        reportId: `RPT-${Date.now()}`,
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to submission confirmation
      navigation.navigate('SubmissionConfirmation', { reportData });
      
    } catch (error) {
      Alert.alert('Submission Error', 'Failed to submit report. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Violation Report</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo Preview Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Captured Evidence</Text>
          <TouchableOpacity 
            style={styles.photoPreview}
            onPress={() => setIsPhotoModalVisible(true)}
          >
            <Image source={{ uri: photoUri }} style={styles.photoImage} />
            <View style={styles.photoOverlay}>
              <Ionicons name="eye-outline" size={24} color="white" />
              <Text style={styles.photoOverlayText}>Tap to view full size</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Auto-filled Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Information</Text>
          
          {/* Date and Time */}
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>
                {locationInfo ? formatDate(locationInfo.timestamp) : 'Loading...'}
              </Text>
              <Text style={styles.infoSubValue}>
                {locationInfo ? formatTime(locationInfo.timestamp) : ''}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              {isLoadingLocation ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#10B981" />
                  <Text style={styles.loadingText}>Getting location...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.infoValue}>
                    {locationInfo?.address || 'Location not available'}
                  </Text>
                  {locationInfo && (
                    <Text style={styles.infoSubValue}>
                      {locationInfo.latitude.toFixed(6)}, {locationInfo.longitude.toFixed(6)}
                    </Text>
                  )}
                </>
              )}
            </View>
            {!isLoadingLocation && (
              <TouchableOpacity onPress={getCurrentLocation} style={styles.refreshButton}>
                <Ionicons name="refresh-outline" size={16} color="#10B981" />
              </TouchableOpacity>
            )}
          </View>

          {/* Estimated Dimensions */}
          <View style={styles.infoRow}>
            <Ionicons name="resize-outline" size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Estimated Dimensions</Text>
              <Text style={styles.infoValue}>{estimatedDimensions}</Text>
              <Text style={styles.infoSubValue}>AI-detected approximate size</Text>
            </View>
          </View>
        </View>

        {/* User Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reporter Information</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{userInfo.name}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{userInfo.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#6B7280" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{userInfo.phone}</Text>
            </View>
          </View>
        </View>

        {/* Violation Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Violation Type *</Text>
          <Text style={styles.sectionSubtitle}>Select the primary violation observed</Text>
          
          <View style={styles.violationGrid}>
            {violationTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.violationCard,
                  violationType === type.id && styles.violationCardSelected
                ]}
                onPress={() => setViolationType(type.id)}
              >
                <Ionicons 
                  name={type.icon as any} 
                  size={24} 
                  color={violationType === type.id ? '#10B981' : '#6B7280'} 
                />
                <Text style={[
                  styles.violationCardText,
                  violationType === type.id && styles.violationCardTextSelected
                ]}>
                  {type.label}
                </Text>
                {violationType === type.id && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes *</Text>
          <Text style={styles.sectionSubtitle}>
            Describe the violation in detail (minimum 10 characters)
          </Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={6}
            placeholder="Please provide specific details about the violation you observed. Include any relevant information that might help authorities understand the issue..."
            placeholderTextColor="#9CA3AF"
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            {additionalNotes.length}/500 characters
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={submitReport}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.submitButtonText}>Submitting Report...</Text>
            </>
          ) : (
            <>
              <Ionicons name="send-outline" size={20} color="white" />
              <Text style={styles.submitButtonText}>Submit Violation Report</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Photo Modal */}
      <Modal
        visible={isPhotoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPhotoModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsPhotoModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Image source={{ uri: photoUri }} style={styles.fullSizeImage} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  photoPreview: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoOverlayText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '400',
  },
  infoSubValue: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  refreshButton: {
    padding: 4,
  },
  violationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  violationCard: {
    width: (width - 64) / 2,
    margin: 6,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    position: 'relative',
  },
  violationCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  violationCardText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    marginTop: 8,
  },
  violationCardTextSelected: {
    color: '#10B981',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
    backgroundColor: 'white',
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 8,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: -40,
    right: 0,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  fullSizeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    borderRadius: 8,
  },
});

export default ViolationReviewScreen;