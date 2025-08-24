import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  Share,
  Clipboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

type SubmissionConfirmationScreenProps = {
  navigation: StackNavigationProp<any>;
  route: {
    params: {
      reportData: {
        reportId: string;
        photoUri: string;
        userInfo: any;
        locationInfo: any;
        violationType: string;
        additionalNotes: string;
        timestamp: string;
      };
    };
  };
};

const SubmissionConfirmationScreen = ({ navigation, route }: SubmissionConfirmationScreenProps) => {
  const { reportData } = route.params;
  
  const [checkmarkAnimation] = useState(new Animated.Value(0));
  const [cardAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.timing(checkmarkAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getViolationTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'size': 'Oversized Billboard',
      'placement': 'Illegal Placement',
      'hazard': 'Safety Hazard',
      'content': 'Inappropriate Content',
      'permit': 'Missing Permit',
      'other': 'Other Violation',
    };
    return types[type] || 'Unknown Violation';
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyReportId = async () => {
    Clipboard.setString(reportData.reportId);
    Alert.alert('Copied!', 'Report ID has been copied to clipboard.');
  };

  const shareReportDetails = async () => {
    try {
      const shareContent = `
Billboard Violation Report
Report ID: ${reportData.reportId}
Type: ${getViolationTypeLabel(reportData.violationType)}
Date: ${formatDate(reportData.timestamp)}
Location: ${reportData.locationInfo?.address || 'Location not available'}

Your report has been submitted to the authorities for review.
      `.trim();

      await Share.share({
        message: shareContent,
        title: 'Billboard Violation Report',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const goToHome = () => {
    // Reset navigation stack to home screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    });
  };

  const trackReportStatus = () => {
    navigation.navigate('ReportTracking', { reportId: reportData.reportId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Animation */}
        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [
                  {
                    scale: checkmarkAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1.2, 1],
                    }),
                  },
                ],
                opacity: checkmarkAnimation,
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          </Animated.View>
          
          <Text style={styles.successTitle}>Report Submitted Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Your billboard violation report has been received and will be reviewed by the appropriate authorities.
          </Text>
        </View>

        {/* Report Details Card */}
        <Animated.View
          style={[
            styles.detailsCard,
            {
              transform: [
                {
                  translateY: cardAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
              opacity: cardAnimation,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Report Summary</Text>
            <TouchableOpacity onPress={copyReportId} style={styles.copyButton}>
              <Ionicons name="copy-outline" size={16} color="#10B981" />
            </TouchableOpacity>
          </View>

          <View style={styles.reportIdContainer}>
            <Text style={styles.reportIdLabel}>Report ID</Text>
            <Text style={styles.reportId}>{reportData.reportId}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Violation Type</Text>
              <Text style={styles.detailValue}>{getViolationTypeLabel(reportData.violationType)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Submitted</Text>
              <Text style={styles.detailValue}>{formatDate(reportData.timestamp)}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>
                {reportData.locationInfo?.address || 'Location not available'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={20} color="#6B7280" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue} numberOfLines={3}>
                {reportData.additionalNotes}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Status Information */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="information-circle-outline" size={24} color="#3B82F6" />
            <Text style={styles.statusTitle}>What Happens Next?</Text>
          </View>

          <View style={styles.statusSteps}>
            <View style={styles.statusStep}>
              <View style={styles.stepIndicator}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Report Received</Text>
                <Text style={styles.stepDescription}>Your report has been successfully submitted</Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.statusStep}>
              <View style={[styles.stepIndicator, styles.stepIndicatorPending]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Under Review</Text>
                <Text style={styles.stepDescription}>Authorities will review your evidence (1-3 business days)</Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.statusStep}>
              <View style={[styles.stepIndicator, styles.stepIndicatorPending]}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Action Taken</Text>
                <Text style={styles.stepDescription}>You&apos;ll be notified of any enforcement actions</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy & Compliance Notice */}
        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
            <Text style={styles.noticeTitle}>Privacy & Compliance</Text>
          </View>
          <Text style={styles.noticeText}>
            Your report and personal information are handled securely and shared only with authorized personnel. 
            Evidence is encrypted and stored according to data protection regulations.
          </Text>
          <Text style={styles.noticeSubText}>
            You may receive updates via email or SMS regarding the status of your report.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={shareReportDetails}>
            <Ionicons name="share-outline" size={20} color="#6B7280" />
            <Text style={styles.secondaryButtonText}>Share Report</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={trackReportStatus}>
            <Ionicons name="eye-outline" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Track Status</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Actions */}
        <View style={styles.additionalActions}>
          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('ReportHistory')}>
            <Text style={styles.linkButtonText}>View All My Reports</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkButton} onPress={goToHome}>
            <Text style={styles.linkButtonText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  animationContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  checkmarkContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
  },
  reportIdContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  reportIdLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reportId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  statusSteps: {
    paddingLeft: 8,
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorPending: {
    backgroundColor: '#E5E7EB',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 15,
    marginVertical: -10,
    zIndex: -1,
  },
  noticeCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginLeft: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
    marginBottom: 8,
  },
  noticeSubText: {
    fontSize: 12,
    color: '#059669',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginLeft: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  additionalActions: {
    alignItems: 'center',
    paddingTop: 16,
  },
  linkButton: {
    paddingVertical: 12,
  },
  linkButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
});

export default SubmissionConfirmationScreen;