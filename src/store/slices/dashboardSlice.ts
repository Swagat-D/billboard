import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Example API functions (replace with real API calls)
const fetchStatsAPI = async () => {
  // Simulate API call
  return {
    totalReports: 127,
    pendingReports: 45,
    approvedReports: 68,
    rejectedReports: 14,
    totalPoints: 2340,
    currentRank: 8,
    unreadNotifications: 5,
    cityStats: {
      totalReports: 2500,
      activeUsers: 340,
      complianceRate: 78,
    },
  };
};

const fetchReportsAPI = async () => {
  // Simulate API call
  return [
    {
      id: '1',
      location: 'Times Square',
      address: '1560 Broadway, New York, NY',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      violationType: 'Unauthorized Billboard',
      priority: 'high',
      imageUrl: 'https://example.com/image1.jpg',
    },
    {
      id: '2',
      location: 'Main Street',
      address: '450 Main St, Downtown',
      status: 'approved',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      violationType: 'Size Violation',
      priority: 'medium',
      imageUrl: 'https://example.com/image2.jpg',
    },
    {
      id: '3',
      location: 'Highway 101',
      address: 'Mile Marker 45, Highway 101',
      status: 'under_review',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      violationType: 'Placement Violation',
      priority: 'critical',
      imageUrl: 'https://example.com/image3.jpg',
    },
    {
      id: '4',
      location: 'Park Avenue',
      address: '789 Park Ave, Midtown',
      status: 'rejected',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      violationType: 'Content Violation',
      priority: 'low',
      imageUrl: 'https://example.com/image4.jpg',
    },
    {
      id: '5',
      location: 'Central Plaza',
      address: '123 Central Plaza, Business District',
      status: 'approved',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      violationType: 'Lighting Violation',
      priority: 'medium',
      imageUrl: 'https://example.com/image5.jpg',
    },
  ];
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async () => {
    return await fetchStatsAPI();
  }
);

export const fetchRecentReports = createAsyncThunk(
  'dashboard/fetchRecentReports',
  async () => {
    return await fetchReportsAPI();
  }
);

type CityStats = {
  totalReports: number;
  activeUsers: number;
  complianceRate: number;
};

type DashboardStats = {
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  rejectedReports: number;
  totalPoints: number;
  currentRank: number;
  unreadNotifications: number;
  cityStats: CityStats;
};

type Report = {
  id: string;
  location: string;
  address: string;
  status: string;
  createdAt: string;
  violationType: string;
  priority: string;
  imageUrl: string;
};

type DashboardState = {
  stats?: DashboardStats;
  recentReports: Report[];
  isLoading: boolean;
  error?: string;
  lastUpdated?: string;
};

const initialState: DashboardState = {
  stats: undefined,
  recentReports: [],
  isLoading: false,
  error: undefined,
  lastUpdated: undefined,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.isLoading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch dashboard stats.';
      })
      .addCase(fetchRecentReports.pending, (state) => {
        state.isLoading = true;
        state.error = undefined;
      })
      .addCase(fetchRecentReports.fulfilled, (state, action) => {
        state.recentReports = action.payload;
        state.isLoading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchRecentReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch recent reports.';
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;