import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

const MentorDetailScreen = ({ route, navigation }) => {
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = route.params;

  useEffect(() => {
    fetchMentorDetails();
  }, []);

  const fetchMentorDetails = async () => {
    try {
      const { data } = await api.mentors.getById(id);
      setMentor(data);
    } catch (error) {
      console.error('Error fetching mentor details:', error);
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
        <Text>Mentor bulunamadı.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mentor Detayı</Text>
        </View>

        {/* Mentor Info */}
        <View style={styles.mentorInfo}>
          <Text style={styles.name}>{mentor.name}</Text>
          <Text style={styles.title}>{mentor.title}</Text>
          <Text style={styles.university}>{mentor.university}</Text>
          <Text style={styles.department}>{mentor.department}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
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

        {/* Expertise */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uzmanlık Alanları</Text>
          <View style={styles.expertiseContainer}>
            {Array.isArray(mentor.expertise) && mentor.expertise.map((skill, index) => (
              <View key={index} style={styles.expertiseItem}>
                <Text style={styles.expertiseText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Button */}
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>İletişime Geç</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  mentorInfo: {
    padding: 16,
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    color: '#4b5563',
    marginBottom: 4,
  },
  university: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2,
  },
  department: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f3f4f6',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  expertiseItem: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  expertiseText: {
    color: '#4b5563',
    fontSize: 14,
  },
  contactButton: {
    backgroundColor: '#3b82f6',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MentorDetailScreen; 