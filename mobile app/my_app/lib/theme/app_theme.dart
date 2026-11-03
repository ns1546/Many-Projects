import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Ethereal Glass & Soft Structuralism Vibe
  static const Color background = Color(0xFFFDFBF7); // Warm cream
  static const Color primaryColor = Color(0xFFE85D75); // Soft Crimson/Rose
  static const Color secondaryColor = Color(0xFF9D8DF1); // Muted Lavender
  static const Color textPrimary = Color(0xFF1A1A1A); // Deep off-black
  static const Color textSecondary = Color(0xFF8A8A8E); // Soft gray
  static const Color cardOuter = Color(0x0C000000); // 5% black ring
  static const Color cardInner = Color(0xFFFFFFFF); // Pure white core

  static ThemeData get lightTheme {
    return ThemeData(
      scaffoldBackgroundColor: background,
      primaryColor: primaryColor,
      colorScheme: ColorScheme.fromSeed(seedColor: primaryColor, surface: background),
      textTheme: ThemeData.light().textTheme.apply(
        fontFamily: GoogleFonts.outfit().fontFamily,
        bodyColor: textPrimary,
        displayColor: textPrimary,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: background,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.outfit(
          color: textPrimary,
          fontSize: 28,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.5,
        ),
        iconTheme: const IconThemeData(color: textPrimary),
      ),
      cardTheme: const CardThemeData(
        color: Colors.transparent, // Cards handle their own background for the double-bezel effect
        elevation: 0,
      ),
      useMaterial3: true,
    );
  }
}
