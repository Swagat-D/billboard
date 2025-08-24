/* eslint-disable react-hooks/exhaustive-deps */
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as yup from 'yup';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingOverlay from '../../components/common/LoadingSpinner';
import { VALIDATION_RULES } from '../../constants/app';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../constants/themes/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { clearError, loginUser } from '../../store/slices/authSlice';
import { LoginCredentials } from '../../types/auth.types';
import { AuthStackScreenProps } from '../../types/navigation.types';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

type Props = AuthStackScreenProps<'Login'>;

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .matches(VALIDATION_RULES.EMAIL, 'Please enter a valid email'),
  password: yup
    .string()
    .required('Password is required')
    .min(
      VALIDATION_RULES.PASSWORD_MIN_LENGTH,
      `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`
    ),
});

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<LoginCredentials> = async (data) => {
    try {
      dispatch(clearError());
      const result = await dispatch(loginUser(data));

      if (loginUser.fulfilled.match(result)) {
        reset();
      } else {
        Alert.alert(
          'Login Failed',
          result.payload
        );
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignup = () => {
    navigation.navigate('Register');
  };

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
            {/* Email */}
            <View style={styles.inputWrapper}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email Address"
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                    leftIcon="mail-outline"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    required
                  />
                )}
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                label="Password"
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                leftIcon="lock-closed-outline"
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                autoComplete="password"
                required
                />
              )}
              />
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
            >
              <Text style={[styles.forgotPasswordText, { color: '#2563EB' }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Sign In */}
            <Animated.View style={[styles.buttonWrapper, { opacity: fadeAnim }]}>
              <Button
                title="Sign In"
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || isLoading}
                loading={isLoading}
                fullWidth
                style={styles.loginButton}
              />
            </Animated.View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={handleSignup}>
                <Text style={[styles.signupLink, { color: '#2563EB' }]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Security Badge */}
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

export default LoginScreen;
