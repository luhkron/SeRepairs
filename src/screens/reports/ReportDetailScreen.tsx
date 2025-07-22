import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Linking, Platform } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { HomeStackParamList } from '../../navigation/types';
import { MaintenanceReport, Repair } from '../../../api/types';

type ReportDetailScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'ReportDetail'>;
type RouteParams = {
  reportId: number;
};

const statusInfo = {
  reported: {
    label: 'Reported',
    icon: 'alert-circle-outline',
    color: '#3B82F6', // Blue
    bgColor: '#EFF6FF',
  },
  in_progress: {
    label: 'In Progress',
    icon: 'wrench',
    color: '#F59E0B', // Amber
    bgColor: '#FFFBEB',
  },
  completed: {
    label: 'Completed',
    icon: 'check-circle-outline',
    color: '#10B981', // Green
    bgColor: '#ECFDF5',
  },
  cancelled: {
    label: 'Cancelled',
    icon: 'close-circle-outline',
    color: '#EF4444', // Red
    bgColor: '#FEF2F2',
  },
} as const;

const ReportDetailScreen = () => {
  const [report, setReport] = useState<MaintenanceReport | null>(null);
  const [repair, setRepair] = useState<Repair | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const theme = useTheme();
  const navigation = useNavigation<ReportDetailScreenNavigationProp>();
  const route = useRoute();
  const { reportId } = route.params as RouteParams;

  useEffect(() => {
    fetchReportDetails();
  }, [reportId]);

  const fetchReportDetails = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // TODO: Replace with actual API call
      // const response = await api.get(`/reports/${reportId}`);
      // setReport(response.data);
      // setRepair(response.data.repair || null);
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockReport: MaintenanceReport = {
        id: reportId,
        truck_id: 'TRK-001',
        issue_description: 'Engine overheating and unusual noise when accelerating. The temperature gauge shows higher than normal readings after 30 minutes of driving.',
        reported_date: new Date('2023-06-15T10:30:00Z').toISOString(),
        status: 'in_progress',
        image_url: 'https://example.com/truck-engine.jpg',
        driver_id: 1,
      };
      
      const mockRepair: Repair = {
        id: 1,
        report_id: reportId,
        workshop_id: 1,
        start_date: new Date('2023-06-16T09:00:00Z').toISOString(),
        end_date: null,
        status: 'in_progress',
        notes: 'Diagnosed coolant leak and faulty thermostat. Parts have been ordered and will be replaced within 2 business days.',
        created_at: new Date('2023-06-15T14:20:00Z').toISOString(),
        updated_at: new Date('2023-06-16T11:45:00Z').toISOString(),
        workshop: {
          id: 1,
          name: 'City Auto Service Center',
          location: '123 Main St, Anytown',
          contact: '(555) 123-4567',
          created_at: new Date('2023-01-10T00:00:00Z').toISOString(),
        },
      };
      
      setReport(mockReport);
      setRepair(mockRepair);
    } catch (err) {
      console.error('Error fetching report details:', err);
      setError('Failed to load report details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallWorkshop = () => {
    if (!repair?.workshop?.contact) return;
    
    const phoneNumber = repair.workshop.contact.replace(/[^\d+]/g, '');
    const url = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Phone calls are not supported on this device");
      }
    });
  };

  const handleGetDirections = () => {
    if (!repair?.workshop?.location) return;
    
    const address = encodeURIComponent(repair.workshop.location);
    const url = Platform.select({
      ios: `maps:?q=${address}`,
      android: `geo:0,0?q=${address}`,
    });
    
    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Error opening maps:', err);
        // Fallback to web URL if native maps fail
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
        Linking.openURL(webUrl);
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !report) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons 
          name="error-outline" 
          size={48} 
          color={theme.colors.error} 
          style={styles.errorIcon}
        />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error || 'Report not found'}
        </Text>
        <Button 
          mode="contained" 
          onPress={fetchReportDetails}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  const status = statusInfo[report.status as keyof typeof statusInfo] || statusInfo.reported;
  const hasRepair = !!repair;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons 
              name={status.icon} 
              size={24} 
              color={status.color} 
              style={styles.statusIcon}
            />
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          
          <View style={styles.reportIdContainer}>
            <Text style={styles.reportIdLabel}>Report ID</Text>
            <Text style={styles.reportId}>#{report.id.toString().padStart(4, '0')}</Text>
          </View>
        </View>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Truck Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Truck ID:</Text>
              <Text style={styles.infoValue}>{report.truck_id}</Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <Text style={[styles.sectionTitle, styles.sectionTitleSpacing]}>Issue Details</Text>
            <Text style={styles.issueDescription}>{report.issue_description}</Text>
            
            {report.image_url && (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: report.image_url }} 
                  style={styles.issueImage} 
                  resizeMode="cover"
                />
              </View>
            )}
            
            <View style={styles.reportedDateContainer}>
              <MaterialCommunityIcons 
                name="clock-time-four-outline" 
                size={16} 
                color="#6B7280" 
              />
              <Text style={styles.reportedDateText}>
                Reported on {formatDate(report.reported_date)}
              </Text>
            </View>
          </Card.Content>
        </Card>
        
        {hasRepair && repair && (
          <Card style={[styles.card, styles.repairCard]}>
            <Card.Content>
              <View style={styles.repairHeader}>
                <MaterialCommunityIcons 
                  name="garage" 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.repairTitle}>Repair Information</Text>
              </View>
              
              <View style={styles.workshopInfo}>
                <Text style={styles.workshopName}>{repair.workshop.name}</Text>
                <Text style={styles.workshopLocation}>
                  <MaterialIcons name="location-on" size={14} color="#6B7280" />
                  {' '}{repair.workshop.location}
                </Text>
                <Text style={styles.workshopContact}>
                  <MaterialIcons name="phone" size={14} color="#6B7280" />
                  {' '}{repair.workshop.contact}
                </Text>
              </View>
              
              <View style={styles.repairDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Chip 
                    style={[styles.statusChip, { backgroundColor: status.bgColor }]}
                    textStyle={{ color: status.color }}
                  >
                    {status.label}
                  </Chip>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Start Date:</Text>
                  <Text style={styles.detailValue}>
                    {repair.start_date ? formatDate(repair.start_date) : 'Not started'}
                  </Text>
                </View>
                
                {repair.end_date && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Completion Date:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(repair.end_date)}
                    </Text>
                  </View>
                )}
                
                {repair.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Mechanic's Notes:</Text>
                    <Text style={styles.notesText}>{repair.notes}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.actionButtons}>
                <Button 
                  mode="outlined" 
                  onPress={handleCallWorkshop}
                  style={styles.actionButton}
                  icon="phone"
                >
                  Call Workshop
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleGetDirections}
                  style={[styles.actionButton, styles.directionsButton]}
                  icon="map-marker"
                >
                  Get Directions
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
        
        {!hasRepair && (
          <Card style={[styles.card, styles.noRepairCard]}>
            <Card.Content style={styles.noRepairContent}>
              <MaterialCommunityIcons 
                name="tools" 
                size={48} 
                color="#9CA3AF" 
                style={styles.noRepairIcon}
              />
              <Text style={styles.noRepairTitle}>Repair Not Started</Text>
              <Text style={styles.noRepairText}>
                Your report has been received and is awaiting assignment to a workshop.
                You'll be notified once a mechanic has been assigned.
              </Text>
            </Card.Content>
          </Card>
        )}
        
        <View style={styles.footerSpacer} />
      </ScrollView>
      
      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Back to Reports
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    width: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reportIdContainer: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  reportIdLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  reportId: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  sectionTitleSpacing: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    color: '#6B7280',
  },
  infoValue: {
    flex: 1,
    color: '#111827',
    fontWeight: '500',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#E5E7EB',
  },
  issueDescription: {
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  issueImage: {
    width: '100%',
    height: 200,
  },
  reportedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  reportedDateText: {
    color: '#6B7280',
    fontSize: 12,
    marginLeft: 4,
  },
  repairCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  repairHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  repairTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#111827',
  },
  workshopInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  workshopName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
  },
  workshopLocation: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 4,
  },
  workshopContact: {
    color: '#6B7280',
    fontSize: 14,
  },
  repairDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  detailValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  statusChip: {
    height: 24,
    marginLeft: 8,
  },
  notesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  notesLabel: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  notesText: {
    color: '#4B5563',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  directionsButton: {
    backgroundColor: '#2563EB',
  },
  noRepairCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#9CA3AF',
  },
  noRepairContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noRepairIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  noRepairTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
    textAlign: 'center',
  },
  noRepairText: {
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerSpacer: {
    height: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  backButton: {
    width: '100%',
  },
});

export default ReportDetailScreen;
