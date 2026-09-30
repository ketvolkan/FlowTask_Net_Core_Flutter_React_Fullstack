import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/companies.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../../domain/entities/user_entity.dart';

class ProfileCompanyCard extends StatelessWidget {
  final UserEntity? user;
  final Company? company;
  final String locale;

  const ProfileCompanyCard({
    super.key,
    required this.user,
    required this.company,
    required this.locale,
  });

  @override
  Widget build(BuildContext context) {
    final isAuthorized = user?.isAuthorized ?? false;

    return Card(
      shape: RoundedRectangleBorder(borderRadius: AppDimensions.borderRadius16),
      elevation: 0.5,
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.business_outlined,
                  size: AppDimensions.iconRegular,
                  color: AppColors.primary,
                ),
                const SizedBox(width: AppDimensions.spacing8),
                Text(
                  AppTranslations.get('company_info_title', locale: locale),
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                if (!isAuthorized)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppDimensions.spacing6,
                      vertical: AppDimensions.spacing2,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: AppDimensions.borderRadius6,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.lock_outline,
                          size: AppDimensions.iconExtraSmall - 1,
                          color: AppColors.textMuted,
                        ),
                        const SizedBox(width: AppDimensions.spacing4 - 1),
                        Text(
                          AppTranslations.get('readonly_badge', locale: locale),
                          style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            const Divider(height: AppDimensions.spacing20),
            _buildRow(
              label: AppTranslations.get('company_name', locale: locale),
              value: company?.shortName ?? 'TechFlow',
            ),
            const SizedBox(height: AppDimensions.spacing12),
            _buildRow(
              label: AppTranslations.get('company_code', locale: locale),
              value: company?.code ?? 'TF',
            ),
            const SizedBox(height: AppDimensions.spacing12),
            _buildRow(
              label: AppTranslations.get('department_title', locale: locale),
              value: user?.department ?? 'Engineering',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRow({required String label, required String value}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
