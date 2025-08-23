/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import NavBar from '../../components/common/NavBar';
import LoadingOverlay from '../../components/common/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  removeNotification,
  clearError
} from '../../store/slices/notificationSlice';
import { StackNavigationProp } from '@react-navigation/stack';

const { width } = Dimensions.get('window');

type Notification = {
  id: string;
  type: string;
  title?: string;
  message: string;
  isRead: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low' | string;
  createdAt: string | number | Date;
  data?: any;
};

type RootStackParamList = {
  ReportDetails: { reportId: string };
  EditReport: { reportId: string };
  Leaderboard: undefined;
  Map: { violationId: string };
  Camera: { prefilledLocation: any };
  Achievements: undefined;
  // Add other screens as needed
};

const NotificationsScreen = ({
  navigation,
}: {
  navigation: StackNavigationProp<RootStackParamList>;
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { notifications, unreadCount, isLoading, error } = useAppSelector(state => state.notifications);
  
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const themeColors = {
    primary: '#10B981',
    primaryLight: '#ECFDF5',
    primaryBorder: '#D1FAE5',
    gradient: ['#F0FDF4', '#FFFFFF'] as [string, string],
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadNotifications = async () => {
    try {
      await dispatch(fetchNotifications()).unwrap();
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await dispatch(markNotificationAsRead({ notificationId })).unwrap();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Mark All as Read',
      'Mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: async () => {
            try {
              await dispatch(markAllNotificationsAsRead()).unwrap();
            } catch (error) {
              console.error('Error marking all as read:', error);
              Alert.alert('Error', 'Failed to mark all notifications as read');
            }
          }
        }
      ]
    );
  };

  const handleDeleteNotification = (notificationId: string, title: string) => {
    Alert.alert(
      'Delete Notification',
      `Delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(removeNotification(notificationId));
          }
        }
      ]
    );
  };

  const handleNotificationAction = (notification: Notification) => {
    // Mark as read first
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Handle different notification types
    switch (notification.type) {
      case 'report_approved':
        Alert.alert(
          'Report Approved',
          'Your billboard violation report has been approved and is being processed.',
          [
            { text: 'View Report', onPress: () => navigation.navigate('ReportDetails', { reportId: notification.data?.reportId }) },
            { text: 'OK' }
          ]
        );
        break;
        
      case 'report_rejected':
        Alert.alert(
          'Report Under Review',
          'Your report needs additional information. Please check the details.',
          [
            { text: 'View Report', onPress: () => navigation.navigate('ReportDetails', { reportId: notification.data?.reportId }) },
            { text: 'Edit Report', onPress: () => navigation.navigate('EditReport', { reportId: notification.data?.reportId }) },
            { text: 'Dismiss', style: 'cancel' },
          ]
        );
        break;

      case 'report_under_review':
        Alert.alert(
          'Report Under Review',
          'Your billboard violation report is currently being reviewed by authorities.',
          [
            { text: 'View Report', onPress: () => navigation.navigate('ReportDetails', { reportId: notification.data?.reportId }) },
            { text: 'OK' }
          ]
        );
        break;

      case 'points_earned':
        Alert.alert(
          'Points Earned!',
          `You've earned ${notification.data?.points || 0} points for your contribution to billboard monitoring.`,
          [
            { text: 'View Leaderboard', onPress: () => navigation.navigate('Leaderboard') },
            { text: 'Great!', style: 'default' }
          ]
        );
        break;

      case 'nearby_violation':
        Alert.alert(
          'Nearby Violation Detected',
          'A potential billboard violation has been detected near your location.',
          [
            { text: 'View Location', onPress: () => navigation.navigate('Map', { violationId: notification.data?.violationId }) },
            { text: 'Report Issue', onPress: () => navigation.navigate('Camera', { prefilledLocation: notification.data?.location }) },
            { text: 'Dismiss', style: 'cancel' },
          ]
        );
        break;

      case 'system_update':
        Alert.alert(
          'System Update',
          notification.message,
          [{ text: 'OK' }]
        );
        break;

      case 'achievement_unlocked':
        Alert.alert(
          'Achievement Unlocked! 🏆',
          `Congratulations! You've unlocked: ${notification.data?.achievement || 'New Achievement'}`,
          [
            { text: 'View Achievements', onPress: () => navigation.navigate('Achievements') },
            { text: 'Awesome!' }
          ]
        );
        break;
        
      default:
        // Just mark as read for other notification types
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'report_approved':
        return 'checkmark-circle';
      case 'report_rejected':
        return 'close-circle';
      case 'report_under_review':
        return 'time';
      case 'points_earned':
        return 'star';
      case 'nearby_violation':
        return 'location';
      case 'system_update':
        return 'information-circle';
      case 'achievement_unlocked':
        return 'trophy';
      default:
        return 'notifications';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#EF4444';
      case 'high':
        return '#F59E0B';
      case 'medium':
        return '#10B981';
      case 'low':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const formatTimestamp = (timestamp: string | number | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'report_approved': 
        return 'Report Approved';
      case 'report_rejected': 
        return 'Report Needs Review';
      case 'report_under_review': 
        return 'Report Under Review';
      case 'points_earned': 
        return 'Points Earned';
      case 'nearby_violation': 
        return 'Nearby Violation';
      case 'system_update': 
        return 'System Update';
      case 'achievement_unlocked': 
        return 'Achievement Unlocked';
      default: 
        return 'Notification';
    }
  };

  const filteredNotifications = notifications.filter((notification: Notification) => {
    if (filter === 'unread') return !notification.isRead;
    return true;
  });

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const priorityColor = getPriorityColor(notification.priority);
    const displayTitle = notification.title || getNotificationTitle(notification.type);
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !notification.isRead && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationAction(notification)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          {/* Priority Indicator */}
          <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
          
          {/* Icon */}
          <View style={[styles.notificationIconContainer, { backgroundColor: priorityColor + '15' }]}>
            <Ionicons
              name={getNotificationIcon(notification.type)}
              size={22}
              color={priorityColor}
            />
          </View>
          
          {/* Content */}
          <View style={styles.notificationTextContainer}>
            <View style={styles.notificationHeader}>
              <Text style={[
                styles.notificationTitle,
                !notification.isRead && styles.unreadTitle
              ]} numberOfLines={1}>
                {displayTitle}
              </Text>
              <View style={styles.notificationMeta}>
                <Text style={styles.notificationTime}>
                  {formatTimestamp(notification.createdAt)}
                </Text>
                {!notification.isRead && (
                  <View style={[styles.unreadDot, { backgroundColor: themeColors.primary }]} />
                )}
              </View>
            </View>
            
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
            
            <View style={styles.actionIndicator}>
              <Ionicons name="chevron-forward" size={14} color={themeColors.primary} />
              <Text style={[styles.actionText, { color: themeColors.primary }]}>Tap to view</Text>
            </View>
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteNotification(notification.id, displayTitle);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (isLoading && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <NavBar 
          title="Notifications"
          showSettings={false}
          onNotificationPress={() => {}}
          notificationCount={0}
        />
        <LoadingOverlay visible={true} message="Loading notifications..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => (navigation as any).goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </Text>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.markAllButtonText}>Mark All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
            colors={[themeColors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Toggle */}
        <View style={styles.filterSection}>
          <View style={styles.filterToggle}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                filter === 'all' && styles.activeFilter,
                filter === 'all' && { backgroundColor: themeColors.primary }
              ]}
              onPress={() => setFilter('all')}
            >
              <Text style={[
                styles.filterText,
                filter === 'all' && styles.activeFilterText
              ]}>
                All ({notifications.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterOption,
                filter === 'unread' && styles.activeFilter,
                filter === 'unread' && { backgroundColor: themeColors.primary }
              ]}
              onPress={() => setFilter('unread')}
            >
              <Text style={[
                styles.filterText,
                filter === 'unread' && styles.activeFilterText
              ]}>
                Unread ({unreadCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications List */}
        <View style={styles.notificationsSection}>
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={themeColors.gradient}
                style={styles.emptyBackground}
              >
                <View style={styles.emptyIconContainer}>
                  <Ionicons 
                    name={filter === 'all' ? 'notifications-off-outline' : 'checkmark-circle-outline'} 
                    size={48} 
                    color={themeColors.primary} 
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  {filter === 'all' 
                    ? 'No notifications yet'
                    : 'All caught up!'
                  }
                </Text>
                <Text style={styles.emptyMessage}>
                  {filter === 'all'
                    ? 'New notifications about your reports will appear here'
                    : "You've read all your notifications"
                  }
                </Text>
              </LinearGradient>
            </View>
          ) : (
            <View style={styles.notificationsList}>
              {filteredNotifications.map((notification: Notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  markAllButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  markAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  filterToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilter: {
    backgroundColor: '#10B981',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notificationsSection: {
    paddingHorizontal: 20,
  },
  notificationsList: {
    gap: 8,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  unreadNotification: {
    backgroundColor: '#FEFEFF',
    shadowColor: '#10B981',
    shadowOpacity: 0.08,
    elevation: 3,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  priorityIndicator: {
    width: 3,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  notificationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginLeft: 8,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontWeight: '600',
    color: '#0F172A',
  },
  notificationMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyBackground: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: width - 40,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NotificationsScreen;