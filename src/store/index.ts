import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistReducer, persistStore } from 'redux-persist';

// Import slice reducers
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import cameraReducer from './slices/cameraSlice'
import notificationReducer from './slices/notificationSlice'
// import userReducer from './slices/userSlice';
// import reportReducer from './slices/reportSlice';
// import mapReducer from './slices/mapSlice';
// import gamificationReducer from './slices/gamificationSlice';

// Combine reducers first
const rootReducer = combineReducers({
  auth: authReducer,
  // user: userReducer,
  // report: reportReducer,
  camera: cameraReducer,
  // map: mapReducer,
  // gamification: gamificationReducer,
  dashboard: dashboardReducer,
  notifications: notificationReducer
});

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user'],
  blacklist: ['camera', 'map'],
};

// Wrap root reducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['_persist'],
      },
    }),
  devTools: __DEV__,
});

// Create persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
