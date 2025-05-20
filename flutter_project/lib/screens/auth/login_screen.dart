import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/app_theme.dart';
import '../../services/api_service.dart';
import '../../widgets/stat_box.dart';
import 'dart:convert';
import 'package:flutter/services.dart';
import '../../widgets/project_detail_modal.dart';
import 'project_edit_screen.dart';
import 'dart:math';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;
  String? _error;
  int? _studentCount;
  int? _teacherCount;
  int? _projectCount;
  bool _statsLoading = true;
  String? _statsError;

  @override
  void initState() {
    super.initState();
    _fetchStats();
  }

  Future<void> _fetchStats() async {
    setState(() { _statsLoading = true; _statsError = null; });
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      if (token == null || token.isEmpty) {
        setState(() { _statsLoading = false; });
        return;
      }
      final studentCount = await ApiService.getStudentCount(token);
      final teacherCount = await ApiService.getTeacherCount(token);
      final projectCount = await ApiService.getProjectCount();
      setState(() {
        _studentCount = studentCount;
        _teacherCount = teacherCount;
        _projectCount = projectCount;
      });
    } catch (e) {
      setState(() { _statsError = e.toString(); });
    } finally {
      setState(() { _statsLoading = false; });
    }
  }

  Future<void> _login() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await ApiService.login(
        _emailController.text.trim(),
        _passwordController.text,
      );
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', result['token']);
      await prefs.setString('user', result['user'].toString());
      final role = result['user']['role'];
      if (role == 'student') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const StudentDashboard()),
        );
      } else if (role == 'teacher') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const TeacherDashboard()),
        );
      }
    } catch (e) {
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 36),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Image.asset('assets/mindmesh_logo.png', width: 90, height: 90),
              const SizedBox(height: 18),
              Text(
                "MindMesh'e Hoş Geldiniz",
                style: TextStyle(
                  color: AppTheme.primary,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Akademik projeler ve işbirliği fırsatları için akıllı eşleştirme platformu',
                style: TextStyle(color: AppTheme.textSecondary, fontSize: 15),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Giriş Yap',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 18),
                    TextField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: 'E-posta',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _passwordController,
                      obscureText: true,
                      decoration: const InputDecoration(
                        labelText: 'Şifre',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    if (_error != null)
                      Text(
                        _error!,
                        style: const TextStyle(color: Colors.red),
                        textAlign: TextAlign.center,
                      ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      onPressed: _loading ? null : _login,
                      child: _loading
                          ? const CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            )
                          : const Text('Giriş Yap', style: TextStyle(fontSize: 16)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class StudentDashboard extends StatelessWidget {
  const StudentDashboard({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Student Dashboard')),
      body: const Center(child: Text('Hoşgeldin, Öğrenci!')),
    );
  }
}

class TeacherDashboard extends StatefulWidget {
  const TeacherDashboard({super.key});

  @override
  State<TeacherDashboard> createState() => _TeacherDashboardState();
}

class _TeacherDashboardState extends State<TeacherDashboard> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int? _studentCount;
  int? _projectCount;
  bool _statsLoading = true;
  String? _statsError;
  List<dynamic> _projects = [];
  bool _projectsLoading = true;
  String? _projectsError;
  Map<String, dynamic>? _selectedProject;
  bool _detailModalOpen = false;
  Map<String, dynamic>? _editingProject;
  bool _editModalOpen = false;
  Map<String, List<dynamic>> _applicationsByProject = {};
  String? _openApplicationsProjectId;
  bool _applicationsLoading = false;
  String? _applicationsError;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this, initialIndex: 0);
    _fetchStats();
    _fetchProjects();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchStats() async {
    setState(() { _statsLoading = true; _statsError = null; });
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final studentCount = await ApiService.getStudentCount(token ?? '');
      final projectCount = await ApiService.getProjectCount();
      setState(() {
        _studentCount = studentCount;
        _projectCount = projectCount;
      });
    } catch (e) {
      setState(() { _statsError = e.toString(); });
    } finally {
      setState(() { _statsLoading = false; });
    }
  }

  Future<void> _fetchProjects() async {
    setState(() { _projectsLoading = true; _projectsError = null; });
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final res = await ApiService.getMyProjects(token ?? '');
      setState(() { _projects = res; });
    } catch (e) {
      setState(() { _projectsError = e.toString(); });
    } finally {
      setState(() { _projectsLoading = false; });
    }
  }

  void _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => const LoginScreen()),
      (route) => false,
    );
  }

  void _openProjectDetail(Map<String, dynamic> project) {
    setState(() {
      _selectedProject = project;
      _detailModalOpen = true;
    });
  }

  void _closeProjectDetail() {
    setState(() {
      _detailModalOpen = false;
      _selectedProject = null;
    });
  }

  void _openEditProject(Map<String, dynamic> project) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ProjectEditScreen(
          project: project,
          onSave: (data) async {
            final prefs = await SharedPreferences.getInstance();
            final token = prefs.getString('token');
            await ApiService.updateProject(token ?? '', project['_id'], data);
            await _fetchProjects();
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Proje başarıyla güncellendi.')),
            );
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // --- Anasayfa için veriler ---
    // 1. Onaylanan öğrenciler (tüm projelerin başvurularından status == 'accepted')
    List<dynamic> acceptedStudents = [];
    for (var proj in _projects) {
      if (_applicationsByProject[proj['_id']] != null) {
        acceptedStudents.addAll(_applicationsByProject[proj['_id']]!.where((app) => app['status'] == 'accepted'));
      }
    }
    // 2. Aktif projeler
    List<dynamic> activeProjects = _projects.where((p) => p['status'] == 'active').toList();
    // 3. Bitiş tarihi geçmiş projeler
    List<dynamic> completedProjects = _projects.where((p) {
      if (p['end_date'] == null) return false;
      try {
        return DateTime.parse(p['end_date']).isBefore(DateTime.now());
      } catch (_) {
        return false;
      }
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Image.asset('assets/mindmesh_logo.png', width: 36, height: 36),
            const SizedBox(width: 10),
            const Text('MindMesh', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 22)),
          ],
        ),
        backgroundColor: AppTheme.primary,
        iconTheme: const IconThemeData(color: Colors.white),
        bottom: TabBar(
          controller: _tabController,
          indicator: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          labelColor: AppTheme.primary,
          unselectedLabelColor: Colors.white,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 18),
          tabs: const [
            Tab(text: 'Anasayfa'),
            Tab(text: 'Projelerim'),
            Tab(text: 'Profilim'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications, color: Colors.white),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Bildirimler yakında!')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: _logout,
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                StatBox(
                  label: 'Toplam Öğrenci',
                  value: acceptedStudents.length,
                  color: Colors.deepPurple,
                  textColor: Colors.white,
                  width: double.infinity,
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(
                      builder: (_) => AcceptedStudentsPage(acceptedStudents: acceptedStudents),
                    ));
                  },
                ),
                const SizedBox(height: 12),
                StatBox(
                  label: 'Aktif Projeler',
                  value: activeProjects.length,
                  color: Colors.blue,
                  textColor: Colors.white,
                  width: double.infinity,
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(
                      builder: (_) => ActiveProjectsPage(activeProjects: activeProjects),
                    ));
                  },
                ),
                const SizedBox(height: 12),
                StatBox(
                  label: 'Başvurusu Tamamlanan Projeler',
                  value: completedProjects.length,
                  color: AppTheme.primary,
                  textColor: Colors.white,
                  width: double.infinity,
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(
                      builder: (_) => CompletedProjectsPage(completedProjects: completedProjects),
                    ));
                  },
                ),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('En Son Ziyaret Edilen Projeler', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                      const SizedBox(height: 8),
                      const Text('Milli Biyometrik Kimlik Doğrulama ve Kriptolojik Güvence Sistemi (MB-KG) (Fatih ÖZKAYNAK)', style: TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Son Eklenen Projeler', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                      const SizedBox(height: 8),
                      ...(_projects.reversed.take(2).map((proj) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Text(
                          '${proj['title'] ?? '-'} (${proj['owner']?['name'] ?? ''} ${proj['owner']?['surname'] ?? ''})',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ))),
                    ],
                  ),
                ),
              ],
            ),
          ),
          SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Öğrenci Ara kutusu
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Öğrenci Ara', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue, fontSize: 16)),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                decoration: InputDecoration(
                                  hintText: 'Ad, soyad veya e-posta',
                                  border: OutlineInputBorder(),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton(
                              onPressed: () {},
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                              child: const Text('Ara'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        const Text('Arama yapmak için bir şey yazın', style: TextStyle(color: Colors.grey, fontSize: 13)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Proje Ara kutusu
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Proje Ara', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue, fontSize: 16)),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                decoration: InputDecoration(
                                  hintText: 'Proje veya öğretmen adı',
                                  border: OutlineInputBorder(),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            ElevatedButton(
                              onPressed: () {},
                              style: ElevatedButton.styleFrom(backgroundColor: Colors.blue),
                              child: const Text('Ara'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        const Text('Arama yapmak için bir şey yazın', style: TextStyle(color: Colors.grey, fontSize: 13)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  Text('Projelerim', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primary)),
                  const SizedBox(height: 10),
                  if (_projectsLoading)
                    const Center(child: CircularProgressIndicator())
                  else if (_projectsError != null)
                    Text(_projectsError!, style: const TextStyle(color: Colors.red))
                  else if (_projects.isEmpty)
                    const Text('Henüz projeniz yok.')
                  else
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _projects.length,
                      itemBuilder: (context, index) {
                        final p = _projects[index];
                        return Card(
                          color: Colors.white,
                          margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '${p['title'] ?? '-'}',
                                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16, color: Colors.black87),
                                        overflow: TextOverflow.ellipsis,
                                        maxLines: 2,
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        children: [
                                          Text('Kontejan: ', style: TextStyle(fontWeight: FontWeight.w600, color: AppTheme.primary)),
                                          Text('${p['quota'] ?? p['max_students'] ?? '-'}'),
                                          const SizedBox(width: 18),
                                          Text('Süre: ', style: TextStyle(fontWeight: FontWeight.w600, color: AppTheme.primary)),
                                          Text('${p['duration'] ?? p['estimated_months'] ?? '-'}'),
                                          const SizedBox(width: 18),
                                          Text('Durum: ', style: TextStyle(fontWeight: FontWeight.w600, color: AppTheme.primary)),
                                          Text(
                                            (p['status'] == 'active') ? 'Başvuru Açık' : 'Başvuru Kapalı',
                                            style: TextStyle(
                                              color: (p['status'] == 'active') ? Colors.green : Colors.red,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Row(
                                  children: [
                                    TextButton(
                                      onPressed: () => _openProjectDetail(p),
                                      style: TextButton.styleFrom(backgroundColor: AppTheme.secondary.withOpacity(0.15)),
                                      child: const Text('Detay', style: TextStyle(color: Colors.indigo)),
                                    ),
                                    const SizedBox(width: 4),
                                    TextButton(
                                      onPressed: () => _openEditProject(p),
                                      style: TextButton.styleFrom(backgroundColor: AppTheme.primary.withOpacity(0.15)),
                                      child: const Text('Düzenle', style: TextStyle(color: Colors.blue)),
                                    ),
                                    const SizedBox(width: 4),
                                    TextButton(
                                      onPressed: () async {
                                        final confirm = await showDialog<bool>(
                                          context: context,
                                          builder: (context) => AlertDialog(
                                            title: const Text('Proje Sil'),
                                            content: const Text('Bu projeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'),
                                            actions: [
                                              TextButton(
                                                onPressed: () => Navigator.of(context).pop(false),
                                                child: const Text('Vazgeç'),
                                              ),
                                              ElevatedButton(
                                                onPressed: () => Navigator.of(context).pop(true),
                                                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.danger),
                                                child: const Text('Evet, Sil', style: TextStyle(color: Colors.white)),
                                              ),
                                            ],
                                          ),
                                        );
                                        if (confirm == true) {
                                          final prefs = await SharedPreferences.getInstance();
                                          final token = prefs.getString('token');
                                          try {
                                            await ApiService.deleteProject(token ?? '', p['_id']);
                                            await _fetchProjects();
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              const SnackBar(content: Text('Proje başarıyla silindi.')),
                                            );
                                          } catch (e) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(content: Text('Proje silinirken hata oluştu: ${e.toString()}')),
                                            );
                                          }
                                        }
                                      },
                                      style: TextButton.styleFrom(backgroundColor: AppTheme.danger.withOpacity(0.15)),
                                      child: const Text('Sil', style: TextStyle(color: Colors.red)),
                                    ),
                                    const SizedBox(width: 4),
                                    TextButton(
                                      onPressed: () async {
                                        if (_openApplicationsProjectId == p['_id']) {
                                          setState(() {
                                            _openApplicationsProjectId = null;
                                            _applicationsError = null;
                                          });
                                          return;
                                        }
                                        setState(() {
                                          _applicationsLoading = true;
                                          _applicationsError = null;
                                          _openApplicationsProjectId = p['_id'];
                                        });
                                        final prefs = await SharedPreferences.getInstance();
                                        final token = prefs.getString('token');
                                        try {
                                          final apps = await ApiService.getApplicationsByProject(token ?? '', p['_id']);
                                          setState(() {
                                            _applicationsByProject[p['_id']] = apps;
                                            _applicationsLoading = false;
                                          });
                                        } catch (e) {
                                          setState(() {
                                            _applicationsError = e.toString();
                                            _applicationsLoading = false;
                                          });
                                        }
                                      },
                                      style: TextButton.styleFrom(
                                        backgroundColor: AppTheme.success.withOpacity(0.15),
                                        minimumSize: const Size(110, 40),
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
                                      ),
                                      child: Text(
                                        _openApplicationsProjectId == p['_id'] ? 'Gizle' : 'Başvuranlar',
                                        style: const TextStyle(color: Colors.teal, fontSize: 14),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                                if (_openApplicationsProjectId == p['_id']) ...[
                                  const SizedBox(height: 8),
                                  _applicationsLoading
                                      ? const Center(child: CircularProgressIndicator())
                                      : _applicationsError != null
                                          ? Text(_applicationsError!, style: const TextStyle(color: Colors.red))
                                          : (_applicationsByProject[p['_id']] == null || _applicationsByProject[p['_id']]!.isEmpty)
                                              ? const Text('Bu projeye henüz başvuru yok.')
                                              : Column(
                                                  children: _applicationsByProject[p['_id']]!.map<Widget>((app) {
                                                    final statusMap = {
                                                      'pending': {'text': 'Bekleniyor', 'color': const Color(0xFFF7B500)},
                                                      'accepted': {'text': 'Onaylandı', 'color': const Color(0xFF27AE60)},
                                                      'rejected': {'text': 'Reddedildi', 'color': const Color(0xFFE74C3C)},
                                                    };
                                                    final isMentor = app['is_mentor'] == true;
                                                    return Card(
                                                      margin: const EdgeInsets.symmetric(vertical: 4),
                                                      child: Padding(
                                                        padding: const EdgeInsets.all(8.0),
                                                        child: Column(
                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                          children: [
                                                            ListTile(
                                                              contentPadding: EdgeInsets.zero,
                                                              title: Text('${app['student_id']['name']} ${app['student_id']['surname']}'),
                                                              subtitle: Text(app['student_id']['email'] ?? ''),
                                                            ),
                                                            Text(
                                                              statusMap[app['status']]?['text'] as String? ?? '-',
                                                              style: TextStyle(
                                                                color: statusMap[app['status']]?['color'] as Color? ?? Colors.grey,
                                                                fontWeight: FontWeight.bold,
                                                              ),
                                                            ),
                                                            const SizedBox(height: 4),
                                                            Wrap(
                                                              spacing: 4,
                                                              runSpacing: 4,
                                                              children: [
                                                                if (app['status'] == 'pending') ...[
                                                                  ElevatedButton(
                                                                    onPressed: () async {
                                                                      final prefs = await SharedPreferences.getInstance();
                                                                      final token = prefs.getString('token');
                                                                      await ApiService.updateApplication(token ?? '', app['_id'], {'status': 'rejected'});
                                                                      final apps = await ApiService.getApplicationsByProject(token ?? '', p['_id']);
                                                                      setState(() => _applicationsByProject[p['_id']] = apps);
                                                                    },
                                                                    style: ElevatedButton.styleFrom(
                                                                      backgroundColor: const Color(0xFFE74C3C),
                                                                      minimumSize: const Size(0, 32),
                                                                      padding: const EdgeInsets.symmetric(horizontal: 10),
                                                                      textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                                                    ),
                                                                    child: const Text('Reddet', style: TextStyle(color: Colors.white)),
                                                                  ),
                                                                  ElevatedButton(
                                                                    onPressed: () async {
                                                                      final prefs = await SharedPreferences.getInstance();
                                                                      final token = prefs.getString('token');
                                                                      await ApiService.updateApplication(token ?? '', app['_id'], {'status': 'accepted'});
                                                                      final apps = await ApiService.getApplicationsByProject(token ?? '', p['_id']);
                                                                      setState(() => _applicationsByProject[p['_id']] = apps);
                                                                    },
                                                                    style: ElevatedButton.styleFrom(
                                                                      backgroundColor: const Color(0xFF27AE60),
                                                                      minimumSize: const Size(0, 32),
                                                                      padding: const EdgeInsets.symmetric(horizontal: 10),
                                                                      textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                                                    ),
                                                                    child: const Text('Onayla', style: TextStyle(color: Colors.white)),
                                                                  ),
                                                                ] else if (app['status'] == 'rejected') ...[
                                                                  ElevatedButton(
                                                                    onPressed: () async {
                                                                      final prefs = await SharedPreferences.getInstance();
                                                                      final token = prefs.getString('token');
                                                                      await ApiService.updateApplication(token ?? '', app['_id'], {'status': 'accepted'});
                                                                      final apps = await ApiService.getApplicationsByProject(token ?? '', p['_id']);
                                                                      setState(() => _applicationsByProject[p['_id']] = apps);
                                                                    },
                                                                    style: ElevatedButton.styleFrom(
                                                                      backgroundColor: const Color(0xFF27AE60),
                                                                      minimumSize: const Size(0, 32),
                                                                      padding: const EdgeInsets.symmetric(horizontal: 10),
                                                                      textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                                                    ),
                                                                    child: const Text('Onayla', style: TextStyle(color: Colors.white)),
                                                                  ),
                                                                ] else if (app['status'] == 'accepted' && !isMentor) ...[
                                                                  ElevatedButton(
                                                                    onPressed: () async {
                                                                      final prefs = await SharedPreferences.getInstance();
                                                                      final token = prefs.getString('token');
                                                                      await ApiService.updateApplication(token ?? '', app['_id'], {'status': 'rejected'});
                                                                      final apps = await ApiService.getApplicationsByProject(token ?? '', p['_id']);
                                                                      setState(() => _applicationsByProject[p['_id']] = apps);
                                                                    },
                                                                    style: ElevatedButton.styleFrom(
                                                                      backgroundColor: const Color(0xFFE74C3C),
                                                                      minimumSize: const Size(0, 32),
                                                                      padding: const EdgeInsets.symmetric(horizontal: 10),
                                                                      textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                                                    ),
                                                                    child: const Text('Reddet', style: TextStyle(color: Colors.white)),
                                                                  ),
                                                                  ElevatedButton(
                                                                    onPressed: () async {
                                                                      final prefs = await SharedPreferences.getInstance();
                                                                      final token = prefs.getString('token');
                                                                      await ApiService.updateApplication(token ?? '', app['_id'], {'is_mentor': true});
                                                                      final apps = await ApiService.getApplicationsByProject(token ?? '', p['_id']);
                                                                      setState(() => _applicationsByProject[p['_id']] = apps);
                                                                    },
                                                                    style: ElevatedButton.styleFrom(
                                                                      backgroundColor: Colors.blue,
                                                                      minimumSize: const Size(0, 32),
                                                                      padding: const EdgeInsets.symmetric(horizontal: 10),
                                                                      textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                                                    ),
                                                                    child: const Text('Mentor Seç', style: TextStyle(color: Colors.white)),
                                                                  ),
                                                                ] else if (app['status'] == 'accepted' && isMentor) ...[
                                                                  ElevatedButton(
                                                                    onPressed: () async {
                                                                      final prefs = await SharedPreferences.getInstance();
                                                                      final token = prefs.getString('token');
                                                                      await ApiService.updateApplication(token ?? '', app['_id'], {'status': 'rejected'});
                                                                      final apps = await ApiService.getApplicationsByProject(token ?? '', p['_id']);
                                                                      setState(() => _applicationsByProject[p['_id']] = apps);
                                                                    },
                                                                    style: ElevatedButton.styleFrom(
                                                                      backgroundColor: const Color(0xFFE74C3C),
                                                                      minimumSize: const Size(0, 32),
                                                                      padding: const EdgeInsets.symmetric(horizontal: 10),
                                                                      textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                                                    ),
                                                                    child: const Text('Reddet', style: TextStyle(color: Colors.white)),
                                                                  ),
                                                                  ElevatedButton(
                                                                    onPressed: () async {
                                                                      final prefs = await SharedPreferences.getInstance();
                                                                      final token = prefs.getString('token');
                                                                      await ApiService.updateApplication(token ?? '', app['_id'], {'is_mentor': false});
                                                                      final apps = await ApiService.getApplicationsByProject(token ?? '', p['_id']);
                                                                      setState(() => _applicationsByProject[p['_id']] = apps);
                                                                    },
                                                                    style: ElevatedButton.styleFrom(
                                                                      backgroundColor: Colors.orange,
                                                                      minimumSize: const Size(0, 32),
                                                                      padding: const EdgeInsets.symmetric(horizontal: 10),
                                                                      textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                                                    ),
                                                                    child: const Text('Mentorluğu Kaldır', style: TextStyle(color: Colors.white)),
                                                                  ),
                                                                ]
                                                              ],
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    );
                                                  }).toList(),
                                                ),
                              ],
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                ],
              ),
            ),
          ),
          Center(child: Text('Profilim', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.primary))),
        ],
      ),
    );
  }
}

// --- Liste Sayfaları ---
class AcceptedStudentsPage extends StatelessWidget {
  final List<dynamic> acceptedStudents;
  const AcceptedStudentsPage({super.key, required this.acceptedStudents});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.primary,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text(
          'Onaylanan Öğrenciler',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        centerTitle: false,
      ),
      body: ListView.builder(
        itemCount: acceptedStudents.length,
        itemBuilder: (context, i) {
          final s = acceptedStudents[i];
          return ListTile(
            title: Text('${s['student_id']['name']} ${s['student_id']['surname']}'),
            subtitle: Text(s['student_id']['email'] ?? ''),
          );
        },
      ),
    );
  }
}

// --- Proje Detay Sayfası ---
class ProjectDetailPage extends StatelessWidget {
  final Map<String, dynamic> project;
  const ProjectDetailPage({super.key, required this.project});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.primary,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text(
          'Proje Detayı',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        centerTitle: false,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: SingleChildScrollView(
          child: Text(project['description'] ?? '-', style: const TextStyle(fontSize: 16)),
        ),
      ),
    );
  }
}

