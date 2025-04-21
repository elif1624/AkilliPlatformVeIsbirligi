import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';

const MentorsScreen = ({ navigation }) => {
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMentors(mentors);
    } else {
      const filtered = mentors.filter(
        (mentor) =>
          mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          mentor.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
          mentor.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMentors(filtered);
    }
  }, [searchQuery, mentors]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      // API'den mentor listesini getir
      const response = await apiService.mentors.getAll();
      
      // API'den veri gelmezse örnek veri kullan
      if (!response.data || response.data.length === 0) {
        const dummyMentors = [
          {
            id: 1,
            name: 'Prof. Dr. Ali Yılmaz',
            avatar: null,
            department: 'Bilgisayar Mühendisliği',
            university: 'Fırat Üniversitesi',
            expertise: ['Yapay Zeka', 'Veri Madenciliği'],
            projects: 8,
            students: 12,
            available: true,
            lastActive: '2024-04-20',
          },
          {
            id: 2,
            name: 'Dr. Selin Kaya',
            avatar: null,
            department: 'Web Teknolojileri',
            university: 'Fırat Üniversitesi',
            expertise: ['Web Geliştirme', 'Mobil Uygulama'],
            projects: 5,
            students: 7,
            available: true,
            lastActive: '2024-04-19',
          },
          {
            id: 3,
            name: 'Doç. Dr. Mehmet Demir',
            avatar: null,
            department: 'Veri Bilimi',
            university: 'Fırat Üniversitesi',
            expertise: ['Büyük Veri', 'Makine Öğrenmesi'],
            projects: 10,
            students: 15,
            available: false,
            lastActive: '2024-04-15',
          },
          {
            id: 4,
            name: 'Prof. Dr. Zeynep Aydın',
            avatar: null,
            department: 'Yazılım Mühendisliği',
            university: 'Fırat Üniversitesi',
            expertise: ['Yazılım Mimarisi', 'Yazılım Kalitesi'],
            projects: 12,
            students: 20,
            available: true,
            lastActive: '2024-04-18',
          },
        ];
        setMentors(dummyMentors);
        setFilteredMentors(dummyMentors);
      } else {
        setMentors(response.data);
        setFilteredMentors(response.data);
      }
    } catch (error) {
      console.error('Mentorlar alınırken hata oluştu:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMentors();
  };

  const handleMentorPress = (mentor) => {
    // Mentor detay sayfasına yönlendir
    Alert.alert('Bilgi', 'Mentor detay sayfası yakında eklenecek.');
  };

  const renderMentorItem = ({ item }) => (
    <TouchableOpacity
      style={styles.mentorCard}
      onPress={() => handleMentorPress(item)}
    >
      <View style={styles.mentorHeader}>
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
          )}
          {item.available && <View style={styles.availableBadge} />}
        </View>
        
        <View style={styles.mentorInfo}>
          <Text style={styles.mentorName}>{item.name}</Text>
          <Text style={styles.mentorDepartment}>{item.department}</Text>
          <Text style={styles.mentorUniversity}>{item.university}</Text>
        </View>
      </View>
      
      <View style={styles.expertiseContainer}>
        {item.expertise.map((skill, index) => (
          <View key={index} style={styles.expertiseItem}>
            <Text style={styles.expertiseText}>{skill}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.projects}</Text>
          <Text style={styles.statLabel}>Aktif Projeler</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.students}</Text>
          <Text style={styles.statLabel}>Öğrenciler</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Son Aktif</Text>
          <Text style={styles.statValue}>{item.lastActive}</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.contactButton,
          !item.available && styles.contactButtonDisabled,
        ]}
        disabled={!item.available}
        onPress={() => Alert.alert('Bilgi', 'İletişim özelliği yakında eklenecek.')}
      >
        <Text style={[
          styles.contactButtonText,
          !item.available && styles.contactButtonTextDisabled,
        ]}>
          {item.available ? 'İletişime Geç' : 'Şu Anda Müsait Değil'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Önerilen Mentörler</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Mentor ara..."
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
          data={filteredMentors}
          renderItem={renderMentorItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Mentor bulunamadı.</Text>
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
  mentorCard: {
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
  mentorHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  availableBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  mentorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  mentorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  mentorDepartment: {
    color: '#666',
    marginBottom: 2,
  },
  mentorUniversity: {
    color: '#666',
    fontSize: 12,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  expertiseItem: {
    backgroundColor: '#e0f2fe',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  expertiseText: {
    color: '#3b82f6',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  contactButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  contactButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  contactButtonTextDisabled: {
    color: '#666',
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
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
});

export default MentorsScreen;
