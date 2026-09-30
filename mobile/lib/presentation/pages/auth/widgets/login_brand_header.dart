import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/localization/app_translations.dart';

class LoginBrandHeader extends StatelessWidget {
  final String locale;

  const LoginBrandHeader({super.key, required this.locale});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Center(
          child: Container(
            padding: const EdgeInsets.all(AppDimensions.spacing14),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: AppDimensions.borderRadius20,
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.15),
                  blurRadius: AppDimensions.spacing12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(
              Icons.check_circle_outline_rounded,
              size: AppDimensions.iconHero,
              color: AppColors.primary,
            ),
          ),
        ),
        const SizedBox(height: AppDimensions.spacing16),
        Text(
          AppTranslations.get('login_title', locale: locale),
          style: const TextStyle(
            fontSize: 23,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            letterSpacing: -0.5,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppDimensions.spacing6),
        Text(
          AppTranslations.get('login_subtitle', locale: locale),
          style: const TextStyle(
            fontSize: 13,
            color: AppColors.textSecondary,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