class ActiveProjectsPage extends StatelessWidget {
  final List<dynamic> activeProjects;
  const ActiveProjectsPage({super.key, required this.activeProjects});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.primary,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text(
          'Aktif Projeler',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        centerTitle: false,
      ),
      body: ListView.builder(
        itemCount: activeProjects.length,
        itemBuilder: (context, i) {
          final p = activeProjects[i];
          return Card(
            color: Colors.white,
            margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p['title'] ?? '-', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16, color: Colors.black87)),
                        const SizedBox(height: 4),
                        Text('Kontejan: ${p['quota'] ?? p['max_students'] ?? '-'}', style: const TextStyle(fontSize: 13, color: Colors.black54)),
                        Text('Süre: ${p['duration'] ?? p['estimated_months'] ?? '-'}', style: const TextStyle(fontSize: 13, color: Colors.black54)),
                        Text('Durum: ${p['status'] ?? '-'}', style: const TextStyle(fontSize: 13, color: Colors.black54)),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(
                        builder: (_) => ProjectDetailPage(project: p),
                      ));
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.deepPurple,
                      foregroundColor: Colors.white,
                      shape: const StadiumBorder(),
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                      textStyle: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    child: const Text('Detay'),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class CompletedProjectsPage extends StatelessWidget {
  final List<dynamic> completedProjects;
  const CompletedProjectsPage({super.key, required this.completedProjects});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.primary,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text(
          'Başvurusu Tamamlanan Projeler',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
        centerTitle: false,
      ),
      body: ListView.builder(
        itemCount: completedProjects.length,
        itemBuilder: (context, i) {
          final p = completedProjects[i];
          return Card(
            color: Colors.white,
            margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p['title'] ?? '-', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16, color: Colors.black87)),
                        const SizedBox(height: 4),
                        Text('Kontejan: ${p['quota'] ?? p['max_students'] ?? '-'}', style: const TextStyle(fontSize: 13, color: Colors.black54)),
                        Text('Süre: ${p['duration'] ?? p['estimated_months'] ?? '-'}', style: const TextStyle(fontSize: 13, color: Colors.black54)),
                        Text('Durum: ${p['status'] ?? '-'}', style: const TextStyle(fontSize: 13, color: Colors.black54)),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(
                        builder: (_) => ProjectDetailPage(project: p),
                      ));
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.deepPurple,
                      foregroundColor: Colors.white,
                      shape: const StadiumBorder(),
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                      textStyle: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    child: const Text('Detay'),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
} 