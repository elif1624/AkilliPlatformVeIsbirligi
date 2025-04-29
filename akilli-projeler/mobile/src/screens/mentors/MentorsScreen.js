import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

const MentorsScreen = ({ navigation }) => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const { data } = await api.mentors.getAll();
      setMentors(data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMentorPress = (mentor) => {
    navigation.navigate('MentorDetail', { id: mentor.id });
  };

  const renderMentorItem = ({ item }) => (
    <TouchableOpacity
      style={styles.mentorCard}
      onPress={() => handleMentorPress(item)}
    >
      <View style={styles.mentorInfo}>
        <Text style={styles.mentorName}>{item.name}</Text>
        <Text style={styles.mentorTitle}>{item.title}</Text>
        <Text style={styles.mentorDepartment}>
          {item.department} • {item.university}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mentorlar</Text>
      </View>
      <FlatList
        data={mentors}
        renderItem={renderMentorItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  mentorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  mentorTitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 2,
  },
  mentorDepartment: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default MentorsScreen;
