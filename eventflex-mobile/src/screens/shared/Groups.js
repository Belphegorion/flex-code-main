import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, ActivityIndicator, 
  RefreshControl, StyleSheet, Dimensions, TouchableOpacity
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { colors, typography, radius } from '../../theme';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const { width } = Dimensions.get('window');

export default function GroupsScreen({ navigation }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [user?.id]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      // Assuming there's an endpoint to get groups for the user
      const response = await api.get(`/groups`);
      setGroups(response.groups || response.data || []);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      // In a real app, we would show an error message to the user
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchGroups();
  };

  const handleGroupPress = (group) => {
    navigation.navigate('GroupChat', { groupId: group.id, groupName: group.name });
  };

  if (loading && groups.length === 0) {
    return (
      <View style={styles.centeredLoader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}}>My Groups</Text>
        <Button 
          title="+ New Group"
          onPress={() => navigation.navigate('CreateGroup')}
          variant="outline"
          style={styles.newGroupButton}
        />
      </View>
      
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => handleGroupPress(item)}
            style={styles.groupItem}
          >
            <Card>
              <View style={styles.groupContent}>
                <Text style={styles.groupName}>{item.name}</Text>
                <Text style={styles.groupDescription}>{item.description || 'No description'}</Text>
                <View style={styles.groupFooter}>
                  <Text style={styles.memberCount}>
                    👥 {item.memberCount || 0} members
                  </Text>
                  <Text style={styles.lastMessage}>
                    {/* In a real app, we would show the last message timestamp or preview */}
                    Last message just now
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>You haven't joined any groups yet</Text>
            <Button 
              title="Create a Group"
              onPress={() => navigation.navigate('CreateGroup')}
              variant="outline"
              style={styles.emptyButton}
            />
          </View>
        }
        ListFooterComponent={
          <View style={styles.listFooter} />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  centeredLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    fontSize: typography['2xl'],
    fontWeight: '700',
    color: colors.gray900,
  },
  newGroupButton: {
    marginLeft: 12,
  },
  groupItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  groupContent: {
    padding: 16,
  },
  groupName: {
    fontSize: typography.lg,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: typography.base,
    color: colors.gray600,
    marginBottom: 12,
  },
  groupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  memberCount: {
    fontSize: typography.sm,
    color: colors.gray500,
  },
  lastMessage: {
    fontSize: typography.sm,
    color: colors.gray400,
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.gray500,
    marginBottom: 16,
  },
  emptyButton: {
    // We can adjust if needed
  },
  listFooter: {
    height: 80,
  },
});