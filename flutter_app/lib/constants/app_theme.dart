import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppTheme {
  static const String fontHeading = 'Plus Jakarta Sans';
  static const String fontBody = 'DM Sans';

  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary600,
        primary: AppColors.primary600,
        surface: AppColors.white,
        onSurface: AppColors.gray900,
        onPrimary: AppColors.white,
      ),
      scaffoldBackgroundColor: AppColors.gray50,
      
      // Typography
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontFamily: fontHeading, fontWeight: FontWeight.w700, color: AppColors.gray900),
        displayMedium: TextStyle(fontFamily: fontHeading, fontWeight: FontWeight.w700, color: AppColors.gray900),
        displaySmall: TextStyle(fontFamily: fontHeading, fontWeight: FontWeight.w700, color: AppColors.gray900),
        headlineLarge: TextStyle(fontFamily: fontHeading, fontWeight: FontWeight.w700, color: AppColors.gray900),
        headlineMedium: TextStyle(fontFamily: fontHeading, fontWeight: FontWeight.w600, color: AppColors.gray900),
        headlineSmall: TextStyle(fontFamily: fontHeading, fontWeight: FontWeight.w600, color: AppColors.gray900),
        titleLarge: TextStyle(fontFamily: fontHeading, fontWeight: FontWeight.w600, color: AppColors.gray900),
        titleMedium: TextStyle(fontFamily: fontHeading, fontWeight: FontWeight.w600, color: AppColors.gray900),
        titleSmall: TextStyle(fontFamily: fontHeading, fontWeight: FontWeight.w600, color: AppColors.gray900),
        bodyLarge: TextStyle(fontFamily: fontBody, color: AppColors.gray800, fontSize: 16),
        bodyMedium: TextStyle(fontFamily: fontBody, color: AppColors.gray700, fontSize: 14),
        bodySmall: TextStyle(fontFamily: fontBody, color: AppColors.gray500, fontSize: 12),
      ),

      // AppBar
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.white,
        foregroundColor: AppColors.gray900,
        elevation: 0,
        centerTitle: true,
        surfaceTintColor: Colors.transparent,
        titleTextStyle: TextStyle(
          fontFamily: fontHeading,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: AppColors.gray900,
        ),
      ),

      // Card
      cardTheme: CardThemeData(
        color: AppColors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: const BorderSide(color: AppColors.gray200, width: 1),
        ),
      ),

      // Input Decoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.gray300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.gray200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.primary500, width: 2),
        ),
        labelStyle: const TextStyle(color: AppColors.gray500, fontSize: 14),
        hintStyle: const TextStyle(color: AppColors.gray400, fontSize: 14),
      ),

      // Button Themes
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary600,
          foregroundColor: AppColors.white,
          elevation: 0,
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          textStyle: const TextStyle(
            fontFamily: fontBody,
            fontSize: 15,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.1,
          ),
        ),
      ),
    );
  }
}
