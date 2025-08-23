/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingOverlay from '../../components/common/LoadingSpinner';
import { AuthStackScreenProps } from '../../types/navigation.types';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { updateProfile } from '../../store/slices/authSlice';

type Props = AuthStackScreenProps<'ProfileSetup'>;

type ProfileSetupData = {
  name: string;
  bio: string | undefined;
  dateOfBirth: string | undefined;
  location: string | undefined;
};


const profileSetupSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),
  bio: yup.string().max(150, 'Bio must be less than 150 characters').notRequired(),
  dateOfBirth: yup.string().notRequired(),
  location: yup.string().notRequired(),
});



const interestOptions = [
  { id: 'technology', label: 'Technology', icon: 'laptop-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'travel', label: 'Travel', icon: 'airplane-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'food', label: 'Food', icon: 'restaurant-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'sports', label: 'Sports', icon: 'football-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'music', label: 'Music', icon: 'musical-notes-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'art', label: 'Art', icon: 'brush-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'fitness', label: 'Fitness', icon: 'fitness-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'reading', label: 'Reading', icon: 'book-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'gaming', label: 'Gaming', icon: 'game-controller-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'photography', label: 'Photography', icon: 'camera-outline' as keyof typeof Ionicons.glyphMap },
];

const ProfileSetupScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileSetupData>({
    resolver: yupResolver(profileSetupSchema),
    mode: 'onChange',
    defaultValues: {
      name: user?.name || '',
      bio: '',
      dateOfBirth: '',
      location: '',
    },
  });

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : prev.length < 5 ? [...prev, interestId] : prev
    );
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit: SubmitHandler<ProfileSetupData> = async (data) => {
    try {
      const profileData = {
        ...data,
        interests: selectedInterests,
      };

      const result = await dispatch(updateProfile(profileData));
      
      if (updateProfile.fulfilled.match(result)) {
        Alert.alert(
          'Profile Setup Complete!',
          'Welcome to Billboard! Your profile has been set up successfully.',
          [{ text: 'Continue', onPress: () => navigation.replace('Login') }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to setup profile. Please try again.');
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Profile Setup?',
      'You can always complete your profile later in settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => navigation.replace('Login') },
      ]
    );
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: `${(currentStep / totalSteps) * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );

  const renderStep1 = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.stepTitle}>Let&apos;s set up your profile</Text>
      <Text style={styles.stepDescription}>Add your basic information</Text>

      {/* Profile Avatar Placeholder */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
      </View>

      {/* Name */}
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Display Name"
            placeholder="Enter your name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
            leftIcon="person-outline"
            required
          />
        )}
      />

      {/* Bio */}
      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Bio"
            placeholder="Tell us about yourself (optional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.bio?.message}
            leftIcon="document-text-outline"
            multiline
            numberOfLines={3}
          />
        )}
      />
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.stepTitle}>Personal Details</Text>
      <Text style={styles.stepDescription}>Help us personalize your experience</Text>

      {/* Date of Birth */}
      <Controller
        control={control}
        name="dateOfBirth"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Date of Birth"
            placeholder="DD/MM/YYYY (optional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.dateOfBirth?.message}
            leftIcon="calendar-outline"
          />
        )}
      />

      {/* Location */}
      <Controller
        control={control}
        name="location"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Location"
            placeholder="City, Country (optional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.location?.message}
            leftIcon="location-outline"
          />
        )}
      />
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View
      style={[
        styles.stepContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.stepTitle}>Your Interests</Text>
      <Text style={styles.stepDescription}>
        Select up to 5 interests to get personalized content
      </Text>

      <View style={styles.interestsContainer}>
        {interestOptions.map((interest) => (
          <TouchableOpacity
            key={interest.id}
            style={[
              styles.interestChip,
              selectedInterests.includes(interest.id) && styles.selectedInterestChip,
            ]}
            onPress={() => handleInterestToggle(interest.id)}
          >
            <Ionicons
              name={interest.icon}
              size={20}
              color={selectedInterests.includes(interest.id) ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[
                styles.interestText,
                selectedInterests.includes(interest.id) && styles.selectedInterestText,
              ]}
            >
              {interest.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.interestCount}>
        {selectedInterests.length}/5 interests selected
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LoadingOverlay visible={isLoading} message="Setting up profile..." />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {renderProgressBar()}

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={styles.bottomContainer}>
          <View style={styles.buttonRow}>
            {currentStep > 1 && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="#64748B" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            <Button
              title={currentStep === totalSteps ? 'Complete Setup' : 'Next'}
              onPress={currentStep === totalSteps ? handleSubmit(onSubmit) : handleNext}
              style={[styles.nextButton, currentStep === 1 && styles.fullWidthButton]}
              rightIcon={currentStep !== totalSteps ? 'chevron-forward' : undefined}
              loading={isLoading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING[6],
    paddingTop: SPACING[4],
  },
  skipButton: {
    paddingVertical: SPACING[2],
    paddingHorizontal: SPACING[4],
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[4],
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING[6],
  },
  stepContainer: {
    flex: 1,
    paddingVertical: SPACING[6],
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: SPACING[2],
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: SPACING[8],
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: SPACING[8],
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
    marginBottom: SPACING[6],
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: SPACING[2],
  },
  selectedInterestChip: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  interestText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    fontWeight: '500',
  },
  selectedInterestText: {
    color: '#FFFFFF',
  },
  interestCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#64748B',
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[6],
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING[4],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    gap: SPACING[1],
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: RADIUS.xl,
  },
  fullWidthButton: {
    flex: 1,
  },
});

export default ProfileSetupScreen;