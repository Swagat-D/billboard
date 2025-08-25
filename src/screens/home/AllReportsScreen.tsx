/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

type AllReportsScreenProps = {
  navigation: StackNavigationProp<any>;
};

interface Report {
  id: string;
  title: string;
  location: string;
  violationType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  submittedDate: string;
  lastUpdated: string;
  photoUri?: string;
  notes: string;
  reportId: string;
}

interface StatusStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  current: boolean;
  timestamp?: string;
}

const AllReportsScreen = ({ navigation }: AllReportsScreenProps) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filter, setFilter] = useState<string>('ALL');

  // Mock data
  const mockReports: Report[] = [
    {
      id: '1',
      title: 'Times Square',
      location: '1560 Broadway, New York, NY',
      violationType: 'Unauthorized Billboard',
      priority: 'HIGH',
      status: 'PENDING',
      submittedDate: '2024-08-21T10:30:00Z',
      lastUpdated: '2024-08-21T10:30:00Z',
      photoUri: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
      notes: 'Large unauthorized billboard blocking traffic visibility',
      reportId: 'RPT-001234567',
    },
    {
      id: '2',
      title: 'Main Street',
      location: '450 Main St, Downtown',
      violationType: 'Size Violation',
      priority: 'MEDIUM',
      status: 'APPROVED',
      submittedDate: '2024-08-18T14:15:00Z',
      lastUpdated: '2024-08-20T09:45:00Z',
      photoUri: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
      notes: 'Billboard exceeds permitted dimensions by approximately 30%',
      reportId: 'RPT-001234568',
    },
    {
      id: '3',
      title: 'Highway 101',
      location: 'Mile Marker 45, Highway 101',
      violationType: 'Placement Violation',
      priority: 'CRITICAL',
      status: 'UNDER_REVIEW',
      submittedDate: '2024-08-22T16:20:00Z',
      lastUpdated: '2024-08-23T11:30:00Z',
      photoUri: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
      notes: 'Billboard placed too close to intersection creating safety hazard',
      reportId: 'RPT-001234569',
    },
    {
      id: '4',
      title: 'Central Park Avenue',
      location: '789 Central Park Ave, Manhattan',
      violationType: 'Missing Permit',
      priority: 'LOW',
      status: 'RESOLVED',
      submittedDate: '2024-08-15T08:45:00Z',
      lastUpdated: '2024-08-19T17:20:00Z',
      photoUri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
      notes: 'Billboard operating without proper city permit',
      reportId: 'RPT-001234570',
    },
    {
      id: '5',
      title: 'Brooklyn Bridge',
      location: '123 Brooklyn Bridge Rd, Brooklyn',
      violationType: 'Content Violation',
      priority: 'HIGH',
      status: 'REJECTED',
      submittedDate: '2024-08-19T13:10:00Z',
      lastUpdated: '2024-08-21T15:45:00Z',
      photoUri: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400',
      notes: 'Inappropriate content displayed during family hours',
      reportId: 'RPT-001234571',
    },
  ];

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const getStatusSteps = (report: Report): StatusStep[] => {
    const baseSteps = [
      {
        id: 'submitted',
        title: 'Report Submitted',
        description: 'Your violation report has been successfully submitted',
        icon: 'document-text-outline',
        completed: true,
        current: false,
        timestamp: report.submittedDate,
      },
      {
        id: 'review',
        title: 'Under Review',
        description: 'Our team is reviewing your report for validity',
        icon: 'eye-outline',
        completed: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED'].includes(report.status),
        current: report.status === 'UNDER_REVIEW',
        timestamp: report.status !== 'PENDING' ? report.lastUpdated : undefined,
      },
    ];

    if (report.status === 'APPROVED' || report.status === 'RESOLVED') {
      baseSteps.push({
        id: 'approved',
        title: 'Report Approved',
        description: 'Violation confirmed and forwarded to authorities',
        icon: 'checkmark-circle-outline',
        completed: true,
        current: report.status === 'APPROVED',
        timestamp: report.lastUpdated,
      });

      if (report.status === 'RESOLVED') {
        baseSteps.push({
          id: 'resolved',
          title: 'Issue Resolved',
          description: 'Violation has been addressed and resolved',
          icon: 'shield-checkmark-outline',
          completed: true,
          current: true,
          timestamp: report.lastUpdated,
        });
      }
    } else if (report.status === 'REJECTED') {
      baseSteps.push({
        id: 'rejected',
        title: 'Report Rejected',
        description: 'Report did not meet validation criteria',
        icon: 'close-circle-outline',
        completed: true,
        current: true,
        timestamp: report.lastUpdated,
      });
    }

    return baseSteps;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'PENDING';
      case 'UNDER_REVIEW': return 'UNDER REVIEW';
      case 'APPROVED': return 'APPROVED';
      case 'REJECTED': return 'REJECTED';
      case 'RESOLVED': return 'RESOLVED';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredReports = reports.filter(report => 
    filter === 'ALL' || report.status === filter
  );

  const filterOptions = [
    { key: 'ALL', label: 'All Reports', count: reports.length },
    { key: 'PENDING', label: 'Pending', count: reports.filter(r => r.status === 'PENDING').length },
    { key: 'UNDER_REVIEW', label: 'Under Review', count: reports.filter(r => r.status === 'UNDER_REVIEW').length },
    { key: 'APPROVED', label: 'Approved', count: reports.filter(r => r.status === 'APPROVED').length },
    { key: 'RESOLVED', label: 'Resolved', count: reports.filter(r => r.status === 'RESOLVED').length },
    { key: 'REJECTED', label: 'Rejected', count: reports.filter(r => r.status === 'REJECTED').length },
  ];

  const openReportDetails = (report: Report) => {
    setSelectedReport(report);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedReport(null);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Reports</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Reports</Text>
        <View style={styles.placeholder} />
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
                filter === option.key && styles.filterPillActive
              ]}
              onPress={() => setFilter(option.key)}
            >
              <Text style={[
                styles.filterPillText,
                filter === option.key && styles.filterPillTextActive
              ]}>
                {option.label} ({option.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reports List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredReports.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={styles.reportCard}
            onPress={() => openReportDetails(report)}
            activeOpacity={0.7}
          >
            <View style={styles.reportHeader}>
              <View style={styles.reportTitleRow}>
                <Text style={styles.reportTitle} numberOfLines={1}>{report.title}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(report.status)}20` }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: getStatusColor(report.status) }
                  ]}>
                    {getStatusText(report.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.reportLocation} numberOfLines={1}>{report.location}</Text>
            </View>

            <View style={styles.reportDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Violation:</Text>
                <Text style={styles.detailValue} numberOfLines={1}>{report.violationType}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Priority:</Text>
                <View style={[
                  styles.priorityBadge,
                  { backgroundColor: `${getPriorityColor(report.priority)}20` }
                ]}>
                  <Text style={[
                    styles.priorityText,
                    { color: getPriorityColor(report.priority) }
                  ]}>
                    {report.priority}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.reportFooter}>
              <Text style={styles.reportDate}>
                Submitted {formatDate(report.submittedDate)}
              </Text>
              <View style={styles.viewMore}>
                <Text style={styles.viewMoreText}>View Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#10B981" />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredReports.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Reports Found</Text>
            <Text style={styles.emptyText}>
              {filter === 'ALL' 
                ? 'You haven\'t submitted any reports yet.'
                : `No reports with status "${getStatusText(filter)}" found.`
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Report Details Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Details</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            {selectedReport && (
              <ScrollView 
                style={styles.modalBody} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                {/* Report Info */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Report Information</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Report ID:</Text>
                    <Text style={styles.infoValue}>{selectedReport.reportId}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Location:</Text>
                    <Text style={styles.infoValue}>{selectedReport.title}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Address:</Text>
                    <Text style={styles.infoValue}>{selectedReport.location}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Violation Type:</Text>
                    <Text style={styles.infoValue}>{selectedReport.violationType}</Text>
                  </View>
                </View>

                {/* Photo */}
                {selectedReport.photoUri && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Evidence Photo</Text>
                    <Image 
                      source={{ uri: selectedReport.photoUri }} 
                      style={styles.modalPhoto} 
                    />
                  </View>
                )}

                {/* Status Timeline */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Status Timeline</Text>
                  <View style={styles.timeline}>
                    {getStatusSteps(selectedReport).map((step, index) => (
                      <View key={step.id} style={styles.timelineItem}>
                        <View style={styles.timelineIcon}>
                          <View style={[
                            styles.iconCircle,
                            step.completed && styles.iconCircleCompleted,
                            step.current && styles.iconCircleCurrent,
                          ]}>
                            <Ionicons 
                              name={step.icon as any} 
                              size={16} 
                              color={step.completed ? 'white' : '#9CA3AF'} 
                            />
                          </View>
                          {index < getStatusSteps(selectedReport).length - 1 && (
                            <View style={[
                              styles.timelineConnector,
                              step.completed && styles.timelineConnectorCompleted
                            ]} />
                          )}
                        </View>
                        <View style={styles.timelineContent}>
                          <Text style={[
                            styles.timelineTitle,
                            step.current && styles.timelineTitleCurrent
                          ]}>
                            {step.title}
                          </Text>
                          <Text style={styles.timelineDescription}>
                            {step.description}
                          </Text>
                          {step.timestamp && (
                            <Text style={styles.timelineTimestamp}>
                              {formatDateTime(step.timestamp)}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Notes */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Additional Notes</Text>
                  <Text style={styles.notesText}>{selectedReport.notes}</Text>
                </View>
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
const isLargeScreen = width > 414;

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
    paddingBottom: isSmallScreen ? 8 : 12,
    paddingTop: 28,
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
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  filterContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: isSmallScreen ? 8 : 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    minHeight: 36,
  },
  filterPill: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingVertical: isSmallScreen ? 6 : 8,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterPillActive: {
    backgroundColor: '#10B981',
  },
  filterPillText: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  filterPillTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reportHeader: {
    marginBottom: 12,
  },
  reportTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  reportLocation: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: isSmallScreen ? 60 : 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '600',
  },
  reportDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#1F2937',
    fontWeight: '400',
    flex: 2,
    textAlign: 'right',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: isSmallScreen ? 50 : 60,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '600',
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  reportDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#10B981',
    fontWeight: '500',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
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
    maxHeight: height * 0.9,
    minHeight: height * 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalSection: {
    marginVertical: 16,
  },
  modalSectionTitle: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    minHeight: 20,
  },
  infoLabel: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#1F2937',
    fontWeight: '400',
    flex: 2,
    textAlign: 'right',
  },
  modalPhoto: {
    width: '100%',
    height: width * 0.5,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineIcon: {
    alignItems: 'center',
    marginRight: 16,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  iconCircleCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  iconCircleCurrent: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  timelineConnector: {
    width: 2,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginTop: 8,
  },
  timelineConnectorCompleted: {
    backgroundColor: '#10B981',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  timelineTitle: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  timelineTitleCurrent: {
    color: '#3B82F6',
  },
  timelineDescription: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  timelineTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notesText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#1F2937',
    lineHeight: 20,
  },
});

export default AllReportsScreen;