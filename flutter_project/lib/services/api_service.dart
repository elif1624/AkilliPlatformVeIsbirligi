import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:8080/api';

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final url = Uri.parse('$baseUrl/auth/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['message'] ?? 'Giriş başarısız');
    }
  }

  static Future<int> getStudentCount(String token) async {
    final url = Uri.parse('$baseUrl/users?role=student');
    final response = await http.get(url, headers: {'Authorization': 'Bearer $token'});
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data is List ? data.length : 0;
    } else {
      throw Exception('Öğrenci sayısı alınamadı');
    }
  }

  static Future<int> getTeacherCount(String token) async {
    final url = Uri.parse('$baseUrl/users?role=teacher');
    final response = await http.get(url, headers: {'Authorization': 'Bearer $token'});
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data is List ? data.length : 0;
    } else {
      throw Exception('Akademisyen sayısı alınamadı');
    }
  }

  static Future<int> getProjectCount() async {
    final url = Uri.parse('$baseUrl/projects');
    final response = await http.get(url);
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data is List ? data.length : 0;
    } else {
      throw Exception('Proje sayısı alınamadı');
    }
  }

  static Future<List<dynamic>> getMyProjects(String token) async {
    final url = Uri.parse('$baseUrl/projects/my');
    final response = await http.get(url, headers: {'Authorization': 'Bearer $token'});
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Projeler alınamadı');
    }
  }

  static Future<Map<String, dynamic>> updateProject(String token, String projectId, Map<String, dynamic> data) async {
    final url = Uri.parse('$baseUrl/projects/$projectId');
    final response = await http.put(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['message'] ?? 'Proje güncellenemedi');
    }
  }

  static Future<void> deleteProject(String token, String projectId) async {
    final url = Uri.parse('$baseUrl/projects/$projectId');
    final response = await http.delete(
      url,
      headers: {
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode != 200) {
      throw Exception(jsonDecode(response.body)['message'] ?? 'Proje silinemedi');
    }
  }

  static Future<Map<String, dynamic>> addProject(String token, Map<String, dynamic> data) async {
    final url = Uri.parse('$baseUrl/projects');
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    );
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['message'] ?? 'Proje eklenemedi');
    }
  }

  static Future<List<dynamic>> getApplicationsByProject(String token, String projectId) async {
    final url = Uri.parse('$baseUrl/applications/project/$projectId');
    final response = await http.get(url, headers: {
      'Authorization': 'Bearer $token',
    });
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Başvuranlar alınamadı');
    }
  }

  static Future<Map<String, dynamic>> updateApplication(String token, String applicationId, Map<String, dynamic> data) async {
    final url = Uri.parse('$baseUrl/applications/$applicationId');
    final response = await http.put(
      url,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['message'] ?? 'Başvuru güncellenemedi');
    }
  }
} 