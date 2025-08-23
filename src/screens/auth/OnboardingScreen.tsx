/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import { AuthStackScreenProps } from '../../types/navigation.types';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

type Props = AuthStackScreenProps<'Onboarding'>;

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const onboardingData: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Discover Amazing Places',
    description: 'Find and explore the best spots around you with our interactive billboard network.',
    image: require('../../../assets/images/logo.png'),
    icon: 'location-outline',
    color: '#3B82F6',
  }
];

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Animate on slide change
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    });
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < onboardingData.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  const renderSlide = (slide: OnboardingSlide, index: number) => (
    <View key={slide.id} style={styles.slide}>
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: slideAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${slide.color}15` }]}>
          <Ionicons name={slide.icon} size={80} color={slide.color} />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: slideAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </Animated.View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {onboardingData.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.paginationDot,
            {
              backgroundColor: index === currentSlide ? '#3B82F6' : '#E2E8F0',
              width: index === currentSlide ? 24 : 8,
            },
          ]}
          onPress={() => setCurrentSlide(index)}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Skip Button */}
      <Animated.View style={[styles.skipContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.content}>
        {renderSlide(onboardingData[currentSlide], currentSlide)}
      </View>

      {/* Bottom Section */}
      <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
        {renderPagination()}

        <View style={styles.buttonContainer}>
          {currentSlide === onboardingData.length - 1 ? (
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              fullWidth
              style={styles.getStartedButton}
            />
          ) : (
            <View style={styles.navigationButtons}>
              <TouchableOpacity onPress={() => setCurrentSlide(Math.max(0, currentSlide - 1))}>
                <View style={styles.backButton}>
                  <Ionicons name="chevron-back" size={24} color="#64748B" />
                </View>
              </TouchableOpacity>

              <Button
                title="Next"
                onPress={handleNext}
                style={styles.nextButton}
                rightIcon="chevron-forward"
              />
            </View>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: SPACING[6],
    zIndex: 1,
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[6],
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  imageContainer: {
    marginBottom: SPACING[12],
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
  },
  title: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xl : TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: SPACING[4],
    lineHeight: isSmallDevice ? 28 : 32,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING[2],
  },
  bottomSection: {
    paddingHorizontal: SPACING[6],
    paddingBottom: SPACING[8],
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[8],
    gap: SPACING[2],
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  buttonContainer: {
    width: '100%',
  },
  getStartedButton: {
    minHeight: 56,
    borderRadius: RADIUS.xl,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    minHeight: 48,
    paddingHorizontal: SPACING[8],
    borderRadius: RADIUS.full,
  },
});

export default OnboardingScreen;