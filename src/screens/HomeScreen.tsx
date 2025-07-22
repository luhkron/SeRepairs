import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Button, Avatar, useTheme, ActivityIndicator, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { MaintenanceReport } from '../../api/types';

const statusColors = {
  reported: '#3B82F6',    // Blue
  in_progress: '#F59E0B', // Amber
  completed: '#10B981',   // Green
  cancelled: '#EF4444',   // Red
};

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

const HomeScreen = () => {
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, logout } = useAuth();

  const fetchReports = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.get('/reports');
      // setReports(response.data);
      
      // Mock data for now
      setTimeout(() => {
        setReports([
          {
            id: 1,
            truck_id: 'TRK-001',
            issue_description: 'Engine overheating and unusual noise',
            reported_date: new Date('2023-06-15T10:30:00Z').toISOString(),
            status: 'in_progress',
            image_url: null,
            driver_id: 1,
          },
          {
            id: 2,
            truck_id: 'TRK-045',
            issue_description: 'Brakes making squeaking noise',
            reported_date: new Date('2023-06-10T14:15:00Z').toISOString(),
            status: 'reported',
            image_url: null,
            driver_id: 1,
          },
          {
            id: 3,
            truck_id: 'TRK-012',
            issue_description: 'AC not working',
            reported_date: new Date('2023-06-01T09:45:00Z').toISOString(),
            status: 'completed',
            image_url: null,
            driver_id: 1,
          },
        ]);
        setIsLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again.');
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const navigateToReport = (report: MaintenanceReport) => {
    navigation.navigate('ReportDetail', { reportId: report.id });
  };

  const navigateToNewReport = () => {
    navigation.navigate('ReportIssue');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusLabel = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderReportItem = ({ item }: { item: MaintenanceReport }) => (
    <TouchableOpacity onPress={() => navigateToReport(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.truckId}>
              {item.truck_id}
            </Text>
            <View 
              style={[
                styles.statusBadge, 
                { backgroundColor: `${statusColors[item.status as keyof typeof statusColors]}20` }
              ]}
            >
              <Text 
                style={[
                  styles.statusText, 
                  { color: statusColors[item.status as keyof typeof statusColors] }
                ]}
              >
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>
          <Text variant="bodyMedium" style={styles.issueDescription} numberOfLines={2}>
            {item.issue_description}
          </Text>
          <View style={styles.cardFooter}>
            <Text variant="labelSmall" style={styles.dateText}>
              {formatDate(item.reported_date)}
            </Text>
            <Button 
              mode="text" 
              onPress={() => navigateToReport(item)}
              textColor={theme.colors.primary}
              compact
            >
              View Details
            </Button>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={fetchReports}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text variant="titleMedium" style={styles.greeting}>
            Hello, {user?.name || 'Driver'}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {reports.length} {reports.length === 1 ? 'report' : 'reports'} in total
          </Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Avatar.Icon size={40} icon="logout" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              No reports found. Tap + to create your first report.
            </Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={navigateToNewReport}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#6B7280',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  truckId: {
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  issueDescription: {
    color: '#4B5563',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2563EB',
  },
});

export default HomeScreen;
