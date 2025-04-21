import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Lütfen e-posta ve şifre alanlarını doldurun.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      // Başarılı giriş durumunda navigasyon AppNavigator tarafından otomatik olarak yönlendirilecek
    } catch (error) {
      setError('Giriş yapılırken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Google ile giriş işlemleri
    console.log('Google ile giriş yapılıyor...');
  };

  const handleUniversityLogin = () => {
    // Üniversite e-postası ile giriş işlemleri
    console.log('Üniversite e-postası ile giriş yapılıyor...');
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
          <Text style={styles.sectionTitle}>Giriş Yap</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-posta / Kullanıcı Adı</Text>
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
            <TouchableOpacity onPress={() => console.log('Şifremi unuttum')}>
              <Text style={styles.forgotPassword}>Şifremi Unuttum?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleLogin}
          >
            <Text style={styles.socialButtonText}>Google ile Giriş Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleUniversityLogin}
          >
            <Text style={styles.socialButtonText}>Üniversite E-postası ile Giriş Yap</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Hesabınız yok mu? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Kayıt Ol</Text>
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
  forgotPassword: {
    color: '#3b82f6',
    textAlign: 'right',
    marginTop: 5,
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
  },
  socialButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  socialButtonText: {
    color: '#333',
    fontSize: 14,
    marginLeft: 10,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
