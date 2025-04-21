import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student', 'academic'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const userData = {
        name,
        role,
        interests: [],
      };
      
      await register(email, password, userData);
      // Başarılı kayıt durumunda navigasyon AppNavigator tarafından otomatik olarak yönlendirilecek
    } catch (error) {
      setError('Kayıt olunurken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>ProjeHub'a Hoş Geldiniz</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Kayıt Ol</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              placeholder="Ad Soyad"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="********"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre Tekrar</Text>
            <TextInput
              style={styles.input}
              placeholder="********"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          <View style={styles.roleContainer}>
            <Text style={styles.label}>Hesap Türü</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'student' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('student')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'student' && styles.roleButtonTextActive,
                  ]}
                >
                  Öğrenci
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'academic' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('academic')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'academic' && styles.roleButtonTextActive,
                  ]}
                >
                  Akademisyen
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3b82f6',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  roleButtonText: {
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
