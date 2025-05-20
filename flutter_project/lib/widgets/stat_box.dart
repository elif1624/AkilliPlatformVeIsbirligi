import 'package:flutter/material.dart';

class StatBox extends StatelessWidget {
  final String label;
  final int value;
  final Color color;
  final Color textColor;
  final VoidCallback? onTap;
  final double? width;

  const StatBox({
    super.key,
    required this.label,
    required this.value,
    required this.color,
    this.textColor = Colors.white,
    this.onTap,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: width,
        margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: color.withOpacity(0.92),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color, width: 1.2),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('$value', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: textColor)),
            const SizedBox(height: 6),
            Text(label, style: TextStyle(fontSize: 15, color: textColor)),
          ],
        ),
      ),
    );
  }
} 