import 'package:flutter/material.dart';

class AppColors {
  // Primary / Brand
  static const Color primary = Color(0xFF4F46E5); // Indigo 600
  static const Color primaryLight = Color(0xFFEEF2FF); // Indigo 50
  static const Color primaryDark = Color(0xFF3730A3); // Indigo 800
  static const Color primaryAccent = Color(0xFF6366F1); // Indigo 500

  // Background & Surfaces (Strict Light Mode)
  static const Color background = Color(0xFFF8FAFC); // Slate 50
  static const Color pageBackground = Color(0xFFF0F4FF); // Soft indigo tint
  static const Color surface = Color(0xFFFFFFFF); // Pure White
  static const Color card = Color(0xFFFFFFFF);
  static const Color divider = Color(0xFFE2E8F0); // Slate 200
  static const Color border = Color(0xFFE2E8F0); // Slate 200
  static const Color borderLight = Color(0xFFCBD5E1); // Slate 300

  // Text Colors
  static const Color textPrimary = Color(0xFF0F172A); // Slate 900
  static const Color textSecondary = Color(0xFF64748B); // Slate 500
  static const Color textMuted = Color(0xFF94A3B8); // Slate 400
  static const Color textInverse = Color(0xFFFFFFFF); // White

  // Status & Semantic Colors
  static const Color success = Color(0xFF10B981); // Emerald 500
  static const Color successLight = Color(0xFFECFDF5); // Emerald 50
  static const Color successDark = Color(0xFF047857);

  static const Color warning = Color(0xFFF59E0B); // Amber 500
  static const Color warningLight = Color(0xFFFFFBEB); // Amber 50
  static const Color warningDark = Color(0xFFB45309);

  static const Color danger = Color(0xFFEF4444); // Red 500
  static const Color dangerLight = Color(0xFFFEF2F2); // Red 50
  static const Color dangerDark = Color(0xFFB91C1C);

  static const Color info = Color(0xFF0EA5E9); // Sky 500
  static const Color infoLight = Color(0xFFF0F9FF); // Sky 50
  static const Color infoDark = Color(0xFF0369A1);

  // Status Specific Colors (SOLID enums)
  static const Color statusAll = Color(0xFF475569); // Slate 600
  static const Color statusAllBg = Color(0xFFF1F5F9); // Slate 100

  static const Color statusTodo = Color(0xFF3B82F6); // Blue 500
  static const Color statusTodoBg = Color(0xFFEFF6FF); // Blue 50

  static const Color statusInProgress = Color(0xFF8B5CF6); // Purple 500
  static const Color statusInProgressBg = Color(0xFFF5F3FF); // Purple 50

  static const Color statusInReview = Color(0xFFF59E0B); // Amber 500
  static const Color statusInReviewBg = Color(0xFFFFFBEB); // Amber 50

  static const Color statusDone = Color(0xFF10B981); // Emerald 500
  static const Color statusDoneBg = Color(0xFFECFDF5); // Emerald 50

  // Priority Specific Colors
  static const Color priorityLow = Color(0xFF64748B); // Slate 500
  static const Color priorityLowBg = Color(0xFFF8FAFC);

  static const Color priorityMedium = Color(0xFF6366F1); // Indigo 500
  static const Color priorityMediumBg = Color(0xFFEEF2FF);

  static const Color priorityHigh = Color(0xFFF59E0B); // Amber 500
  static const Color priorityHighBg = Color(0xFFFFFBEB);

  static const Color priorityUrgent = Color(0xFFEF4444); // Red 500
  static const Color priorityUrgentBg = Color(0xFFFEF2F2);

  // Issue Type Specific Colors
  static const Color typeTask = Color(0xFF4F46E5);
  static const Color typeTaskBg = Color(0xFFEEF2FF);

  static const Color typeBug = Color(0xFFDC2626);
  static const Color typeBugBg = Color(0xFFFEF2F2);

  static const Color typeStory = Color(0xFF059669);
  static const Color typeStoryBg = Color(0xFFECFDF5);

  static const Color typeEpic = Color(0xFF7C3AED);
  static const Color typeEpicBg = Color(0xFFF5F3FF);

  // Dashboard Stat Card Accents
  static const Color statBlue = Color(0xFF93C5FD);
  static const Color statGreen = Color(0xFF6EE7B7);
  static const Color statRed = Color(0xFFFCA5A5);

  // App Bar Gradients
  static const List<Color> primaryGradient = [
    Color(0xFF4F46E5),
    Color(0xFF3730A3),
  ];

  static const List<Color> progressGradient = [
    Color(0xFF10B981),
    Color(0xFF34D399),
  ];

  static const Color shadow = Color(0xFF0F172A);
}
