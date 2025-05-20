import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';

class ProjectDetailModal extends StatelessWidget {
  final Map<String, dynamic> project;
  final VoidCallback onClose;

  const ProjectDetailModal({super.key, required this.project, required this.onClose});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onClose,
      child: Material(
        color: Colors.black.withOpacity(0.35),
        child: Center(
          child: GestureDetector(
            onTap: () {},
            child: Container(
              width: MediaQuery.of(context).size.width * 0.92,
              constraints: const BoxConstraints(maxWidth: 420),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.10),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Stack(
                children: [
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        project['title'] ?? '-',
                        style: TextStyle(
                          color: AppTheme.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 22,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        project['description'] ?? '-',
                        style: const TextStyle(fontSize: 15, color: Colors.black87),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Text('Kontejan: ', style: TextStyle(fontWeight: FontWeight.w600, color: AppTheme.primary)),
                          Text('${project['quota'] ?? project['max_students'] ?? '-'}'),
                          const SizedBox(width: 18),
                          Text('Süre: ', style: TextStyle(fontWeight: FontWeight.w600, color: AppTheme.primary)),
                          Text('${project['duration'] ?? project['estimated_months'] ?? '-'}'),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Text('Başvuru Durumu: ', style: TextStyle(fontWeight: FontWeight.w600, color: AppTheme.primary)),
                          Text(
                            (project['status'] == 'active') ? 'Başvuru Açık' : 'Başvuru Kapalı',
                            style: TextStyle(
                              color: (project['status'] == 'active') ? Colors.green : Colors.red,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      if (project['owner'] != null)
                        Row(
                          children: [
                            Text('Proje Sahibi: ', style: TextStyle(fontWeight: FontWeight.w600, color: AppTheme.primary)),
                            Text('${project['owner']['name'] ?? ''} ${project['owner']['surname'] ?? ''}'),
                          ],
                        ),
                      if (project['start_date'] != null && project['end_date'] != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: RichText(
                            text: TextSpan(
                              children: [
                                TextSpan(
                                  text: 'Başvuru Tarihi Aralığı: ',
                                  style: TextStyle(
                                    color: AppTheme.primary,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 15,
                                  ),
                                ),
                                TextSpan(
                                  text:
                                    '${project['start_date'] != null ? (project['start_date'] as String).substring(0, 10) : '-'}'
                                    ' - '
                                    '${project['end_date'] != null ? (project['end_date'] as String).substring(0, 10) : '-'}',
                                  style: const TextStyle(
                                    color: Colors.black87,
                                    fontWeight: FontWeight.normal,
                                    fontSize: 15,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                  Positioned(
                    top: 0,
                    right: 0,
                    child: IconButton(
                      icon: Icon(Icons.close, color: AppTheme.danger, size: 28),
                      onPressed: onClose,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// Yeni: Proje düzenleme modalı
// import 'package:flutter/material.dart';
// import '../core/theme/app_theme.dart';

class ProjectEditModal extends StatefulWidget {
  final Map<String, dynamic> project;
  final VoidCallback onClose;
  final Function(Map<String, dynamic>) onSave;

  const ProjectEditModal({super.key, required this.project, required this.onClose, required this.onSave});

  @override
  State<ProjectEditModal> createState() => _ProjectEditModalState();
}

class _ProjectEditModalState extends State<ProjectEditModal> {
  late TextEditingController _titleController;
  late TextEditingController _descController;
  late TextEditingController _quotaController;
  late TextEditingController _durationController;
  late TextEditingController _startDateController;
  late TextEditingController _endDateController;
  String _status = 'active';

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.project['title'] ?? '');
    _descController = TextEditingController(text: widget.project['description'] ?? '');
    _quotaController = TextEditingController(text: (widget.project['quota'] ?? widget.project['max_students'] ?? '').toString());
    _durationController = TextEditingController(text: (widget.project['duration'] ?? widget.project['estimated_months'] ?? '').toString());
    _startDateController = TextEditingController(text: (widget.project['start_date'] ?? '').toString().substring(0,10));
    _endDateController = TextEditingController(text: (widget.project['end_date'] ?? '').toString().substring(0,10));
    _status = widget.project['status'] ?? 'active';
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _quotaController.dispose();
    _durationController.dispose();
    _startDateController.dispose();
    _endDateController.dispose();
    super.dispose();
  }

  void _save() {
    widget.onSave({
      'title': _titleController.text,
      'description': _descController.text,
      'max_students': int.tryParse(_quotaController.text) ?? 0,
      'estimated_months': int.tryParse(_durationController.text) ?? 0,
      'start_date': _startDateController.text,
      'end_date': _endDateController.text,
      'status': _status,
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onClose,
      child: Material(
        color: Colors.black.withOpacity(0.35),
        child: Center(
          child: GestureDetector(
            onTap: () {},
            child: Container(
              width: MediaQuery.of(context).size.width * 0.92,
              constraints: const BoxConstraints(maxWidth: 420),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.10),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Proje Düzenle', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold, fontSize: 22)),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _titleController,
                      decoration: const InputDecoration(labelText: 'Başlık'),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _descController,
                      decoration: const InputDecoration(labelText: 'Açıklama'),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _quotaController,
                            decoration: const InputDecoration(labelText: 'Kontejan'),
                            keyboardType: TextInputType.number,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: _durationController,
                            decoration: const InputDecoration(labelText: 'Süre (ay)'),
                            keyboardType: TextInputType.number,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _startDateController,
                            decoration: const InputDecoration(labelText: 'Başlangıç Tarihi (YYYY-MM-DD)'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: _endDateController,
                            decoration: const InputDecoration(labelText: 'Bitiş Tarihi (YYYY-MM-DD)'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    DropdownButtonFormField<String>(
                      value: _status,
                      decoration: const InputDecoration(labelText: 'Durum'),
                      items: const [
                        DropdownMenuItem(value: 'active', child: Text('Aktif')),
                        DropdownMenuItem(value: 'completed', child: Text('Tamamlandı')),
                        DropdownMenuItem(value: 'archived', child: Text('Arşivlendi')),
                      ],
                      onChanged: (v) => setState(() => _status = v ?? 'active'),
                    ),
                    const SizedBox(height: 18),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: widget.onClose,
                          child: Text('İptal', style: TextStyle(color: AppTheme.danger)),
                        ),
                        const SizedBox(width: 10),
                        ElevatedButton(
                          onPressed: _save,
                          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary),
                          child: const Text('Kaydet'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
} 