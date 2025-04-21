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
      // API'den proje detaylarını getir
      const response = await apiService.projects.getById(id);
      
      // API'den veri gelmezse örnek veri kullan
      if (!response.data) {
        // Örnek proje verisi
        const dummyProject = {
          id: id,
          title: 'Yapay Zeka ile Doğal Dil İşleme',
          description: 'Türkçe metinler için doğal dil işleme ve konu sınıflandırması yapan bir NLP projesi. REST tabanlı modeller geliştireceğiz.',
          requirements: 'Python, NLP ve derin öğrenme konularında temel bilgi sahibi olunması gerekmektedir.',
          academic: 'Prof. Dr. Ayşe Yılmaz',
          academicTitle: 'Yapay Zeka Mühendisliği',
          tags: ['AI', 'NLP', 'Deep Learning'],
          deadline: '2024-09-01',
          startDate: '2024-04-01',
          size: '6 ay',
          location: 'Kampüs',
          status: 'active',
          applications: 12,
          views: 245,
          favorites: 34,
          milestones: [
            {
              title: 'Proje Başvuruları Açıldı',
              date: '2024-02-15',
              completed: true,
            },
            {
              title: 'Veri Seti Hazırlanacak',
              date: '2024-04-15',
              completed: false,
            },
            {
              title: 'Proje Planı Oluşturuldu',
              date: '2024-03-01',
              completed: true,
            },
          ],
          team: [
            {
              id: 1,
              name: 'Mehmet Kaya',
              role: 'ML Engineer',
              avatar: null,
              online: true,
            },
            {
              id: 2,
              name: 'Zeynep Demir',
              role: 'Data Scientist',
              avatar: null,
              online: false,
            },
            {
              id: 3,
              name: 'Can Yılmaz',
              role: 'Backend Developer',
              avatar: null,
              online: true,
            },
          ],
        };
        setProject(dummyProject);
        
        // Kullanıcının bu projeye başvurup başvurmadığını kontrol et (örnek)
        setHasApplied(Math.random() > 0.5);
      } else {
        setProject(response.data);
        
        // Kullanıcının bu projeye başvurup başvurmadığını kontrol et
        // Bu kısım gerçek API'ye göre düzenlenmelidir
        if (user) {
          try {
            // Burada kullanıcının başvurularını getiren bir API endpoint'i olmalı
            // const applicationsResponse = await apiService.applications.getUserApplications(user.id);
            // const hasApplied = applicationsResponse.data.some(app => app.project_id === id);
            // setHasApplied(hasApplied);
            
            // Şimdilik rastgele bir değer atıyoruz
            setHasApplied(Math.random() > 0.5);
          } catch (error) {
            console.error('Başvuru durumu kontrol edilirken hata oluştu:', error);
          }
        }
      }
    } catch (error) {
      console.error('Proje detayları alınırken hata oluştu:', error);
      Alert.alert('Hata', 'Proje detayları alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      Alert.alert(
        'Giriş Yapın',
        'Projeye başvurmak için giriş yapmanız gerekmektedir.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Giriş Yap', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    try {
      setApplying(true);
      
      // API'ye başvuru gönder
      await apiService.projects.apply(id, {
        user_id: user.id,
        message: 'Bu projeye katılmak istiyorum.',
      });
      
      setHasApplied(true);
      Alert.alert('Başarılı', 'Başvurunuz başarıyla gönderildi.');
    } catch (error) {
      console.error('Başvuru yapılırken hata oluştu:', error);
      Alert.alert('Hata', 'Başvuru yapılırken bir hata oluştu.');
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
          <View style={styles.tagsContainer}>
            {project.tags && project.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.academicInfo}>
          <View style={styles.academicAvatar}>
            <Text style={styles.academicAvatarText}>
              {project.academic ? project.academic.charAt(0) : 'A'}
            </Text>
          </View>
          <View style={styles.academicDetails}>
            <Text style={styles.academicName}>{project.academic}</Text>
            <Text style={styles.academicTitle}>{project.academicTitle || 'Akademisyen'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genel</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Başvuru Tarihi</Text>
              <Text style={styles.infoValue}>{project.startDate || '2024-04-01'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Bitiş</Text>
              <Text style={styles.infoValue}>{project.deadline || '2024-09-01'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Süre</Text>
              <Text style={styles.infoValue}>{project.size || '6 ay'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Konum</Text>
              <Text style={styles.infoValue}>{project.location || 'Kampüs'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Açıklama</Text>
          <Text style={styles.description}>{project.description}</Text>
        </View>

        {project.requirements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gereksinimler</Text>
            <Text style={styles.description}>{project.requirements}</Text>
          </View>
        )}

        {project.team && project.team.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ekip Üyeleri</Text>
            {project.team.map((member, index) => (
              <View key={index} style={styles.teamMember}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
                  {member.online && <View style={styles.onlineIndicator} />}
                </View>
                <View style={styles.memberDetails}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {project.milestones && project.milestones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proje Aşamaları</Text>
            {project.milestones.map((milestone, index) => (
              <View key={index} style={styles.milestone}>
                <View style={[styles.milestoneStatus, milestone.completed && styles.milestoneCompleted]} />
                <View style={styles.milestoneDetails}>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  <Text style={styles.milestoneDate}>{milestone.date}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{project.views || 245}</Text>
            <Text style={styles.statLabel}>Görüntülenme</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{project.applications || 12}</Text>
            <Text style={styles.statLabel}>Başvuru</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{project.favorites || 34}</Text>
            <Text style={styles.statLabel}>Favori</Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.messageButton,
              { flex: hasApplied ? 1 : 0.3 },
            ]}
            onPress={() => Alert.alert('Bilgi', 'Mesaj gönderme özelliği yakında eklenecek.')}
          >
            <Text style={styles.messageButtonText}>Mesaj Gönder</Text>
          </TouchableOpacity>

          {!hasApplied && (
            <TouchableOpacity
              style={[styles.applyButton, applying && styles.applyingButton]}
              onPress={handleApply}
              disabled={applying}
            >
              <Text style={styles.applyButtonText}>
                {applying ? 'Başvuruluyor...' : 'Başvur'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  academicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  academicAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  academicAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  academicDetails: {
    flex: 1,
  },
  academicName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  academicTitle: {
    color: '#666',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
  },
  infoValue: {
    fontWeight: 'bold',
  },
  description: {
    lineHeight: 20,
    color: '#444',
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  memberAvatarText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    borderWidth: 1,
    borderColor: '#fff',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  memberRole: {
    color: '#666',
    fontSize: 12,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  milestoneStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  milestoneCompleted: {
    backgroundColor: '#10b981',
  },
  milestoneDetails: {
    flex: 1,
  },
  milestoneTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  milestoneDate: {
    color: '#666',
    fontSize: 12,
  },
  statsSection: {
    flexDirection: 'row',
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
  actionContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  messageButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  messageButtonText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 0.7,
    backgroundColor: '#3b82f6',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  applyingButton: {
    backgroundColor: '#93c5fd',
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
