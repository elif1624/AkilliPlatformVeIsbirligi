import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      if (user) {
        // API'den kullanıcı profilini getir
        // const response = await apiService.users.getById(user.id);
        // setProfile(response.data);
        
        // Şimdilik örnek veri kullanıyoruz
        setProfile({
          id: 1,
          name: 'Ahmet Yılmaz',
          university: 'Fırat Üniversitesi',
          department: 'Yazılım Mühendisliği',
          year: 3,
          role: 'student',
          bio: 'Yapay zeka ve veri bilimi alanlarında çalışmalar yapıyorum. Özellikle doğal dil işleme ve bilgisayarlı görü konularında deneyim sahibiyim.',
          skills: ['Python', 'Machine Learning', 'Deep Learning', 'Computer Vision', 'NLP'],
          projects: [
            {
              id: 1,
              title: 'Makine Öğrenmesi Projesi',
              academic: 'Prof. Dr. Ayşe Kaya',
              progress: 65,
              deadline: '2024-05-30',
            },
            {
              id: 2,
              title: 'Veri Analizi Araştırması',
              academic: 'Doç. Dr. Mehmet Demir',
              progress: 40,
              deadline: '2024-06-15',
            },
          ],
          applications: [
            {
              id: 1,
              project: {
                id: 3,
                title: 'Derin Öğrenme ile Görüntü Sınıflandırma',
                academic: 'Prof. Dr. Ali Yılmaz',
                status: 'pending',
              },
            },
            {
              id: 2,
              project: {
                id: 4,
                title: 'NLP Tabanlı Duygu Analizi',
                academic: 'Dr. Zeynep Demir',
                status: 'rejected',
              },
            },
          ],
          stats: {
            projects: 45,
            applications: 1200,
            mentors: 18,
          },
          links: [
            { type: 'linkedin', url: 'https://linkedin.com/in/ahmetyilmaz' },
            { type: 'github', url: 'https://github.com/ahmetyilmaz' },
            { type: 'website', url: 'https://ahmetyilmaz.com' },
          ],
        });
      }
    } catch (error) {
      console.error('Profil bilgileri alınırken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Çıkış yapılırken hata oluştu:', error);
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profil bilgileri yüklenemedi.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchProfileData}
        >
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>ProjeHub</Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.name ? profile.name.charAt(0) : '?'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Text style={styles.editAvatarText}>Değiştir</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileUniversity}>
              {profile.university} • {profile.department}
            </Text>
            <Text style={styles.profileYear}>{profile.year}. Sınıf</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.stats.projects}</Text>
            <Text style={styles.statLabel}>Proje</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.stats.applications}</Text>
            <Text style={styles.statLabel}>Başvuru</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.stats.mentors}</Text>
            <Text style={styles.statLabel}>Mentor</Text>
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.activeTab]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
              Hakkımda
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'projects' && styles.activeTab]}
            onPress={() => setActiveTab('projects')}
          >
            <Text style={[styles.tabText, activeTab === 'projects' && styles.activeTabText]}>
              Projelerim
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
            onPress={() => setActiveTab('applications')}
          >
            <Text style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}>
              Başvurularım
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'about' && (
          <View style={styles.aboutContainer}>
            {profile.bio && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hakkımda</Text>
                <Text style={styles.bioText}>{profile.bio}</Text>
              </View>
            )}

            {profile.skills && profile.skills.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Yetenekler</Text>
                <View style={styles.skillsContainer}>
                  {profile.skills.map((skill, index) => (
                    <View key={index} style={styles.skillItem}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {profile.links && profile.links.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bağlantılar</Text>
                <View style={styles.linksContainer}>
                  {profile.links.map((link, index) => (
                    <TouchableOpacity key={index} style={styles.linkItem}>
                      <Ionicons
                        name={
                          link.type === 'linkedin'
                            ? 'logo-linkedin'
                            : link.type === 'github'
                            ? 'logo-github'
                            : 'globe-outline'
                        }
                        size={20}
                        color="#3b82f6"
                      />
                      <Text style={styles.linkText}>{link.url}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'projects' && (
          <View style={styles.projectsContainer}>
            {profile.projects && profile.projects.length > 0 ? (
              profile.projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  style={styles.projectCard}
                  onPress={() => navigation.navigate('ProjectDetail', { id: project.id })}
                >
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <Text style={styles.projectProgress}>{project.progress}%</Text>
                  </View>
                  <Text style={styles.projectAcademic}>{project.academic}</Text>
                  <Text style={styles.projectDeadline}>Son Tarih: {project.deadline}</Text>
                  <View style={styles.progressContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${project.progress}%` },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz bir projeniz bulunmuyor.</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'applications' && (
          <View style={styles.applicationsContainer}>
            {profile.applications && profile.applications.length > 0 ? (
              profile.applications.map((application) => (
                <TouchableOpacity
                  key={application.id}
                  style={styles.applicationCard}
                  onPress={() => navigation.navigate('ProjectDetail', { id: application.project.id })}
                >
                  <View style={styles.applicationHeader}>
                    <Text style={styles.applicationTitle}>{application.project.title}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        application.project.status === 'pending'
                          ? styles.pendingBadge
                          : application.project.status === 'rejected'
                          ? styles.rejectedBadge
                          : styles.acceptedBadge,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {application.project.status === 'pending'
                          ? 'Beklemede'
                          : application.project.status === 'rejected'
                          ? 'Reddedildi'
                          : 'Kabul Edildi'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.applicationAcademic}>{application.project.academic}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Henüz bir başvurunuz bulunmuyor.</Text>
              </View>
            )}
          </View>
        )}
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: '#fff',
  },
  appName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginRight: 15,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  editAvatarText: {
    color: '#666',
    fontSize: 12,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileUniversity: {
    color: '#666',
    marginBottom: 2,
  },
  profileYear: {
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    color: '#666',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  aboutContainer: {
    padding: 15,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bioText: {
    lineHeight: 20,
    color: '#444',
  },
  skillsContainer: {
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
  linksContainer: {
    marginTop: 5,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  linkText: {
    marginLeft: 10,
    color: '#3b82f6',
  },
  projectsContainer: {
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
    marginBottom: 5,
  },
  projectDeadline: {
    color: '#666',
    marginBottom: 10,
    fontSize: 12,
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  applicationsContainer: {
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
    alignItems: 'center',
    marginBottom: 5,
  },
  applicationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
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
  applicationAcademic: {
    color: '#666',
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
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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

export default ProfileScreen;
