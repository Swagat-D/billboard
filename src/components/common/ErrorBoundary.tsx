import { Ionicons } from '@expo/vector-icons';
import React, { Component, ReactNode } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/themes/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (__DEV__) {
      console.error('🚨 ErrorBoundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to crash reporting service in production
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // In a real app, you would send this to your crash reporting service
      // Example: Crashlytics, Sentry, Bugsnag, etc.
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        platform: 'react-native',
      };

      if (__DEV__) {
        console.log('📊 Error report (dev mode):', errorReport);
      } else {
        // In production, send to your error tracking service
        // crashlytics().recordError(error);
        // Sentry.captureException(error, { contexts: { react: errorInfo } });
      }
    } catch (logError) {
      console.error('Failed to log error to service:', logError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    
    if (!error) return;

    const errorDetails = `
Error: ${error.message}

Stack Trace:
${error.stack}

Component Stack:
${errorInfo?.componentStack || 'Not available'}

Timestamp: ${new Date().toISOString()}
    `.trim();

    Alert.alert(
      'Report Error',
      'Would you like to report this error to help us improve the app?',
      [
        {
          text: 'Copy Details',
          onPress: () => {
            // In a real app, you might copy to clipboard or open email
            console.log('Error details copied:', errorDetails);
            Alert.alert('Copied', 'Error details copied to console (dev mode)');
          },
        },
        {
          text: 'Send Report',
          onPress: () => {
            // In a real app, this would open email client or send to support
            Alert.alert(
              'Thank You',
              'Error report would be sent to support team in production app.'
            );
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  getErrorTitle = (error: Error | null): string => {
    if (!error) return 'Something went wrong';
    
    // Categorize common errors
    if (error.message.includes('Network')) {
      return 'Connection Error';
    }
    if (error.message.includes('Permission')) {
      return 'Permission Error';
    }
    if (error.message.includes('Camera')) {
      return 'Camera Error';
    }
    if (error.message.includes('Location')) {
      return 'Location Error';
    }
    
    return 'Unexpected Error';
  };

  getErrorMessage = (error: Error | null): string => {
    if (!error) return 'An unexpected error occurred. Please try again.';
    
    // Provide user-friendly messages for common errors
    if (error.message.includes('Network')) {
      return 'Please check your internet connection and try again.';
    }
    if (error.message.includes('Permission')) {
      return 'Please grant the required permissions and try again.';
    }
    if (error.message.includes('Camera')) {
      return 'Camera is not available. Please check your device settings.';
    }
    if (error.message.includes('Location')) {
      return 'Location services are required. Please enable location access.';
    }
    
    return 'An unexpected error occurred. Please try restarting the app.';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error } = this.state;
      const title = this.getErrorTitle(error);
      const message = this.getErrorMessage(error);

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="warning-outline"
                size={64}
                color={COLORS.error}
              />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            {__DEV__ && this.props.showDetails !== false && (
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Technical Details (Dev Mode):</Text>
                <Text style={styles.detailsText} numberOfLines={5}>
                  {error?.message || 'Unknown error'}
                </Text>
                {error?.stack && (
                  <Text style={styles.stackTrace} numberOfLines={3}>
                    {error.stack}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.retryButton]}
                onPress={this.handleRetry}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={20} color={COLORS.text.inverse} />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.reportButton]}
                onPress={this.handleReportError}
                activeOpacity={0.8}
              >
                <Ionicons name="bug-outline" size={20} color={COLORS.primary[500]} />
                <Text style={styles.reportButtonText}>Report Issue</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                If the problem persists, please restart the app
              </Text>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING[6],
  },
  iconContainer: {
    marginBottom: SPACING[6],
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING[4],
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING[8],
  },
  detailsContainer: {
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.md,
    padding: SPACING[4],
    marginBottom: SPACING[6],
    width: '100%',
  },
  detailsTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING[2],
  },
  detailsText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.error,
    fontFamily: 'monospace',
    marginBottom: SPACING[2],
  },
  stackTrace: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING[3],
    marginBottom: SPACING[6],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[5],
    paddingVertical: SPACING[3],
    borderRadius: RADIUS.lg,
    gap: SPACING[2],
  },
  retryButton: {
    backgroundColor: COLORS.primary[500],
  },
  retryButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary[500],
  },
  reportButtonText: {
    color: COLORS.primary[500],
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: '600',
  },
  footer: {
    marginTop: SPACING[4],
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.hint,
    textAlign: 'center',
  },
});

export default ErrorBoundary;