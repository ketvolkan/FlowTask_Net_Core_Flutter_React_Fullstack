import 'package:flutter/material.dart';

class AppDimensions {
  // ── Spacing Tokens ──────────────────────────────────────────
  static const double spacing2 = 2.0;
  static const double spacing4 = 4.0;
  static const double spacing6 = 6.0;
  static const double spacing8 = 8.0;
  static const double spacing10 = 10.0;
  static const double spacing12 = 12.0;
  static const double spacing14 = 14.0;
  static const double spacing16 = 16.0;
  static const double spacing20 = 20.0;
  static const double spacing24 = 24.0;
  static const double spacing28 = 28.0;
  static const double spacing32 = 32.0;
  static const double spacing40 = 40.0;
  static const double spacing48 = 48.0;

  // Semantic Spacing Aliases
  static const double paddingXs = spacing4;
  static const double paddingSm = spacing8;
  static const double paddingMd = spacing12;
  static const double paddingLg = spacing16;
  static const double paddingXl = spacing24;

  // ── Border Radius Tokens ────────────────────────────────────
  static const double radius4 = 4.0;
  static const double radius6 = 6.0;
  static const double radius8 = 8.0;
  static const double radius10 = 10.0;
  static const double radius12 = 12.0;
  static const double radius14 = 14.0;
  static const double radius16 = 16.0;
  static const double radius20 = 20.0;
  static const double radius24 = 24.0;
  static const double radius28 = 28.0;
  static const double radiusRound = 999.0;

  // Semantic Radius Aliases
  static const double radiusSm = radius6;
  static const double radiusMd = radius10;
  static const double radiusLg = radius16;

  static BorderRadius get borderRadius4 => BorderRadius.circular(radius4);
  static BorderRadius get borderRadius6 => BorderRadius.circular(radius6);
  static BorderRadius get borderRadius8 => BorderRadius.circular(radius8);
  static BorderRadius get borderRadius10 => BorderRadius.circular(radius10);
  static BorderRadius get borderRadius12 => BorderRadius.circular(radius12);
  static BorderRadius get borderRadius14 => BorderRadius.circular(radius14);
  static BorderRadius get borderRadius16 => BorderRadius.circular(radius16);
  static BorderRadius get borderRadius20 => BorderRadius.circular(radius20);
  static BorderRadius get borderRadius24 => BorderRadius.circular(radius24);
  static BorderRadius get borderRadius28 => BorderRadius.circular(radius28);

  // ── Border Width Tokens ─────────────────────────────────────
  static const double borderWidthThin = 0.5;
  static const double borderWidthRegular = 1.0;
  static const double borderWidthMedium = 1.2;
  static const double borderWidthThick = 1.5;
  static const double borderWidthActive = 1.8;
  static const double borderWidthAccent = 2.0;
  static const double borderWidthIndicator = 2.5;
  static const double borderWidthStrip = 4.0;

  // ── Icon Size Tokens ────────────────────────────────────────
  static const double iconXs = 12.0;
  static const double iconExtraSmall = 12.0;
  static const double iconSmall = 14.0;
  static const double iconMedium = 16.0;
  static const double iconRegular = 18.0;
  static const double iconDefault = 20.0;
  static const double iconLarge = 22.0;
  static const double iconNav = 24.0;
  static const double iconExtraLarge = 32.0;
  static const double iconHero = 40.0;

  // ── Avatar & Component Size Tokens ──────────────────────────
  static const double avatarSmall = 24.0;
  static const double avatarMedium = 32.0;
  static const double avatarRegular = 36.0;
  static const double avatarLarge = 44.0;
  static const double avatarExtraLarge = 64.0;
  static const double avatarHero = 80.0;

  // ── Layout Heights ──────────────────────────────────────────
  static const double navBarHeight = 64.0;
  static const double appBarHeight = 72.0;
  static const double buttonHeight = 48.0;
  static const double inputMinHeight = 44.0;
  static const double dragHandleWidth = 40.0;
  static const double dragHandleHeight = 4.0;
}

// ── Responsive Context Extension ──────────────────────────────
extension ResponsiveContext on BuildContext {
  double get screenWidth => MediaQuery.sizeOf(this).width;
  double get screenHeight => MediaQuery.sizeOf(this).height;
  EdgeInsets get screenPadding => MediaQuery.paddingOf(this);
  EdgeInsets get screenViewInsets => MediaQuery.viewInsetsOf(this);

  bool get isSmallPhone => screenWidth < 360;
  bool get isTablet => screenWidth >= 600;

  /// Responsive padding for pages (scales on tablets or very small phones)
  double get responsiveHorizontalPadding {
    if (isTablet) return AppDimensions.spacing32;
    if (isSmallPhone) return AppDimensions.spacing12;
    return AppDimensions.spacing16;
  }

  /// Proportional width calculation
  double widthPercent(double percent) => screenWidth * (percent / 100);

  /// Proportional height calculation
  double heightPercent(double percent) => screenHeight * (percent / 100);
}
