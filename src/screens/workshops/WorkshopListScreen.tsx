import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ListRenderItem, RefreshControl, ActivityIndicator } from 'react-native';
import { Searchbar, Card, Title, Paragraph, Button, useTheme, Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabParamList } from '../../navigation/types';
import { Workshop } from '../../api/types';
import { workshopsApi } from '../../api/api';

type WorkshopListScreenNavigationProp = StackNavigationProp<BottomTabParamList, 'Workshops'>;

const WorkshopListScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<WorkshopListScreenNavigationProp>();
  
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState<Workshop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch workshops
  const fetchWorkshops = useCallback(async () => {
    try {
      setError(null);
      const data = await workshopsApi.getWorkshops();
      setWorkshops(data);
      setFilteredWorkshops(data);
    } catch (err: any) {
      console.error('Error fetching workshops:', err);
      setError(err.message || 'Failed to load workshops');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  // Initial load
  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);
  
  // Filter workshops based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWorkshops(workshops);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = workshops.filter(
        (workshop) =>
          workshop.name.toLowerCase().includes(query) ||
          workshop.location.toLowerCase().includes(query) ||
          workshop.contact.toLowerCase().includes(query)
      );
      setFilteredWorkshops(filtered);
    }
  }, [searchQuery, workshops]);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWorkshops();
  }, [fetchWorkshops]);
  
  const handleWorkshopPress = (workshop: Workshop) => {
    navigation.navigate('WorkshopDetail', { workshopId: workshop.id });
  };
  
  const handleCallWorkshop = (phoneNumber: string) => {
    // In a real app, you would use Linking to make a phone call
    console.log('Calling workshop:', phoneNumber);
    // Linking.openURL(`tel:${phoneNumber}`);
  };
  
  const handleGetDirections = (workshop: Workshop) => {
    // In a real app, you would open a maps app with the workshop's location
    console.log('Getting directions to:', workshop.location);
    // const url = Platform.select({
    //   ios: `maps:0,0?q=${encodeURIComponent(workshop.location)}`,
    //   android: `geo:0,0?q=${encodeURIComponent(workshop.location)}`,
    // });
    // Linking.openURL(url);
  };
  
  const renderWorkshopItem: ListRenderItem<Workshop> = ({ item }) => (
    <Card 
      style={styles.card} 
      onPress={() => handleWorkshopPress(item)}
      elevation={2}
    >
      <Card.Content>
        <View style={styles.workshopHeader}>
          <MaterialCommunityIcons 
            name="garage" 
            size={24} 
            color={theme.colors.primary} 
            style={styles.workshopIcon}
          />
          <Title style={styles.workshopName}>{item.name}</Title>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons 
            name="map-marker" 
            size={16} 
            color={theme.colors.textSecondary} 
          />
          <Paragraph style={styles.infoText}>{item.location}</Paragraph>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialCommunityIcons 
            name="phone" 
            size={16} 
            color={theme.colors.textSecondary} 
          />
          <Paragraph style={styles.infoText}>{item.contact}</Paragraph>
        </View>
        
        <View style={styles.actions}>
          <Button 
            mode="outlined" 
            onPress={() => handleCallWorkshop(item.contact)}
            style={styles.actionButton}
            compact
          >
            Call
          </Button>
          <Button 
            mode="contained" 
            onPress={() => handleGetDirections(item)}
            style={[styles.actionButton, { marginLeft: 8 }]}
            compact
          >
            Directions
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
  
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MaterialCommunityIcons 
          name="alert-circle-outline" 
          size={48} 
          color={theme.colors.error} 
        />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
        <Button 
          mode="contained" 
          onPress={fetchWorkshops}
          style={{ marginTop: 16 }}
        >
          Retry
        </Button>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search workshops..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={theme.colors.primary}
        placeholderTextColor={theme.colors.textSecondary}
      />
      
      <FlatList
        data={filteredWorkshops}
        renderItem={renderWorkshopItem}
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
          <View style={[styles.centered, { padding: 32 }]}>
            <MaterialCommunityIcons 
              name="garage-variant" 
              size={64} 
              color={theme.colors.textSecondary} 
            />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No workshops found
            </Text>
          </View>
        }
      />
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
  searchBar: {
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  workshopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workshopIcon: {
    marginRight: 8,
  },
  workshopName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actionButton: {
    minWidth: 100,
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default WorkshopListScreen;
