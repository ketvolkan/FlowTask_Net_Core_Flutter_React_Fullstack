import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../domain/entities/user_entity.dart';

class ProfileUserHeader extends StatelessWidget {
  final UserEntity? user;
  final String locale;

  const ProfileUserHeader({
    super.key,
    required this.user,
    required this.locale,
  });

  @override
  Widget build(BuildContext context) {
    final isAuthorized = user?.isAuthorized ?? false;
    final initial = user != null && user!.fullName.trim().isNotEmpty
        ? user!.fullName.trim()[0].toUpperCase()
        : 'U';

    return Column(
      children: [
        const SizedBox(height: AppDimensions.spacing12),
        CircleAvatar(
          radius: AppDimensions.avatarLarge,
          backgroundColor: AppColors.primaryLight,
          child: Text(
            initial,
            style: const TextStyle(
              fontSize: 34,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
            ),
          ),
        ),
        const SizedBox(height: AppDimensions.spacing14),
        Text(
          user?.fullName ?? 'Flowtask User',
          style: const TextStyle(
            fontSize: 19,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: AppDimensions.spacing4),
        Text(
          user?.email ?? '',
          style: const TextStyle(
            fontSize: 13,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: AppDimensions.spacing10),
        Wrap(
          spacing: AppDimensions.spacing6,
          runSpacing: AppDimensions.spacing6,
          alignment: WrapAlignment.center,
          children: [
            if (isAuthorized)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppDimensions.spacing10,
                  vertical: AppDimensions.spacing4,
                ),
                decoration: BoxDecoration(
                  color: AppColors.statusInProgressBg,
                  borderRadius: AppDimensions.borderRadius20,
                  border: Border.all(
                    color: AppColors.statusInProgress.withValues(alpha: 0.3),
                    width: AppDimensions.borderWidthRegular,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.shield_outlined,
                      size: AppDimensions.iconSmall,
                      color: AppColors.statusInProgress,
                    ),
                    const SizedBox(width: AppDimensions.spacing4),
                    Text(
                      AppTranslations.get('role_manager', locale: locale),
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.statusInProgress,
                      ),
                    ),
                  ],
                ),
              )
            else
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppDimensions.spacing10,
                  vertical: AppDimensions.spacing4,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: AppDimensions.borderRadius20,
                ),
                child: Text(
                  user?.jobTitle ?? AppTranslations.get('role_member', locale: locale),
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }
}
