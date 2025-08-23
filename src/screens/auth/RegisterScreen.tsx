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

  const testSignupEndpoint = async () => {
  const testUrl = 'http://192.168.220.1:5000/api/auth/signup';
  const testData = {
    name: "Test User",
    email: "test@example.com",
    password: "Test@1234",
    confirmPassword: "Test@1234",
    phoneNumber: "1234567890"
  };

  console.log('🧪 Testing direct fetch to:', testUrl);
  
  try {
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers);
    
    const responseText = await response.text();
    console.log('📡 Raw response:', responseText);
    
    try {
      const jsonResponse = JSON.parse(responseText);
      console.log('📡 Parsed response:', jsonResponse);
    } catch (parseError) {
      console.log('❌ Failed to parse response as JSON:', parseError);
    }
    
  } catch (fetchError) {
    console.log('❌ Fetch error:', fetchError);
    if (fetchError instanceof Error) {
      console.log('❌ Error type:', fetchError.name);
      console.log('❌ Error message:', fetchError.message);
    } else {
      console.log('❌ Unknown error:', fetchError);
    }
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LoadingOverlay visible={isLoading} message="Creating account..." />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          >
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Fill in the details to get started</Text>

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
              style={styles.registerButton}
            />

            {/* Already have account */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
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
  scrollContent: { padding: SPACING[6] },
  title: { fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: TYPOGRAPHY.fontSize.md, color: '#64748B', marginBottom: SPACING[6] },
  errorContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF2F2', padding: SPACING[4],
    borderRadius: RADIUS.lg, marginBottom: SPACING[4],
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { fontSize: TYPOGRAPHY.fontSize.sm, color: '#EF4444', marginLeft: SPACING[3] },
  registerButton: { marginTop: SPACING[4], minHeight: 56, borderRadius: RADIUS.xl },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING[6] },
  footerText: { color: '#64748B', fontSize: TYPOGRAPHY.fontSize.md },
  loginLink: { color: '#2563EB', fontWeight: '700', marginLeft: 5 },
});

export default RegisterScreen;
