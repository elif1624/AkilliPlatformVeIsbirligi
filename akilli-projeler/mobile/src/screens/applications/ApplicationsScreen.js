import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';

const ApplicationsScreen = ({ route, navigation }) => {
  const { id: projectId } = route.params;
  const [applications, setApplications] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Proje bilgilerini getir
      const projectResponse = await apiService.projects.getById(projectId);
      
      // Projeye ait başvuruları getir
      const applicationsResponse = await apiService.projects.getApplications(projectId);
      
      // API'den veri gelmezse örnek veri kullan
      if (!projectResponse.data) {
        setProject({
          id: projectId,
          title: 'Yapay Zeka ile Doğal Dil İşleme',
          description: 'Türkçe metinler için doğal dil işleme ve konu sınıflandırması yapan bir NLP projesi.',
          academic: 'Prof. Dr. Ayşe Yılmaz',
        });
      } else {
        setProject(projectResponse.data);
      }
      
      if (!applicationsResponse.data || applicationsResponse.data.length === 0) {
        const dummyApplications = [
          {
            id: 1,
            user: {
              id: 1,
              name: 'Mehmet Kaya',
              university: 'Fırat Üniversitesi',
              department: 'Bilgisayar Mühendisliği',
              year: 3,
              avatar: null,
            },
            message: 'Bu projede yer almak istiyorum. NLP konusunda deneyimim var ve bu alanda kendimi geliştirmek istiyorum.',
            status: 'pending',
            createdAt: '2024-04-15',
            skills: ['Python', 'NLP', 'Machine Learning'],
          },
          {
            id: 2,
            user: {
              id: 2,
              name: 'Zeynep Demir',
              university: 'Fırat Üniversitesi',
              department: 'Yazılım Mühendisliği',
              year: 4,
              avatar: null,
            },
            message: 'Daha önce benzer bir projede çalıştım ve bu projede de yer almak istiyorum.',
            status: 'accepted',
            createdAt: '2024-04-10',
            skills: ['Python', 'Deep Learning', 'TensorFlow'],
          },
          {
            id: 3,
            user: {
              id: 3,
              name: 'Can Yılmaz',
              university: 'Fırat Üniversitesi',
              department: 'Bilgisayar Mühendisliği',
              year: 2,
              avatar: null,
            },
            message: 'Bu projede yer alarak NLP alanında kendimi geliştirmek istiyorum.',
            status: 'rejected',
            createdAt: '2024-04-05',
            skills: ['Python', 'Java', 'Web Development'],
          },
        ];
        setApplications(dummyApplications);
      } else {
        setApplications(applicationsResponse.data);
      }
    } catch (error) {
      console.error('Başvurular alınırken hata oluştu:', error);
      Alert.alert('Hata', 'Başvurular alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      // API'ye durum değişikliği gönder
      // await apiService.applications.updateStatus(applicationId, newStatus);
      
      // Başarılı olursa yerel state'i güncelle
      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      
      Alert.alert('Başarılı', `Başvuru durumu ${newStatus === 'accepted' ? 'kabul edildi' : 'reddedildi'}.`);
    } catch (error) {
      console.error('Başvuru durumu güncellenirken hata oluştu:', error);
      Alert.alert('Hata', 'Başvuru durumu güncellenirken bir hata oluştu.');
    }
  };

  const handleUserPress = (user) => {
    // Kullanıcı profil sayfasına yönlendir
    Alert.alert('Bilgi', 'Kullanıcı profil sayfası yakında eklenecek.');
  };

  const handleProjectPress = (projectId) => {
    navigation.navigate('Projects', {
      screen: 'ProjectDetail',
      params: { id: projectId }
    });
  };

  const renderApplicationItem = ({ item }) => (
    <View style={styles.applicationCard}>
      <View style={styles.applicationHeader}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => handleUserPress(item.user)}
        >
          <View style={styles.avatarContainer}>
            {item.user.avatar ? (
              <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.user?.name ? item.user.name.charAt(0) : '?'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.user.name}</Text>
            <Text style={styles.userUniversity}>
              {item.user.university} • {item.user.department}
            </Text>
            <Text style={styles.userYear}>{item.user.year}. Sınıf</Text>
          </View>
        </TouchableOpacity>
        
        <View
          style={[
            styles.statusBadge,
            item.status === 'pending'
              ? styles.pendingBadge
              : item.status === 'accepted'
              ? styles.acceptedBadge
              : styles.rejectedBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {item.status === 'pending'
              ? 'Beklemede'
              : item.status === 'accepted'
              ? 'Kabul Edildi'
              : 'Reddedildi'}
          </Text>
        </View>
      </View>
      
      <View style={styles.messageContainer}>
        <Text style={styles.messageLabel}>Başvuru Mesajı:</Text>
        <Text style={styles.messageText}>{item.message}</Text>
      </View>
      
      <View style={styles.skillsContainer}>
        <Text style={styles.skillsLabel}>Yetenekler:</Text>
        <View style={styles.skillsList}>
          {item.skills.map((skill, index) => (
            <View key={index} style={styles.skillItem}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.applicationFooter}>
        <Text style={styles.applicationDate}>
          Başvuru Tarihi: {item.createdAt}
        </Text>
        
        {item.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleStatusChange(item.id, 'rejected')}
            >
              <Text style={styles.rejectButtonText}>Reddet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleStatusChange(item.id, 'accepted')}
            >
              <Text style={styles.acceptButtonText}>Kabul Et</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
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
        <Text style={styles.headerTitle}>Başvurular</Text>
      </View>
      
      {project && (
        <TouchableOpacity 
          style={styles.projectInfo}
          onPress={() => handleProjectPress(project.id)}
        >
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.projectAcademic}>{project.academic}</Text>
        </TouchableOpacity>
      )}
      
      <FlatList
        data={applications}
        renderItem={renderApplicationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Henüz başvuru bulunmuyor.</Text>
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
  projectInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  projectAcademic: {
    color: '#666',
  },
  listContainer: {
    padding: 15,
  },
  applicationCard: {
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
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userUniversity: {
    color: '#666',
    fontSize: 12,
    marginBottom: 2,
  },
  userYear: {
    color: '#666',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  acceptedBadge: {
    backgroundColor: '#d1fae5',
  },
  rejectedBadge: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageContainer: {
    marginBottom: 15,
  },
  messageLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageText: {
    color: '#444',
    lineHeight: 20,
  },
  skillsContainer: {
    marginBottom: 15,
  },
  skillsLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    backgroundColor: '#e0f2fe',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  skillText: {
    color: '#3b82f6',
    fontSize: 12,
  },
  applicationFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  applicationDate: {
    color: '#666',
    fontSize: 12,
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  rejectButton: {
    backgroundColor: '#fee2e2',
  },
  acceptButton: {
    backgroundColor: '#3b82f6',
  },
  rejectButtonText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  acceptButtonText: {
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
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
});

export default ApplicationsScreen;
