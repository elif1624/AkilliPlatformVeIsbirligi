import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class ProjectEditScreen extends StatefulWidget {
  final Map<String, dynamic> project;
  final Function(Map<String, dynamic>) onSave;
  final bool isNew;

  const ProjectEditScreen({super.key, required this.project, required this.onSave, this.isNew = false});

  @override
  State<ProjectEditScreen> createState() => _ProjectEditScreenState();
}

class _ProjectEditScreenState extends State<ProjectEditScreen> {
  late TextEditingController _titleController;
  late TextEditingController _descController;
  int _quota = 1;
  int _duration = 1;
  DateTime? _startDate;
  DateTime? _endDate;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.project['title'] ?? '');
    _descController = TextEditingController(text: widget.project['description'] ?? '');
    _quota = int.tryParse((widget.project['quota'] ?? widget.project['max_students'] ?? '1').toString()) ?? 1;
    _duration = int.tryParse((widget.project['duration'] ?? widget.project['estimated_months'] ?? '1').toString()) ?? 1;
    _startDate = widget.project['start_date'] != null && widget.project['start_date'].toString().isNotEmpty
        ? DateTime.tryParse(widget.project['start_date'].toString().substring(0, 10))
        : null;
    _endDate = widget.project['end_date'] != null && widget.project['end_date'].toString().isNotEmpty
        ? DateTime.tryParse(widget.project['end_date'].toString().substring(0, 10))
        : null;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _pickStartDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _startDate ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (picked != null) setState(() => _startDate = picked);
  }

  Future<void> _pickEndDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _endDate ?? (_startDate ?? DateTime.now()),
      firstDate: _startDate ?? DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (picked != null) setState(() => _endDate = picked);
  }

  void _save() {
    widget.onSave({
      'title': _titleController.text,
      'description': _descController.text,
      'max_students': _quota,
      'estimated_months': _duration,
      'start_date': _startDate?.toIso8601String(),
      'end_date': _endDate?.toIso8601String(),
    });
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final isNew = widget.isNew || (widget.project['title'] == null || widget.project['title'].toString().isEmpty);
    return Scaffold(
      appBar: AppBar(
        title: Text(isNew ? 'Proje Oluştur' : 'Proje Düzenle', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: AppTheme.primary,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Başlık', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
            TextField(
              controller: _titleController,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                hintText: 'Proje başlığı giriniz',
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
            ),
            const SizedBox(height: 16),
            Text('Açıklama', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
            TextField(
              controller: _descController,
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                hintText: 'Proje açıklaması giriniz',
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Kontejan', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove),
                            onPressed: _quota > 1 ? () => setState(() => _quota--) : null,
                          ),
                          Text('$_quota', style: const TextStyle(fontSize: 18)),
                          IconButton(
                            icon: const Icon(Icons.add),
                            onPressed: () => setState(() => _quota++),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Süre (ay)', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove),
                            onPressed: _duration > 1 ? () => setState(() => _duration--) : null,
                          ),
                          Text('$_duration', style: const TextStyle(fontSize: 18)),
                          IconButton(
                            icon: const Icon(Icons.add),
                            onPressed: () => setState(() => _duration++),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Başlangıç Tarihi', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                      InkWell(
                        onTap: _pickStartDate,
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey.shade400),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(_startDate != null ? _startDate!.toString().substring(0, 10) : 'Seçiniz'),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Bitiş Tarihi', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                      InkWell(
                        onTap: _pickEndDate,
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey.shade400),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(_endDate != null ? _endDate!.toString().substring(0, 10) : 'Seçiniz'),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  style: TextButton.styleFrom(
                    backgroundColor: AppTheme.danger,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  child: const Text('İptal', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: _save,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                  ),
                  child: Text(isNew ? 'Oluştur' : 'Güncelle', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
} 