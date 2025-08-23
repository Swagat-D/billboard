/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  KeyboardAvoidingView, Platform, Alert, Animated
} from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingOverlay from '../../components/common/LoadingSpinner';
import { AuthStackScreenProps } from '../../types/navigation.types';
import { OTPVerification } from '../../types/auth.types';
import { useAppDispatch, useAppSelector } from '../../store';
import { verifyOTP, clearError } from '../../store/slices/authSlice';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/themes/theme';

type Props = AuthStackScreenProps<'OTPVerification'>;

const otpSchema = yup.object().shape({
  email: yup.string().required('Email is required').email('Invalid email'),
  otp: yup.string().required('OTP is required').length(6, 'OTP must be 6 digits'),
});

const OTPVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email } = route.params;
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<OTPVerification>({
    resolver: yupResolver(otpSchema),
    mode: 'onChange',
    defaultValues: { email, otp: '' },
  });

  const onSubmit: SubmitHandler<OTPVerification> = async (data) => {
    dispatch(clearError());
    const result = await dispatch(verifyOTP(data));
    if (verifyOTP.fulfilled.match(result)) {
      navigation.replace('Home'); // replace with your app's main screen
    } else {
      Alert.alert('Verification Failed', result.payload as string);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LoadingOverlay visible={isLoading} message="Verifying OTP..." />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Verify Your Account</Text>
          <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text>

          {/* OTP Input */}
          <Controller
            control={control}
            name="otp"
            render={({ field: { onChange, value } }) => (
              <Input
                label="One-Time Password"
                placeholder="Enter 6-digit OTP"
                value={value}
                onChangeText={onChange}
                keyboardType="number-pad"
                error={errors.otp?.message}
                leftIcon="key-outline"
              />
            )}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Button
            title="Verify"
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            loading={isLoading}
            fullWidth
            style={styles.verifyButton}
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, justifyContent: 'center', padding: SPACING[6] },
  title: { fontSize: TYPOGRAPHY.fontSize['2xl'], fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: TYPOGRAPHY.fontSize.md, color: '#64748B', marginBottom: SPACING[6] },
  errorContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF2F2', padding: SPACING[4],
    borderRadius: RADIUS.lg, marginBottom: SPACING[4],
    borderWidth: 1, borderColor: '#FECACA',
  },
  errorText: { fontSize: TYPOGRAPHY.fontSize.sm, color: '#EF4444', marginLeft: SPACING[3] },
  verifyButton: { marginTop: SPACING[4], minHeight: 56, borderRadius: RADIUS.xl },
});

export default OTPVerificationScreen;
