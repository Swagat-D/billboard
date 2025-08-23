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
import { ForgotPasswordData } from '../../types/auth.types';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';
import { VALIDATION_RULES } from '../../constants/app';
import { useAppDispatch, useAppSelector } from '../../store';
import { forgotPassword, clearError } from '../../store/slices/authSlice';

type Props = AuthStackScreenProps<'ForgotPassword'>;

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .matches(VALIDATION_RULES.EMAIL, 'Please enter a valid email'),
});

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error, otpSent } = useAppSelector((state) => state.auth);
  const [emailSent, setEmailSent] = useState(false);

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
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ForgotPasswordData>({
    resolver: yupResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const emailValue = watch('email');

  const onSubmit: SubmitHandler<ForgotPasswordData> = async (data) => {
    try {
      dispatch(clearError());
      const result = await dispatch(forgotPassword(data));

      if (forgotPassword.fulfilled.match(result)) {
        setEmailSent(true);
        Alert.alert(
          'Reset Code Sent',
          `We've sent a password reset code to ${data.email}. Please check your inbox.`,
          [
            {
              text: 'Continue',
              onPress: () => navigation.navigate('ResetPassword', { email: data.email }),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.payload as string);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  const handleResendCode = async () => {
    if (emailValue) {
      try {
        dispatch(clearError());
        const result = await dispatch(forgotPassword({ email: emailValue }));
        
        if (forgotPassword.fulfilled.match(result)) {
          Alert.alert('Code Resent', 'A new reset code has been sent to your email.');
        }
      } catch (err) {
        console.error(err)
        Alert.alert('Error', 'Failed to resend code');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LoadingOverlay visible={isLoading} message="Sending reset code..." />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset Password</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Ionicons name="lock-closed-outline" size={48} color="#3B82F6" />
              </View>
            </View>

            {/* Title and Description */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.description}>
                {emailSent
                  ? `We've sent a password reset code to ${emailValue}. Enter the code and your new password below.`
                  : "Don't worry! Enter your email address and we'll send you a code to reset your password."}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
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
                    editable={!emailSent}
                    required
                  />
                )}
              />

              {/* Error Display */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Success Message */}
              {emailSent && otpSent && (
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                  <Text style={styles.successText}>Reset code sent successfully!</Text>
                </View>
              )}

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {emailSent ? (
                  <>
                    <Button
                      title="Continue to Reset"
                      onPress={() => navigation.navigate('ResetPassword', { email: emailValue })}
                      fullWidth
                      style={styles.continueButton}
                    />
                    <TouchableOpacity onPress={handleResendCode} style={styles.resendButton}>
                      <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
                      <Text style={styles.resendLink}>Resend</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Button
                    title="Send Reset Code"
                    onPress={handleSubmit(onSubmit)}
                    disabled={!isValid || isLoading}
                    loading={isLoading}
                    fullWidth
                    style={styles.sendButton}
                  />
                )}
              </View>
            </View>

            {/* Back to Login */}
            <TouchableOpacity onPress={handleBackToLogin} style={styles.backToLoginButton}>
              <Ionicons name="chevron-back" size={20} color="#64748B" />
              <Text style={styles.backToLoginText}>Back to Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[4],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: SPACING[2],
    borderRadius: RADIUS.lg,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#1E293B',
  },
  placeholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING[6],
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING[6],
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING[3],
    textAlign: 'center',
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING[4],
  },
  formContainer: {
    width: '100%',
    marginBottom: SPACING[8],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: SPACING[4],
    borderRadius: RADIUS.lg,
    marginTop: SPACING[4],
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
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: SPACING[4],
    borderRadius: RADIUS.lg,
    marginTop: SPACING[4],
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  successText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#10B981',
    marginLeft: SPACING[3],
    flex: 1,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: SPACING[6],
    width: '100%',
  },
  sendButton: {
    minHeight: 56,
    borderRadius: RADIUS.xl,
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButton: {
    minHeight: 56,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING[4],
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resendButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING[3],
  },
  resendText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
  },
  resendLink: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#3B82F6',
    fontWeight: '600',
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[4],
    gap: SPACING[1],
  },
  backToLoginText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: '#64748B',
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;