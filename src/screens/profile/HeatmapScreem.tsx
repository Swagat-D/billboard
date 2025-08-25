import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

type HeatMapScreenProps = {
  navigation: StackNavigationProp<any>;
};

interface ViolationCluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  address: string;
  recentReports: ViolationReport[];
}

interface ViolationReport {
  id: string;
  title: string;
  type: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  date: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  photoUri?: string;
}

const HeatMapScreen = ({ navigation }: HeatMapScreenProps) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedCluster, setSelectedCluster] = useState<ViolationCluster | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [clusters, setClusters] = useState<ViolationCluster[]>([]);

  const mockClusters: ViolationCluster[] = [
    {
      id: '1',
      latitude: 40.7128,
      longitude: -74.0060,
      count: 15,
      severity: 'HIGH',
      address: 'Times Square Area, Manhattan',
      recentReports: [
        {
          id: '1',
          title: 'Oversized Billboard',
          type: 'Size Violation',
          status: 'PENDING',
          date: '2024-08-23',
          priority: 'HIGH',
          photoUri: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
        },
        {
          id: '2',
          title: 'Unauthorized Display',
          type: 'Permit Violation',
          status: 'UNDER_REVIEW',
          date: '2024-08-22',
          priority: 'MEDIUM',
        },
      ],
    },
    {
      id: '2',
      latitude: 40.7589,
      longitude: -73.9851,
      count: 8,
      severity: 'MEDIUM',
      address: 'Central Park East',
      recentReports: [
        {
          id: '3',
          title: 'Content Violation',
          type: 'Content Issue',
          status: 'APPROVED',
          date: '2024-08-21',
          priority: 'LOW',
        },
      ],
    },
    {
      id: '3',
      latitude: 40.6782,
      longitude: -73.9442,
      count: 23,
      severity: 'CRITICAL',
      address: 'Brooklyn Bridge Area',
      recentReports: [
        {
          id: '4',
          title: 'Safety Hazard',
          type: 'Structural Issue',
          status: 'PENDING',
          date: '2024-08-23',
          priority: 'CRITICAL',
          photoUri: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
        },
      ],
    },
  ];

  useEffect(() => {
    setClusters(mockClusters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterOptions = [
    { key: 'ALL', label: 'All Violations', color: '#6B7280' },
    { key: 'CRITICAL', label: 'Critical', color: '#EF4444' },
    { key: 'HIGH', label: 'High', color: '#F97316' },
    { key: 'MEDIUM', label: 'Medium', color: '#EAB308' },
    { key: 'LOW', label: 'Low', color: '#22C55E' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#EF4444';
      case 'HIGH': return '#F97316';
      case 'MEDIUM': return '#EAB308';
      case 'LOW': return '#22C55E';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#EAB308';
      case 'UNDER_REVIEW': return '#3B82F6';
      case 'APPROVED': return '#22C55E';
      case 'REJECTED': return '#EF4444';
      case 'RESOLVED': return '#10B981';
      default: return '#6B7280';
    }
  };

  const filteredClusters = clusters.filter(cluster => 
    selectedFilter === 'ALL' || cluster.severity === selectedFilter
  );

  const openClusterDetails = (cluster: ViolationCluster) => {
    setSelectedCluster(cluster);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedCluster(null);
  };

  const totalViolations = clusters.reduce((sum, cluster) => sum + cluster.count, 0);
  const criticalCount = clusters.filter(c => c.severity === 'CRITICAL').length;
  const pendingCount = clusters.reduce((sum, cluster) => 
    sum + cluster.recentReports.filter(r => r.status === 'PENDING').length, 0
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Violation Heat Map</Text>
        <TouchableOpacity style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalViolations}</Text>
          <Text style={styles.statLabel}>Total Violations</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#EF4444' }]}>{criticalCount}</Text>
          <Text style={styles.statLabel}>Critical Areas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#EAB308' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending Review</Text>
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterPill,
                selectedFilter === option.key && { backgroundColor: option.color + '20', borderColor: option.color }
              ]}
              onPress={() => setSelectedFilter(option.key)}
            >
              <View style={[styles.filterDot, { backgroundColor: option.color }]} />
              <Text style={[
                styles.filterPillText,
                selectedFilter === option.key && { color: option.color }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Placeholder - In real app, use react-native-maps */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={48} color="#9CA3AF" />
          <Text style={styles.mapPlaceholderText}>Interactive Map View</Text>
          <Text style={styles.mapSubtext}>Tap on clusters to view details</Text>
        </View>

        {/* Simulated Map Clusters */}
        {filteredClusters.map((cluster, index) => (
          <TouchableOpacity
            key={cluster.id}
            style={[
              styles.clusterMarker,
              { 
                backgroundColor: getSeverityColor(cluster.severity) + '20',
                borderColor: getSeverityColor(cluster.severity),
                top: 120 + (index * 80),
                left: 50 + (index * 100),
              }
            ]}
            onPress={() => openClusterDetails(cluster)}
          >
            <Text style={[styles.clusterCount, { color: getSeverityColor(cluster.severity) }]}>
              {cluster.count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Severity Levels</Text>
        <View style={styles.legendRow}>
          {filterOptions.slice(1).map((option) => (
            <View key={option.key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: option.color }]} />
              <Text style={styles.legendText}>{option.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Cluster Details Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Violation Cluster</Text>
                <Text style={styles.modalSubtitle}>{selectedCluster?.address}</Text>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            {selectedCluster && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.clusterStats}>
                  <View style={styles.clusterStatItem}>
                    <Text style={styles.clusterStatNumber}>{selectedCluster.count}</Text>
                    <Text style={styles.clusterStatLabel}>Total Reports</Text>
                  </View>
                  <View style={styles.clusterStatItem}>
                    <View style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(selectedCluster.severity) + '20' }
                    ]}>
                      <Text style={[
                        styles.severityText,
                        { color: getSeverityColor(selectedCluster.severity) }
                      ]}>
                        {selectedCluster.severity}
                      </Text>
                    </View>
                    <Text style={styles.clusterStatLabel}>Severity Level</Text>
                  </View>
                </View>

                <View style={styles.recentReportsSection}>
                  <Text style={styles.sectionTitle}>Recent Reports</Text>
                  {selectedCluster.recentReports.map((report) => (
                    <View key={report.id} style={styles.reportItem}>
                      {report.photoUri && (
                        <Image source={{ uri: report.photoUri }} style={styles.reportImage} />
                      )}
                      <View style={styles.reportContent}>
                        <Text style={styles.reportTitle}>{report.title}</Text>
                        <Text style={styles.reportType}>{report.type}</Text>
                        <View style={styles.reportMeta}>
                          <View style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(report.status) + '20' }
                          ]}>
                            <Text style={[
                              styles.statusText,
                              { color: getStatusColor(report.status) }
                            ]}>
                              {report.status.replace('_', ' ')}
                            </Text>
                          </View>
                          <Text style={styles.reportDate}>{report.date}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All Reports in Area</Text>
                  <Ionicons name="arrow-forward" size={16} color="#10B981" />
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  refreshButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statNumber: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: isSmallScreen ? 11 : 12,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  filterContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  filterPillText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  clusterMarker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clusterCount: {
    fontSize: 14,
    fontWeight: '700',
  },
  legendContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
  },
  clusterStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  clusterStatItem: {
    alignItems: 'center',
  },
  clusterStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  clusterStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recentReportsSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  reportItem: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  reportImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  reportType: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  reportDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
});

export default HeatMapScreen;