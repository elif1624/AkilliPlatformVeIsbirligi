import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';

const ProjectsScreen = ({ navigation }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProjects();
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
      const response = await apiService.projects.getAll();
      
      // API'den veri gelmezse örnek veri kullan
      if (!response.data || response.data.length === 0) {
        const dummyProjects = [
          {
            id: 1,
            title: 'E-Ticaret Platformu Geliştirme',
            description: 'Küçük işletmeler için özelleştirilmiş e-ticaret platformu geliştirme projesi.',
            academic: 'Dr. Ayşe Yılmaz',
            tags: ['Web', 'React', 'Node.js'],
            progress: 45,
          },
          {
            id: 2,
            title: 'Yapay Zeka Destekli Mobil Uygulama',
            description: 'Doğal dil işleme teknikleri kullanarak kullanıcı davranışlarını analiz eden mobil uygulama.',
            academic: 'Prof. Dr. Mehmet Kaya',
            tags: ['AI', 'NLP', 'Mobile'],
            progress: 62,
          },
          {
            id: 3,
            title: 'Blockchain Tabanlı Kimlik Doğrulama',
            description: 'Merkezi olmayan kimlik doğrulama sistemi geliştirme projesi.',
            academic: 'Doç. Dr. Zeynep Demir',
            tags: ['Blockchain', 'Security'],
            progress: 28,
          },
          {
            id: 4,
            title: 'Derin Öğrenme ile Görüntü Sınıflandırma',
            description: 'Tıbbi görüntüleri sınıflandırmak için derin öğrenme modelleri geliştirme.',
            academic: 'Prof. Dr. Ali Yılmaz',
            tags: ['Deep Learning', 'Computer Vision', 'Healthcare'],
            progress: 75,
          },
          {
            id: 5,
            title: 'IoT Tabanlı Akıllı Ev Sistemleri',
            description: 'Enerji verimliliğini artırmak için IoT cihazları kullanan akıllı ev sistemleri geliştirme.',
            academic: 'Dr. Selin Kaya',
            tags: ['IoT', 'Embedded Systems'],
            progress: 55,
          },
        ];
        setProjects(dummyProjects);
        setFilteredProjects(dummyProjects);
      } else {
        setProjects(response.data);
        setFilteredProjects(response.data);
      }
    } catch (error) {
      console.error('Projeler alınırken hata oluştu:', error);
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
      onPress={() => navigation.navigate('ProjectDetail', { id: item.id })}
    >
      <View style={styles.projectHeader}>
        <Text style={styles.projectTitle}>{item.title}</Text>
        <Text style={styles.projectProgress}>{item.progress}%</Text>
      </View>
      
      <Text style={styles.projectAcademic}>{item.academic}</Text>
      
      <Text style={styles.projectDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.tagsContainer}>
        {item.tags && item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => navigation.navigate('ProjectDetail', { id: item.id })}
      >
        <Text style={styles.applyButtonText}>Başvur</Text>
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
  projectProgress: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
  },
  projectAcademic: {
    color: '#666',
    marginBottom: 8,
  },
  projectDescription: {
    color: '#444',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#e0f2fe',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  tagText: {
    color: '#3b82f6',
    fontSize: 12,
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
});

export default ProjectsScreen;
