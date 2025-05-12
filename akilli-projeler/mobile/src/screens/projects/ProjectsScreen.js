import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import supabase from '../../services/supabase';

const ProjectsScreen = ({ navigation }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProjects();
    // const interval = setInterval(() => {
    //   fetchProjects();
    // }, 5000); // 5 saniyede bir yenile
    // return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(
        (project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (project.tags && project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
      setFilteredProjects(filtered);
    }
  }, [searchQuery, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*');
      if (error) throw error;
      setProjects(data || []);
      setFilteredProjects(data || []);
    } catch (error) {
      console.error('Projeler alınırken hata oluştu:', error);
      setProjects([]);
      setFilteredProjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const renderProjectItem = ({ item }) => (
    <TouchableOpacity
      style={styles.projectCard}
      onPress={() => navigation.navigate('Projects', {
        screen: 'ProjectDetail',
        params: { id: item.id }
      })}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <Text style={styles.projectStatus}>{item.status}</Text>
      </View>
      
      <Text style={styles.mentorInfo}>
        {item.mentor?.title} {item.mentor?.name} {item.mentor?.surname}
      </Text>
      
      <Text style={styles.projectDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.projectDetails}>
        <Text style={styles.detailText}>
          <Ionicons name="people-outline" size={16} /> Max: {item.max_students} öğrenci
        </Text>
        <Text style={styles.detailText}>
          <Ionicons name="calendar-outline" size={16} /> Bitiş: {new Date(item.end_date).toLocaleDateString('tr-TR')}
        </Text>
      </View>
      
      <View style={styles.requirementsContainer}>
        {item.requirements && item.requirements.map((req, index) => (
          <View key={index} style={styles.requirement}>
            <Text style={styles.requirementText}>{req}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity
        style={[
          styles.applyButton,
          item.status !== 'active' && styles.applyButtonDisabled
        ]}
        onPress={() => navigation.navigate('Projects', {
          screen: 'ProjectDetail',
          params: { id: item.id }
        })}
        disabled={item.status !== 'active'}
      >
        <Text style={styles.applyButtonText}>
          {item.status === 'active' ? 'Başvur' : 'Başvuru Kapalı'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Projeler</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Proje ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={filteredProjects}
          renderItem={renderProjectItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Proje bulunamadı.</Text>
            </View>
          }
        />
      )}
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  projectStatus: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    textTransform: 'capitalize',
  },
  mentorInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  projectDescription: {
    color: '#444',
    marginBottom: 10,
  },
  projectDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 12,
  },
  requirement: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 12,
    color: '#374151',
  },
  applyButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
});

export default ProjectsScreen;
