import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

const ProjectDetailScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.projects.getById(id);
      
      if (!response.data) {
        // Örnek proje verisi
        const dummyProject = {
          id: id,
          title: 'Yapay Zeka ile Doğal Dil İşleme',
          description: 'Türkçe metinler için doğal dil işleme ve konu sınıflandırması yapan bir NLP projesi. REST tabanlı modeller geliştireceğiz.',
          requirements: ['Python', 'NLP', 'Deep Learning', 'REST API'],
          max_students: 3,
          start_date: '2024-04-01',
          end_date: '2024-09-01',
          status: 'active',
          mentor: {
            id: 1,
            title: 'Prof. Dr.',
            name: 'Ayşe',
            surname: 'Yılmaz',
            department: 'Computer Engineering',
            expertise_areas: ['AI', 'NLP', 'Machine Learning'],
            office_location: 'A-101'
          },
          applications: [
            {
              id: 1,
              student_id: '123',
              status: 'pending',
              motivation_letter: 'Bu projede yer almak istiyorum...',
              created_at: '2024-03-15'
            }
          ]
        };
        setProject(dummyProject);
        
        // Kullanıcının başvurusunu kontrol et
        if (user) {
          const hasExistingApplication = dummyProject.applications.some(
            app => app.student_id === user.id
          );
          setHasApplied(hasExistingApplication);
        }
      } else {
        setProject(response.data);
        
        if (user) {
          const hasExistingApplication = response.data.applications.some(
            app => app.student_id === user.id
          );
          setHasApplied(hasExistingApplication);
        }
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      Alert.alert('Error', 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'You need to login to apply for this project',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    try {
      setApplying(true);
      
      await apiService.projects.apply(id, {
        student_id: user.id,
        motivation_letter: 'I would like to join this project...' // Bu kısmı bir form ile alabiliriz
      });
      
      setHasApplied(true);
      Alert.alert('Success', 'Your application has been submitted successfully');
    } catch (error) {
      console.error('Error applying to project:', error);
      Alert.alert('Error', 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleFavorite = () => {
    // Favorilere ekleme/çıkarma işlemi
    Alert.alert('Bilgi', 'Favorilere ekleme özelliği yakında eklenecek.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Proje bulunamadı.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
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
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavorite}
        >
          <Ionicons name="heart-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, styles[`status_${project.status}`]]}>
              {project.status}
            </Text>
          </View>
        </View>

        <View style={styles.mentorInfo}>
          <Text style={styles.mentorTitle}>Project Mentor</Text>
          <Text style={styles.mentorName}>
            {project.mentor?.title} {project.mentor?.name} {project.mentor?.surname}
          </Text>
          <Text style={styles.mentorDepartment}>{project.mentor?.department}</Text>
          <Text style={styles.mentorLocation}>Office: {project.mentor?.office_location}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{project.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <View style={styles.requirementsContainer}>
            {project.requirements?.map((req, index) => (
              <View key={index} style={styles.requirement}>
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={20} color="#666" />
              <Text style={styles.detailLabel}>Max Students</Text>
              <Text style={styles.detailValue}>{project.max_students}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.detailLabel}>Start Date</Text>
              <Text style={styles.detailValue}>
                {new Date(project.start_date).toLocaleDateString('tr-TR')}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.detailLabel}>End Date</Text>
              <Text style={styles.detailValue}>
                {new Date(project.end_date).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          </View>
        </View>

        {project.mentor?.expertise_areas && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mentor Expertise</Text>
            <View style={styles.expertiseContainer}>
              {project.mentor.expertise_areas.map((area, index) => (
                <View key={index} style={styles.expertiseItem}>
                  <Text style={styles.expertiseText}>{area}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {applying ? (
          <ActivityIndicator size="small" color="#3b82f6" />
        ) : (
          <TouchableOpacity
            style={[
              styles.applyButton,
              (hasApplied || project.status !== 'active') && styles.applyButtonDisabled
            ]}
            onPress={handleApply}
            disabled={hasApplied || project.status !== 'active'}
          >
            <Text style={styles.applyButtonText}>
              {hasApplied
                ? 'Already Applied'
                : project.status !== 'active'
                  ? 'Applications Closed'
                  : 'Apply Now'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  favoriteButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  projectHeader: {
    marginBottom: 20,
  },
  projectTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    overflow: 'hidden',
    textTransform: 'capitalize',
  },
  status_active: {
    backgroundColor: '#10b981',
    color: '#fff',
  },
  status_draft: {
    backgroundColor: '#6b7280',
    color: '#fff',
  },
  status_completed: {
    backgroundColor: '#3b82f6',
    color: '#fff',
  },
  status_cancelled: {
    backgroundColor: '#ef4444',
    color: '#fff',
  },
  mentorInfo: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  mentorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  mentorName: {
    fontSize: 18,
    color: '#111827',
    marginBottom: 4,
  },
  mentorDepartment: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  mentorLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  description: {
    lineHeight: 20,
    color: '#444',
  },
  requirementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  requirement: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#374151',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  detailItem: {
    alignItems: 'center',
    minWidth: '30%',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    marginTop: 2,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  expertiseItem: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  expertiseText: {
    fontSize: 14,
    color: '#0369a1',
  },
  footer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#d1d5db',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
});

export default ProjectDetailScreen;
