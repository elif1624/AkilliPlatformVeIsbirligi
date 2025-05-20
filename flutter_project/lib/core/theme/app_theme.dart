import 'package:flutter/material.dart';

class AppTheme {
  static const Color primary = Color(0xFF2B4EFF); // Web'deki ana mavi
  static const Color secondary = Color(0xFF6C63FF);
  static const Color success = Color(0xFF22C55E);
  static const Color danger = Color(0xFFEF4444);
  static const Color background = Color(0xFFF5F7FB);
  static const Color textPrimary = Color(0xFF222B45);
  static const Color textSecondary = Color(0xFF8F9BB3);

  static ThemeData get themeData => ThemeData(
    primaryColor: primary,
    scaffoldBackgroundColor: background,
    colorScheme: ColorScheme.fromSeed(seedColor: primary),
    fontFamily: 'Inter',
    textTheme: const TextTheme(
      bodyMedium: TextStyle(color: textPrimary),
    ),
  );
} 