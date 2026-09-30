import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/localization/app_translations.dart';
import '../../../blocs/auth/auth_bloc.dart';
import '../../../blocs/auth/auth_event.dart';
import '../../../blocs/language/language_cubit.dart';

class ProfileActionButtons extends StatelessWidget {
  final String locale;

  const ProfileActionButtons({super.key, required this.locale});

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(AppTranslations.get('logout_confirm_title', locale: locale)),
        content: Text(AppTranslations.get('logout_confirm_desc', locale: locale)),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(AppTranslations.get('cancel', locale: locale)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              shape: RoundedRectangleBorder(borderRadius: AppDimensions.borderRadius8),
            ),
            onPressed: () {
              Navigator.of(ctx).pop();
              context.read<AuthBloc>().add(LogoutEvent());
            },
            child: Text(
              AppTranslations.get('logout', locale: locale),
              style: const TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(
          AppTranslations.get('delete_account_confirm_title', locale: locale),
          style: const TextStyle(color: AppColors.danger),
        ),
        content: Text(AppTranslations.get('delete_account_confirm_desc', locale: locale)),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(AppTranslations.get('cancel', locale: locale)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              shape: RoundedRectangleBorder(borderRadius: AppDimensions.borderRadius8),
            ),
            onPressed: () {
              Navigator.of(ctx).pop();
              context.read<AuthBloc>().add(DeleteAccountSubmittedEvent());
            },
            child: Text(
              AppTranslations.get('delete', locale: locale),
              style: const TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Language selection card
        Card(
          shape: RoundedRectangleBorder(borderRadius: AppDimensions.borderRadius16),
          elevation: 0.5,
          child: ListTile(
            leading: const Icon(
              Icons.language_rounded,
              size: AppDimensions.iconDefault,
              color: AppColors.primary,
            ),
            title: Text(
              AppTranslations.get('language_title', locale: locale),
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            trailing: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppDimensions.spacing10,
                vertical: AppDimensions.spacing4,
              ),
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: AppDimensions.borderRadius12,
              ),
              child: Text(
                locale == 'tr' ? 'Türkçe' : 'English',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ),
            onTap: () => context.read<LanguageCubit>().toggleLanguage(),
          ),
        ),
        const SizedBox(height: AppDimensions.spacing16),

        // Logout Button
        SizedBox(
          width: double.infinity,
          height: AppDimensions.buttonHeight,
          child: OutlinedButton.icon(
            icon: const Icon(Icons.logout_rounded, size: AppDimensions.iconRegular),
            label: Text(
              AppTranslations.get('logout', locale: locale),
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.textPrimary,
              side: const BorderSide(color: AppColors.divider, width: AppDimensions.borderWidthRegular),
              shape: RoundedRectangleBorder(borderRadius: AppDimensions.borderRadius12),
            ),
            onPressed: () => _showLogoutDialog(context),
          ),
        ),
        const SizedBox(height: AppDimensions.spacing12),

        // Delete Account Button
        SizedBox(
          width: double.infinity,
          height: AppDimensions.buttonHeight,
          child: TextButton.icon(
            icon: const Icon(
              Icons.delete_forever_outlined,
              size: AppDimensions.iconRegular,
              color: AppColors.danger,
            ),
            label: Text(
              AppTranslations.get('delete_account', locale: locale),
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.danger,
              ),
            ),
            style: TextButton.styleFrom(
              backgroundColor: AppColors.dangerLight,
              shape: RoundedRectangleBorder(borderRadius: AppDimensions.borderRadius12),
            ),
            onPressed: () => _showDeleteAccountDialog(context),
          ),
        ),
      ],
    );
  }
}
