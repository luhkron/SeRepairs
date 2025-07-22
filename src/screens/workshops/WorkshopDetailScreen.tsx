import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  Text, 
  Title, 
  Paragraph, 
  Button, 
  useTheme, 
  Card, 
  Chip, 
  Divider,
  ActivityIndicator,
  IconButton,
  Avatar,
  Badge,
} from 'react-native-paper';

import { HomeStackParamList } from '../../navigation/types';
import { workshopsApi, Workshop } from '../../api/api';

type WorkshopDetailScreenRouteProp = RouteProp<HomeStackParamList, 'WorkshopDetail'>;
type WorkshopDetailScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'WorkshopDetail'>;

const WorkshopDetailScreen = () => {
  const theme = useTheme();
  const route = useRoute<WorkshopDetailScreenRouteProp>();
  const { workshopId } = route.params;
  
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch workshop details
  useEffect(() => {
    const fetchWorkshopDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await workshopsApi.getWorkshop(workshopId);
        setWorkshop(data);
      } catch (err: any) {
        console.error('Error fetching workshop details:', err);
        setError(err.message || 'Failed to load workshop details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkshopDetails();
  }, [workshopId]);
  
  const handleCallPress = () => {
    if (!workshop) return;
    
    const phoneNumber = workshop.contact.replace(/[^0-9+]/g, '');
    const url = `tel:${phoneNumber}`;
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => {
        console.error('Error opening phone app:', err);
        Alert.alert('Error', 'Could not open phone app');
      });
  };
  
  const handleDirectionsPress = () => {
    if (!workshop) return;
    
    // Format the address for maps
    const address = encodeURIComponent(workshop.location);
    let url = '';
    
    if (Platform.OS === 'ios') {
      url = `http://maps.apple.com/?address=${address}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    }
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          // Fallback to web URL if native maps app is not available
          return Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Could not open maps');
      });
  };
  
  const handleReportIssue = () => {
    // Navigate to report issue screen with workshop pre-selected
    // navigation.navigate('ReportIssue', { workshopId: workshop.id });
    Alert.alert('Report Issue', 'This would open the report issue screen with the workshop pre-selected.');
  };
  
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  if (error || !workshop) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MaterialCommunityIcons 
          name="alert-circle-outline" 
          size={48} 
          color={theme.colors.error} 
        />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error || 'Workshop not found'}
        </Text>
        <Button 
          mode="contained" 
          onPress={() => {
            setLoading(true);
            setError(null);
            // Retry fetching workshop details
            const fetchWorkshopDetails = async () => {
              try {
                const data = await workshopsApi.getWorkshop(workshopId);
                setWorkshop(data);
              } catch (err: any) {
                console.error('Error fetching workshop details:', err);
                setError(err.message || 'Failed to load workshop details');
              } finally {
                setLoading(false);
              }
            };
            fetchWorkshopDetails();
          }}
          style={{ marginTop: 16 }}
        >
          Retry
        </Button>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Avatar.Icon 
              size={80} 
              icon="garage" 
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
              color="white"
            />
          </View>
          <Title style={styles.title}>{workshop.name}</Title>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons 
              name="star" 
              size={20} 
              color={theme.colors.warning} 
            />
            <Text style={[styles.ratingText, { color: theme.colors.text }]}>
              4.8 (24 reviews)
            </Text>
          </View>
        </View>
        
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons 
                  name="information-outline" 
                  size={20} 
                  color={theme.colors.primary} 
                  style={styles.sectionIcon}
                />
                <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Information
                </Title>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialCommunityIcons 
                  name="map-marker" 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                    Address
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {workshop.location}
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialCommunityIcons 
                  name="phone" 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                    Contact
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.primary }]}>
                    {workshop.contact}
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <MaterialCommunityIcons 
                  name="clock-outline" 
                  size={20} 
                  color={theme.colors.textSecondary} 
                />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
                    Working Hours
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    Mon-Fri: 8:00 AM - 6:00 PM
                  </Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    Sat: 9:00 AM - 2:00 PM
                  </Text>
                </View>
              </View>
            </View>
            
            <Divider style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons 
                  name="wrench" 
                  size={20} 
                  color={theme.colors.primary} 
                  style={styles.sectionIcon}
                />
                <Title style={[styles.sectionTitle, { color: theme.colors.primary }]}>
                  Services
                </Title>
              </View>
              
              <View style={styles.servicesContainer}>
                {['Engine Repair', 'Brake Service', 'Oil Change', 'Tire Service', 'Diagnostics'].map(
                  (service) => (
                    <Chip 
                      key={service}
                      style={[styles.serviceChip, { backgroundColor: theme.colors.surfaceVariant }]}
                      textStyle={{ color: theme.colors.onSurfaceVariant }}
                    >
                      {service}
                    </Chip>
                  )
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <View style={styles.actionButtons}>
          <Button 
            mode="contained" 
            icon="phone" 
            onPress={handleCallPress}
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ color: 'white' }}
          >
            Call Now
          </Button>
          
          <Button 
            mode="outlined" 
            icon="map-marker" 
            onPress={handleDirectionsPress}
            style={[styles.actionButton, { borderColor: theme.colors.primary }]}
            labelStyle={{ color: theme.colors.primary }}
          >
            Get Directions
          </Button>
          
          <Button 
            mode="contained-tonal" 
            icon="alert-circle-outline" 
            onPress={handleReportIssue}
            style={[styles.actionButton, { marginTop: 8 }]}
          >
            Report an Issue
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#6200ee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 16,
  },
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
  },
  divider: {
    marginVertical: 16,
    height: 1,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  serviceChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtons: {
    padding: 16,
    paddingTop: 0,
  },
  actionButton: {
    marginBottom: 12,
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default WorkshopDetailScreen;
