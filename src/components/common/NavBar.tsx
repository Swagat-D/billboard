import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NavBarProps {
  title?: string;
  showSettings?: boolean;
  showNotifications?: boolean;
  onSettingsPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
}

const NavBar: React.FC<NavBarProps> = ({
  title,
  showSettings = true,
  showNotifications = true,
  onSettingsPress,
  onNotificationPress,
  notificationCount = 0,
}) => {
  return (
    <View style={styles.navbar}>
      <View style={styles.leftSection}>
        <Text style={styles.appTitle}>Billboard</Text>
        <View style={styles.underline} />
      </View>
      
      <View style={styles.rightSection}>
        {showSettings && (
          <TouchableOpacity style={styles.iconButton} onPress={onSettingsPress}>
            <Ionicons name="settings-outline" size={24} color="#64748B" />
          </TouchableOpacity>
        )}
        
        {showNotifications && (
          <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
            <Ionicons name="notifications-outline" size={24} color="#64748B" />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop:34,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  leftSection: {
    alignItems: 'flex-start',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: -0.5,
  },
  underline: {
    width: 40,
    height: 3,
    backgroundColor: '#10B981',
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default NavBar;