import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';

const MentorDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorDetails();
  }, []);

  const fetchMentorDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.mentors.getById(id);
      setMentor(response.data);
    } catch (error) {
      console.error('Mentor detayları alınırken hata:', error);
      Alert.alert('Hata', 'Mentor detayları alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!mentor) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Mentor bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mentor Detayı</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{mentor.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{mentor.name}</Text>
          <Text style={styles.title}>{mentor.title}</Text>
          <Text style={styles.institution}>
            {mentor.department} • {mentor.university}
          </Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mentor.projects || 0}</Text>
            <Text style={styles.statLabel}>Aktif Proje</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mentor.students || 0}</Text>
            <Text style={styles.statLabel}>Öğrenci</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{mentor.completedProjects || 0}</Text>
            <Text style={styles.statLabel}>Tamamlanan</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uzmanlık Alanları</Text>
          <View style={styles.expertiseContainer}>
            {mentor.expertise && mentor.expertise.map((item, index) => (
              <View key={index} style={styles.expertiseItem}>
                <Text style={styles.expertiseText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>İletişime Geç</Text>
        </TouchableOpacity>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  institution: {
    fontSize: 16,
    color: '#666',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  expertiseItem: {
    backgroundColor: '#e5e7eb',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 3,
  },
  expertiseText: {
    color: '#4b5563',
  },
  contactButton: {
    backgroundColor: '#3b82f6',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});

export default MentorDetailScreen; 