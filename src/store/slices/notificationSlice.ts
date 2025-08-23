import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Mock API functions (replace with real API calls)
const fetchNotificationsAPI = async () => {
  // Simulate API call
  return [
    {
      id: '1',
      type: 'report_approved',
      title: 'Report Approved',
      message: 'Your billboard violation report at Times Square has been approved and is being processed by authorities.',
      isRead: false,
      priority: 'high',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      data: {
        reportId: 'report_123',
        location: 'Times Square',
        points: 50
      }
    },
    {
      id: '2',
      type: 'points_earned',
      title: 'Points Earned',
      message: 'You earned 25 points for your approved billboard violation report. Keep up the great work!',
      isRead: false,
      priority: 'medium',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      data: {
        points: 25,
        reportId: 'report_122'
      }
    },
    {
      id: '3',
      type: 'report_under_review',
      title: 'Report Under Review',
      message: 'Your billboard violation report at Main Street is currently being reviewed by our team.',
      isRead: true,
      priority: 'medium',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      data: {
        reportId: 'report_121',
        location: 'Main Street'
      }
    },
    {
      id: '4',
      type: 'nearby_violation',
      title: 'Nearby Violation',
      message: 'A potential billboard violation has been detected within 2 miles of your location. Help us verify it!',
      isRead: true,
      priority: 'low',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      data: {
        violationId: 'violation_456',
        location: 'Park Avenue',
        distance: '1.8 miles'
      }
    },
    {
      id: '5',
      type: 'achievement_unlocked',
      title: 'Achievement Unlocked',
      message: 'Congratulations! You\'ve unlocked the "Sharp Eye" achievement for reporting 10 billboard violations.',
      isRead: true,
      priority: 'high',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      data: {
        achievement: 'Sharp Eye',
        totalReports: 10
      }
    },
    {
      id: '6',
      type: 'report_rejected',
      title: 'Report Needs Review',
      message: 'Your report needs additional information. Please provide clearer photos or more details about the violation.',
      isRead: true,
      priority: 'medium',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      data: {
        reportId: 'report_120',
        reason: 'insufficient_evidence'
      }
    },
    {
      id: '7',
      type: 'system_update',
      title: 'System Update',
      message: 'BillboardWatch has been updated with new features! Check out the improved camera functionality.',
      isRead: true,
      priority: 'low',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      data: {
        version: '2.1.0',
        features: ['improved_camera', 'better_location_detection']
      }
    }
  ];
};

const markNotificationAsReadAPI = async (notificationId: string) => {
  // Simulate API call
  console.log(`Marking notification ${notificationId} as read`);
  return { success: true };
};

const markAllNotificationsAsReadAPI = async () => {
  // Simulate API call
  console.log('Marking all notifications as read');
  return { success: true };
};

const deleteNotificationAPI = async (notificationId: string) => {
  // Simulate API call
  console.log(`Deleting notification ${notificationId}`);
  return { success: true };
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async () => {
    return await fetchNotificationsAPI();
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notification/markNotificationAsRead',
  async ({ notificationId }: { notificationId: string }) => {
    await markNotificationAsReadAPI(notificationId);
    return { notificationId };
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllNotificationsAsRead',
  async () => {
    await markAllNotificationsAsReadAPI();
    return { success: true };
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId: string) => {
    await deleteNotificationAPI(notificationId);
    return { notificationId };
  }
);

// Notification type definition
export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  data: Record<string, any>;
};

const initialState = {
  notifications: [] as Notification[],
  unreadCount: 0,
  isLoading: false,
  error: undefined as string | undefined,
  lastUpdated: undefined as string | undefined,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = undefined;
    },
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== notificationId);
    },
    addNotification: (state, action) => {
      const newNotification = action.payload;
      state.notifications.unshift(newNotification);
      if (!newNotification.isRead) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
              state.isLoading = false;
              state.notifications = action.payload.map((n: any) => ({
                ...n,
                priority: n.priority as 'low' | 'medium' | 'high'
              }));
              state.unreadCount = action.payload.filter((n) => !n.isRead).length;
              state.lastUpdated = new Date().toISOString();
              state.error = undefined;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
              state.isLoading = false;
              state.error = action.error.message;
            })
            // Mark notification as read
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
              const notificationId = action.payload.notificationId;
              const notification = state.notifications.find(n => n.id === notificationId);
              if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
              }
            })
            // Mark all notifications as read
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
              state.notifications.forEach(n => {
                if (!n.isRead) n.isRead = true;
              });
              state.unreadCount = 0;
            })
            // Delete notification
            .addCase(deleteNotification.fulfilled, (state, action) => {
              const notificationId = action.payload.notificationId;
              const notification = state.notifications.find(n => n.id === notificationId);
              if (notification && !notification.isRead) {
                state.unreadCount = Math.max(0, state.unreadCount - 1);
              }
              state.notifications = state.notifications.filter(n => n.id !== notificationId);
            });
        },
      });
      
      export const { clearError, removeNotification, addNotification } = notificationSlice.actions;
      
      export default notificationSlice.reducer;