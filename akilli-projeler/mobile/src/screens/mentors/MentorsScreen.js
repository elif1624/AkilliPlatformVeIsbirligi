import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import supabase from '../../services/supabase';

const MentorsScreen = ({ navigation }) => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMentors();
    // const interval = setInterval(() => {
    //   fetchMentors();
    // }, 5000); // 5 saniyede bir yenile
    // return () => clearInterval(interval);
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'teacher');
      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error('Mentorlar alınırken hata oluştu:', error);
      setMentors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMentorPress = (mentor) => {
    navigation.navigate('MentorDetail', { id: mentor.id });
  };

  const renderMentorItem = ({ item }) => {
    if (!item || !item.name) {
      return null;
    }

    return (
    <TouchableOpacity
      style={styles.mentorCard}
      onPress={() => handleMentorPress(item)}
    >
        <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        
        <View style={styles.mentorInfo}>
          <Text style={styles.mentorName}>{item.name}</Text>
          <Text style={styles.mentorTitle}>{item.title || 'Akademisyen'}</Text>
          <Text style={styles.mentorInstitution}>
            {item.department || ''} {item.department && item.university ? '•' : ''} {item.university || ''}
          </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.projects || 0}</Text>
            <Text style={styles.statLabel}>Proje</Text>
        </View>
        <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.students || 0}</Text>
            <Text style={styles.statLabel}>Öğrenci</Text>
        </View>
      </View>
      
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
  );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mentorlar</Text>
      </View>
      
        <FlatList
        data={mentors}
          renderItem={renderMentorItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz mentor bulunmuyor.</Text>
            </View>
          }
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContainer: {
    padding: 15,
  },
  mentorCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mentorTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  mentorInstitution: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default MentorsScreen;
