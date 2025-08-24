/* eslint-disable react-hooks/exhaustive-deps */
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
  Image,
  Dimensions
} from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingOverlay from '../../components/common/LoadingSpinner';
import { AuthStackScreenProps } from '../../types/navigation.types';
import { SignupData } from '../../types/auth.types';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { VALIDATION_RULES } from '../../constants/app';
import { useAppDispatch, useAppSelector } from '../../store';
import { signupUser, clearError } from '../../store/slices/authSlice';

type Props = AuthStackScreenProps<'Register'>;
const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;


const registerSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup
    .string()
    .required('Email is required')
    .matches(VALIDATION_RULES.EMAIL, 'Please enter a valid email'),
  phoneNumber: yup.string().required('Phone number is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(
      VALIDATION_RULES.PASSWORD_MIN_LENGTH,
      `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
  
});

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(logoAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  const { control, handleSubmit, formState: { errors, isValid }, reset } = useForm<SignupData>({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
    },
  });

  const onSubmit: SubmitHandler<SignupData> = async (data) => {
    dispatch(clearError());
    const result = await dispatch(signupUser(data));

    if (signupUser.fulfilled.match(result)) {
      reset();
      navigation.navigate('OTPVerification', { email: data.email });
    } else {
      Alert.alert('Registration Failed', result.payload as string);
    }
  };
  const logoAnim = useRef(new Animated.Value(1)).current;


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LoadingOverlay visible={isLoading} message="Signing you in..." />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.logoSection,
                {
                  opacity: logoAnim,
                  transform: [{ scale: logoAnim }],
                },
              ]}
            >
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../../assets/images/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.appTitle}>billboard</Text>
            </Animated.View>
          </View>

          {/* Welcome Section */}
          <Animated.View
            style={[
              styles.welcomeSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Please sign in to your account to continue
            </Text>
          </Animated.View>

          {/* Login Form */}
          <Animated.View
            style={[
              styles.formSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Name */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="Enter your name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                  leftIcon="person-outline"
                />
              )}
            />

            {/* Email */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  leftIcon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />

            {/* Phone */}
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phoneNumber?.message}
                  leftIcon="call-outline"
                  keyboardType="phone-pad"
                />
              )}
            />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  leftIcon="lock-closed-outline"
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />
              )}
            />

            {/* Confirm Password */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Re-enter password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  leftIcon="lock-closed-outline"
                  secureTextEntry
                />
              )}
            />

            {/* Error */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Register Button */}
            <Button
              title="Sign Up"
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Already have account */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signupLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
                    <Animated.View style={[styles.securitySection, { opacity: fadeAnim }]}>
                      <View style={styles.securityBadge}>
                        <Ionicons name="shield-checkmark" size={18} color="#10B981" />
                        <Text style={styles.securityText}>
                          Secure Authentication
                        </Text>
                      </View>
                    </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  keyboardAvoidingView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: isSmallDevice ? SPACING[4] : SPACING[6],
    paddingBottom: SPACING[8],
  },
  header: { paddingTop: SPACING[12], marginBottom: SPACING[6] },
  logoSection: { alignItems: 'center' },
  logoContainer: { marginBottom: SPACING[4] },
  logoImage: { width: isSmallDevice ? 90 : 110, height: isSmallDevice ? 90 : 110, borderRadius: RADIUS.full },
  appTitle: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize['2xl'] : TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: SPACING[1],
    letterSpacing: -1,
  },
  welcomeSection: { alignItems: 'center', marginBottom: SPACING[8], paddingHorizontal: SPACING[4] },
  welcomeTitle: {
    fontSize: isSmallDevice ? TYPOGRAPHY.fontSize.xl : TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[2],
  },
  welcomeSubtitle: { fontSize: TYPOGRAPHY.fontSize.md, color: '#64748B', textAlign: 'center' },
  formSection: { marginBottom: SPACING[6] },
  inputWrapper: { marginBottom: SPACING[2] },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: SPACING[4],
    borderRadius: RADIUS.lg,
    marginBottom: SPACING[4],
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#EF4444',
    marginLeft: SPACING[3],
    flex: 1,
    fontWeight: '500',
  },
  forgotPasswordButton: { alignSelf: 'flex-end', marginBottom: SPACING[2] },
  forgotPasswordText: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: '600' },
  buttonWrapper: { marginBottom: SPACING[6] },
  loginButton: {
    minHeight: 56,
    borderRadius: RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING[6] },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#94A3B8',
    marginHorizontal: SPACING[4],
    backgroundColor: '#F8FAFC',
    paddingHorizontal: SPACING[2],
    fontWeight: '500',
  },
  signupContainer: { flexDirection: 'row', justifyContent: 'center' },
  signupText: { fontSize: TYPOGRAPHY.fontSize.md, color: '#64748B' },
  signupLink: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: '700' },
  securitySection: { alignItems: 'center' },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[5],
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    gap: SPACING[2],
  },
  securityText: { fontSize: TYPOGRAPHY.fontSize.sm, color: '#059669', fontWeight: '600' },
});

export default RegisterScreen;
