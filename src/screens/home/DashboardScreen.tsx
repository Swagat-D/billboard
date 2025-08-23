/* eslint-disable react-hooks/exhaustive-deps */
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import LoadingOverlay from '../../components/common/LoadingSpinner';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/themes/theme';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchDashboardStats, fetchRecentReports } from '../../store/slices/dashboardSlice';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  backgroundColor: string;
  onPress?: () => void;
  loading?: boolean;
}

interface RecentReportProps {
  id: string;
  location: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  createdAt: string;
  violationType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  imageUrl?: string;
}

const DashboardScreen: React.FC = ({ navigation }: any) => {
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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadDashboardData();
    startAnimations();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Refresh data when screen comes into focus
      const shouldRefresh = !lastUpdated || 
        (Date.now() - new Date(lastUpdated).getTime()) > 5 * 60 * 1000; // 5 minutes
      
      if (shouldRefresh) {
        loadDashboardData();
      }
    }, [lastUpdated])
  );

  const startAnimations = () => {
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
    ]).start();
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    icon, 
    color, 
    backgroundColor, 
    onPress,
    loading = false
  }) => (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
    >
      <View style={styles.statCardContent}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.statTextContainer}>
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

  const RecentReportCard: React.FC<RecentReportProps> = ({ 
    id,
    location, 
    address,
    status, 
    createdAt, 
    violationType,
    priority,
    imageUrl
  }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'approved': return COLORS.success;
        case 'rejected': return COLORS.error;
        case 'under_review': return COLORS.info;
        default: return COLORS.warning;
      }
    };

    const getStatusIcon = (status: string) => {
      switch (status) {
        case 'approved': return 'checkmark-circle';
        case 'rejected': return 'close-circle';
        case 'under_review': return 'eye';
        default: return 'time';
      }
    };

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'critical': return COLORS.error;
        case 'high': return COLORS.warning;
        case 'medium': return COLORS.info;
        default: return COLORS.gray[500];
      }
    };

    return (
      <TouchableOpacity 
        style={styles.reportCard} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ReportStatus', { reportId: id })}
      >
        <View style={styles.reportCardContent}>
          <View style={styles.reportHeader}>
            <View style={styles.reportInfo}>
              <Text style={styles.reportLocation} numberOfLines={1}>
                {location}
              </Text>
              <Text style={styles.reportAddress} numberOfLines={1}>
                {address}
              </Text>
              <View style={styles.reportMeta}>
                <Text style={styles.reportType}>{violationType}</Text>
                <View style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityColor(priority) }
                ]} />
                <Text style={[
                  styles.priorityText,
                  { color: getPriorityColor(priority) }
                ]}>
                  {priority.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.reportRight}>
              {imageUrl && (
                <Image source={{ uri: imageUrl }} style={styles.reportThumbnail} />
              )}
              <View style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(status) + '20' }
              ]}>
                <Ionicons 
                  name={getStatusIcon(status) as any} 
                  size={12} 
                  color={getStatusColor(status)} 
                />
                <Text style={[
                  styles.statusText, 
                  { color: getStatusColor(status) }
                ]}>
                  {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.reportDate}>{formatDate(createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (error && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
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
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <LoadingOverlay visible={isLoading && !refreshing && !stats} message="Loading dashboard..." />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[COLORS.primary[500]]}
              tintColor={COLORS.primary[500]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.headerContent}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Ionicons name="person-circle-outline" size={48} color={COLORS.gray[400]} />
                </View>
                <View>
                  <Text style={styles.greeting}>{getGreeting()}!</Text>
                  <Text style={styles.userName}>
                    {user?.name || 'User'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color={COLORS.text.primary} />
                {stats?.unreadNotifications > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {stats.unreadNotifications > 99 ? '99+' : stats.unreadNotifications}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View
            style={[
              styles.quickActionsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('Camera')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: COLORS.primary[500] + '20' }]}>
                  <Ionicons name="camera" size={32} color={COLORS.primary[500]} />
                </View>
                <Text style={styles.quickActionText}>Report Billboard</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('Map')}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: COLORS.secondary[500] + '20' }]}>
                  <Ionicons name="map" size={32} color={COLORS.secondary[500]} />
                </View>
                <Text style={styles.quickActionText}>View Map</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Stats Section */}
          <Animated.View
            style={[
              styles.statsSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Your Impact</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Reports Submitted"
                value={stats?.totalReports || 0}
                icon="document-text"
                color={COLORS.primary[500]}
                backgroundColor={COLORS.primary[50]}
                onPress={() => navigation.navigate('ReportHistory')}
                loading={isLoading}
              />
              <StatCard
                title="Points Earned"
                value={stats?.totalPoints || 0}
                icon="star"
                color={COLORS.gamification.points}
                backgroundColor={COLORS.gamification.points + '20'}
                onPress={() => navigation.navigate('Leaderboard')}
                loading={isLoading}
              />
              <StatCard
                title="Approved Reports"
                value={stats?.approvedReports || 0}
                icon="checkmark-circle"
                color={COLORS.success}
                backgroundColor={COLORS.billboard.approved}
                onPress={() => navigation.navigate('ReportHistory', { filter: 'approved' })}
                loading={isLoading}
              />
              <StatCard
                title="Current Rank"
                value={stats?.currentRank ? `#${stats.currentRank}` : 'N/A'}
                icon="trophy"
                color={COLORS.gamification.leaderboard}
                backgroundColor={COLORS.gamification.leaderboard + '20'}
                onPress={() => navigation.navigate('Leaderboard')}
                loading={isLoading}
              />
            </View>
          </Animated.View>

          {/* Recent Reports */}
          <Animated.View
            style={[
              styles.recentSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Reports</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ReportHistory')}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary[500]} />
              </TouchableOpacity>
            </View>
            
            {isLoading && !recentReports?.length ? (
              <View style={styles.loadingContainer}>
                {[1, 2, 3].map((item) => (
                  <View key={item} style={styles.reportCardSkeleton} />
                ))}
              </View>
            ) : recentReports?.length > 0 ? (
              recentReports.slice(0, 5).map((report: RecentReportProps) => (
                <RecentReportCard key={report.id} {...report} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color={COLORS.gray[400]} />
                <Text style={styles.emptyStateTitle}>No reports yet</Text>
                <Text style={styles.emptyStateMessage}>
                  Start reporting billboard violations to see them here
                </Text>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => navigation.navigate('Camera')}
                >
                  <Text style={styles.emptyStateButtonText}>Create First Report</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          {/* City Stats */}
          {stats?.cityStats && (
            <Animated.View
              style={[
                styles.cityStatsSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Text style={styles.sectionTitle}>City Overview</Text>
              <View style={styles.cityStatsCard}>
                <View style={styles.cityStatRow}>
                  <Text style={styles.cityStatLabel}>Total Reports (City)</Text>
                  <Text style={styles.cityStatValue}>
                    {stats.cityStats.totalReports.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.cityStatRow}>
                  <Text style={styles.cityStatLabel}>Active Contributors</Text>
                  <Text style={styles.cityStatValue}>
                    {stats.cityStats.activeUsers.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.cityStatRow}>
                  <Text style={styles.cityStatLabel}>Compliance Rate</Text>
                  <Text style={[
                    styles.cityStatValue,
                    { color: stats.cityStats.complianceRate > 80 ? COLORS.success : COLORS.warning }
                  ]}>
                    {stats.cityStats.complianceRate}%
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING[4],
    paddingBottom: SPACING[8],
  },
  header: {
    paddingTop: SPACING[4],
    marginBottom: SPACING[6],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING[3],
    backgroundColor: COLORS.gray[200],
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    fontWeight: "500",
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: SPACING[2],
  },
  notificationBadge: {
    position: 'absolute',
    top: SPACING[1],
    right: SPACING[1],
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  notificationBadgeText: {
    color: COLORS.text.inverse,
    fontSize: 10,
    fontWeight: "bold",
  },
  quickActionsSection: {
    marginBottom: SPACING[6],
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: SPACING[4],
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING[3],
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING[5],
    alignItems: 'center',
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  quickActionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: "600",
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: SPACING[6],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
  },
  statCard: {
    flex: 1,
    minWidth: (width - SPACING[4] * 2 - SPACING[3]) / 2,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    fontWeight: "500",
  },
  loadingPlaceholder: {
    height: 28,
    backgroundColor: COLORS.gray[200],
    borderRadius: RADIUS.sm,
    marginBottom: 4,
  },
  recentSection: {
    marginBottom: SPACING[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary[500],
    fontWeight: "600",
    marginRight: SPACING[1],
  },
  reportCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING[3],
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reportCardContent: {
    padding: SPACING[4],
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING[2],
  },
  reportInfo: {
    flex: 1,
    marginRight: SPACING[3],
  },
  reportLocation: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  reportAddress: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING[2],
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportType: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginRight: SPACING[2],
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING[1],
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  reportRight: {
    alignItems: 'flex-end',
  },
  reportThumbnail: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.gray[200],
    marginBottom: SPACING[2],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderRadius: RADIUS.md,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: "600",
    marginLeft: SPACING[1],
  },
  reportDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.hint,
    fontWeight: "500",
  },
  loadingContainer: {
    gap: SPACING[3],
  },
  reportCardSkeleton: {
    height: 100,
    backgroundColor: COLORS.gray[100],
    borderRadius: RADIUS.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING[8],
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginTop: SPACING[3],
    marginBottom: SPACING[2],
  },
  emptyStateMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING[5],
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[3],
    borderRadius: RADIUS.lg,
  },
  emptyStateButtonText: {
  color: COLORS.text.inverse,
  fontSize: TYPOGRAPHY.fontSize.md,
  fontWeight: "600",
  },
  cityStatsSection: {
    marginBottom: SPACING[6],
  },
  cityStatsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING[4],
    shadowColor: COLORS.gray[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cityStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING[3],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  cityStatLabel: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    fontWeight: "500",
  },
  cityStatValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.primary,
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[6],
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: "bold",
    color: COLORS.text.primary,
    marginTop: SPACING[4],
    marginBottom: SPACING[2],
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING[6],
  },
  retryButton: {
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: SPACING[6],
    paddingVertical: SPACING[3],
    borderRadius: RADIUS.lg,
  },
  retryButtonText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: "600",
  },
});

export default DashboardScreen;