import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Önerilen projeleri getir
      const projectsResponse = await apiService.projects.getAll();
      setProjects(projectsResponse.data.slice(0, 5)); // İlk 5 projeyi göster
      
      // Kullanıcının başvurularını getir
      if (user) {
        // Burada kullanıcının başvurularını getiren bir API endpoint'i olmalı
        // Şimdilik örnek veri kullanıyoruz
        setApplications([
          {
            id: 1,
            project: {
              id: 1,
              title: 'E-Ticaret Platformu Geliştirme',
              academic: 'Dr. Ayşe Yılmaz',
              progress: 45,
            },
          },
          {
            id: 2,
            project: {
              id: 2,
              title: 'Yapay Zeka Destekli Mobil Uygulama',
              academic: 'Prof. Dr. Mehmet Kaya',
              progress: 62,
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Veri alınırken hata oluştu:', error);
      
      // Daha detaylı hata mesajı
      let errorMessage = 'Veri alınırken hata oluştu';
      
      if (error.response) {
        // Sunucu cevap döndü ama hata kodu ile
        errorMessage += `: ${error.response.status} ${error.response.statusText}`;
        console.error('Sunucu cevabı:', error.response.data);
      } else if (error.request) {
        // İstek yapıldı ama cevap alınamadı
        errorMessage += ': Sunucudan cevap alınamadı';
        console.error('İstek:', error.request);
      } else {
        // İstek oluşturulurken bir hata oluştu
        errorMessage += `: ${error.message}`;
      }
      
      // Örnek veri kullanarak UI'ın çalışmasını sağla
      setProjects([
        {
          id: 1,
          title: 'E-Ticaret Platformu Geliştirme (Örnek)',
          description: 'Bu bir örnek projedir. Gerçek veriler yüklenemedi.',
          user: { name: 'Dr. Ayşe Yılmaz' },
          tags: ['Web', 'E-Ticaret']
        },
        {
          id: 2,
          title: 'Yapay Zeka Destekli Mobil Uygulama (Örnek)',
          description: 'Bu bir örnek projedir. Gerçek veriler yüklenemedi.',
          user: { name: 'Prof. Dr. Mehmet Kaya' },
          tags: ['Mobil', 'Yapay Zeka']
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.greeting}>
            Hoş Geldin, {user?.name || 'Ahmet'}!
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Aktif Başvurular */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktif Başvurular</Text>
            <Text style={styles.sectionCount}>{applications.length}</Text>
          </View>

          {applications.length > 0 ? (
            applications.map((application) => (
              <TouchableOpacity
                key={application.id}
                style={styles.card}
                onPress={() => navigation.navigate('ProjectDetail', { id: application.project.id })}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{application.project.title}</Text>
                  <Text style={styles.cardBadge}>{application.project.progress}%</Text>
                </View>
                <Text style={styles.cardSubtitle}>{application.project.academic}</Text>
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${application.project.progress}%` },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz aktif başvurunuz bulunmuyor.</Text>
            </View>
          )}
        </View>

        {/* Önerilen Projeler */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Önerilen Projeler</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
              <Text style={styles.seeAllText}>Tümü</Text>
            </TouchableOpacity>
          </View>

          {projects.length > 0 ? (
            projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={styles.card}
                onPress={() => navigation.navigate('ProjectDetail', { id: project.id })}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{project.title}</Text>
                  <View style={styles.tagContainer}>
                    {project.tags && project.tags.map((tag, index) => (
                      <Text key={index} style={styles.tag}>{tag}</Text>
                    ))}
                  </View>
                </View>
                <Text style={styles.cardSubtitle}>
                  {project.user?.name || 'Dr. Ayşe Yılmaz'}
                </Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {project.description || 'Mobil uygulamalarda kullanıcı arayüzü tasarımı için yapay zeka tabanlı çözümler geliştirme projesi.'}
                </Text>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => navigation.navigate('ProjectDetail', { id: project.id })}
                >
                  <Text style={styles.applyButtonText}>Başvur</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Şu anda önerilen proje bulunmuyor.</Text>
            </View>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    tintColor: '#fff',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionCount: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  seeAllText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  cardBadge: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
  },
  cardSubtitle: {
    color: '#666',
    marginBottom: 10,
  },
  cardDescription: {
    color: '#444',
    marginBottom: 10,
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
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e0f2fe',
    color: '#3b82f6',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 5,
    marginBottom: 5,
  },
  applyButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: {
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

export default HomeScreen;
