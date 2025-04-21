import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Ekranları içe aktar (henüz oluşturmadık)
// Auth Ekranları
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Ana Ekranlar
import HomeScreen from '../screens/home/HomeScreen';
import ProjectsScreen from '../screens/projects/ProjectsScreen';
import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen';
import MentorsScreen from '../screens/mentors/MentorsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ApplicationsScreen from '../screens/applications/ApplicationsScreen';

// Stack ve Tab Navigator'ları oluştur
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Projeler Stack Navigator
const ProjectsNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="ProjectsList" component={ProjectsScreen} options={{ title: 'Projeler' }} />
    <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Proje Detayı' }} />
    <Stack.Screen name="Applications" component={ApplicationsScreen} options={{ title: 'Başvurular' }} />
  </Stack.Navigator>
);

// Ana Tab Navigator
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Projects') {
          iconName = focused ? 'list' : 'list-outline';
        } else if (route.name === 'Mentors') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#3b82f6',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Ana Sayfa' }} />
    <Tab.Screen name="Projects" component={ProjectsNavigator} options={{ title: 'Projeler' }} />
    <Tab.Screen name="Mentors" component={MentorsScreen} options={{ title: 'Mentorlar' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
  </Tab.Navigator>
);

// Ana Navigator
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // Burada bir loading ekranı gösterilebilir
    return null;
  }

  return (
    <NavigationContainer>
      {user ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
