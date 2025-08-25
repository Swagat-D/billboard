/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavBar from '../../components/common/NavBar';
import LoadingOverlay from '../../components/common/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchDashboardStats, fetchRecentReports, clearError } from '../../store/slices/dashboardSlice';

import { StackNavigationProp } from '@react-navigation/stack';

type DashboardScreenProps = {
  navigation: StackNavigationProp<any>;
};

const BillboardDashboard = ({ navigation }: DashboardScreenProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { 
    stats, 
    recentReports, 
    isLoading, 
    error, 
    lastUpdated 
  } = useAppSelector((state) => state.dashboard);

  const [refreshing, setRefreshing] = useState(false);
  const [showAllReportsModal, setShowAllReportsModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDashboardData();
    startAnimation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAnimation = () => {
    Animated.timing(fadeAnim, { 
      toValue: 1, 
      duration: 600, 
      useNativeDriver: true 
    }).start();
  };

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchDashboardStats()).unwrap(),
        dispatch(fetchRecentReports()).unwrap(),
      ]);
    } catch (error) {
      console.error('Dashboard data loading error:', error);
      Alert.alert(
        'Error',
        'Failed to load dashboard data. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: loadDashboardData },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } finally {
      setRefreshing(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning,';
    if (hour < 17) return 'Good Afternoon,';
    return 'Good Evening,';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10B981';
      case 'rejected': return '#EF4444';
      case 'under_review': return '#3B82F6';
      default: return '#F59E0B';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#D97706';
      default: return '#65A30D';
    }
  };

  interface StatCardProps {
    title: string;
    value: number | string;
    icon: string; // Ionicons uses string names for icons
    color: string;
    onPress: () => void;
    loading?: boolean;
  }

  const StatCard = ({ title, value, icon, color, onPress, loading = false }: StatCardProps) => (
    <TouchableOpacity
      style={[styles.statCard, { borderColor: color + '30' }]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
    >
      <View style={styles.statCardContent}>
        <Ionicons name={icon} size={24} color={color} />
        <View style={styles.statInfo}>
          {loading ? (
            <View style={styles.loadingPlaceholder} />
          ) : (
            <Text style={styles.statValue}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Text>
          )}
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  interface RecentReport {
    id: string;
    location: string;
    address: string;
    violationType: string;
    priority: string;
    status: string;
    createdAt: string;
  }

  interface RecentReportCardProps {
    report: RecentReport;
  }

  const RecentReportCard = ({ report }: RecentReportCardProps) => (
    <TouchableOpacity 
      style={styles.reportCard}
      onPress={() => navigation.navigate('ReportDetails', { reportId: report.id })}
      activeOpacity={0.8}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportInfo}>
          <Text style={styles.reportLocation} numberOfLines={1}>
            {report.location}
          </Text>
          <Text style={styles.reportAddress} numberOfLines={1}>
            {report.address}
          </Text>
          <View style={styles.reportMeta}>
            <Text style={styles.violationType}>{report.violationType}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) + '20' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(report.priority) }]}>
                {report.priority.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.reportRight}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
              {report.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.reportDate}>{formatDate(report.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const AllReportsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAllReportsModal}
      onRequestClose={() => setShowAllReportsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All Recent Reports</Text>
            <TouchableOpacity onPress={() => setShowAllReportsModal(false)}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            {recentReports.map((report) => (
              <RecentReportCard key={report.id} report={report} />
            ))}
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => {
              setShowAllReportsModal(false);
              navigation.navigate('ReportHistory');
            }}
          >
            <Text style={styles.viewAllButtonText}>View Complete History</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (error && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <NavBar 
          onNotificationPress={() => navigation.navigate('Notifications')}
          notificationCount={0}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LoadingOverlay visible={isLoading && !refreshing && !stats} message="Loading dashboard..." />
      
      <NavBar 
        onSettingsPress={() => navigation.navigate('Settings')}
        onNotificationPress={() => navigation.navigate('Notifications')}
        notificationCount={stats?.unreadNotifications || 0}
      />

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header Section */}
          <View style={styles.headerCard}>
            <View style={styles.headerContent}>
              <View style={styles.headerText}>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.userName}>Citizen Reporter</Text>
                <Text style={styles.subtitle}>Here&apos;s your billboard monitoring overview for today</Text>
              </View>
              <View style={styles.headerIcon}>
                <View style={styles.iconContainer}>
                  <Ionicons name="eye" size={32} color="#10B981" />
                </View>
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Reports"
              value={stats?.totalReports || 0}
              icon="document-text"
              color="#10B981"
              onPress={() => navigation.navigate('ReportHistory')}
              loading={isLoading}
            />
            <StatCard
              title="Pending"
              value={stats?.pendingReports || 0}
              icon="time"
              color="#F59E0B"
              onPress={() => navigation.navigate('ReportHistory', { filter: 'pending' })}
              loading={isLoading}
            />
            <StatCard
              title="Approved"
              value={stats?.approvedReports || 0}
              icon="checkmark-circle"
              color="#10B981"
              onPress={() => navigation.navigate('ReportHistory', { filter: 'approved' })}
              loading={isLoading}
            />
            <StatCard
              title="Alerts"
              value={stats?.rejectedReports || 0}
              icon="alert-circle"
              color="#EF4444"
              onPress={() => navigation.navigate('ReportHistory', { filter: 'rejected' })}
              loading={isLoading}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('ManualReport')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#10B981' }]}>
                  <Ionicons name="add" size={24} color="white" />
                </View>
                <Text style={styles.quickActionText}>Add Report</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('Heatmap')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#3B82F6' }]}>
                  <Ionicons name="map" size={24} color="white" />
                </View>
                <Text style={styles.quickActionText}>View Map</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('AllReports')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: '#8B5CF6' }]}>
                  <Ionicons name="list" size={24} color="white" />
                </View>
                <Text style={styles.quickActionText}>All Reports</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => setShowAllReportsModal(true)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {isLoading && !recentReports?.length ? (
              <View style={styles.loadingContainer}>
                {[1, 2, 3].map((item) => (
                  <View key={item} style={styles.reportCardSkeleton} />
                ))}
              </View>
            ) : recentReports?.length > 0 ? (
              recentReports.slice(0, 3).map((report) => (
                <RecentReportCard key={report.id} report={report} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>No activity yet</Text>
                <Text style={styles.emptyStateMessage}>
                  Start reporting billboard violations to see them here
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      <AllReportsModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  headerCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  headerIcon: {
    marginLeft: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statInfo: {
    marginLeft: 12,
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  loadingPlaceholder: {
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 2,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  },
  recentSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reportInfo: {
    flex: 1,
    marginRight: 12,
  },
  reportLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  reportAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  violationType: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  reportRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  reportDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  loadingContainer: {
    gap: 12,
  },
  reportCardSkeleton: {
    height: 80,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalScrollView: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  viewAllButton: {
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BillboardDashboard;