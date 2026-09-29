import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/companies.dart';
import '../../core/localization/app_translations.dart';
import '../blocs/auth/auth_bloc.dart';
import '../blocs/auth/auth_event.dart';
import '../blocs/auth/auth_state.dart';
import '../blocs/language/language_cubit.dart';
import '../widgets/custom_button.dart';
import 'login_page.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  void _showLogoutDialog(BuildContext context, String locale) {
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
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () {
              Navigator.of(ctx).pop();
              context.read<AuthBloc>().add(LogoutEvent());
            },
            child: Text(AppTranslations.get('logout', locale: locale), style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog(BuildContext context, String locale) {
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
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () {
              Navigator.of(ctx).pop();
              context.read<AuthBloc>().add(DeleteAccountSubmittedEvent());
            },
            child: Text(AppTranslations.get('delete', locale: locale), style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final langState = context.watch<LanguageCubit>().state;
    final locale = langState.locale;

    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is Unauthenticated) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const LoginPage()),
            (route) => false,
          );
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text(
            AppTranslations.get('profile_title', locale: locale),
            style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.textPrimary),
          ),
          backgroundColor: Colors.white,
          elevation: 0,
        ),
        body: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, state) {
            final user = state is Authenticated ? state.user : null;
            final isAuthorized = user?.isAuthorized ?? false;
            final userCompany = user != null
                ? AppCompanies.getCompanyForUser(user.email, user.department, user.jobTitle)
                : null;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const SizedBox(height: 12),
                  // User Avatar & Identity
                  CircleAvatar(
                    radius: 42,
                    backgroundColor: AppColors.primaryLight,
                    child: Text(
                      user != null && user.fullName.isNotEmpty
                          ? user.fullName[0].toUpperCase()
                          : 'U',
                      style: const TextStyle(
                        fontSize: 34,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    user?.fullName ?? 'Flowtask User',
                    style: const TextStyle(
                      fontSize: 19,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.email ?? '',
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Roles / Authority Badges
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    alignment: WrapAlignment.center,
                    children: [
                      if (isAuthorized)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.purple.shade50,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.purple.shade200),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.shield_outlined, size: 14, color: Colors.purple.shade700),
                              const SizedBox(width: 4),
                              Text(
                                AppTranslations.get('role_manager', locale: locale),
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.purple.shade700,
                                ),
                              ),
                            ],
                          ),
                        )
                      else
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.primaryLight,
                            borderRadius: BorderRadius.circular(20),
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
                  const SizedBox(height: 24),

                  // Company & Department Card
                  Card(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0.5,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.business_outlined, size: 18, color: AppColors.primary),
                              const SizedBox(width: 8),
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
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.grey.shade100,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.lock_outline, size: 11, color: AppColors.textMuted),
                                      const SizedBox(width: 3),
                                      Text(
                                        AppTranslations.get('readonly_badge', locale: locale),
                                        style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                          const Divider(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                AppTranslations.get('company_name', locale: locale),
                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                              ),
                              Text(
                                userCompany?.shortName ?? 'TechFlow',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                AppTranslations.get('department_name', locale: locale),
                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                              ),
                              Flexible(
                                child: Text(
                                  user?.department ?? AppTranslations.get('not_specified', locale: locale),
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textPrimary,
                                  ),
                                  textAlign: TextAlign.end,
                                ),
                              ),
                            ],
                          ),
                          if (!isAuthorized) ...[
                            const SizedBox(height: 10),
                            Text(
                              AppTranslations.get('dept_readonly_note', locale: locale),
                              style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Language Switcher Card
                  Card(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0.5,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.language, size: 18, color: AppColors.primary),
                              const SizedBox(width: 8),
                              Text(
                                AppTranslations.get('language_title', locale: locale),
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
                          const Divider(height: 20),
                          Row(
                            children: [
                              Expanded(
                                child: InkWell(
                                  onTap: () => context.read<LanguageCubit>().setLanguage('tr'),
                                  borderRadius: BorderRadius.circular(10),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                                    decoration: BoxDecoration(
                                      color: locale == 'tr' ? AppColors.primaryLight : Colors.transparent,
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(
                                        color: locale == 'tr' ? AppColors.primary : AppColors.divider,
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          AppTranslations.get('language_tr', locale: locale),
                                          style: TextStyle(
                                            fontSize: 13,
                                            fontWeight: locale == 'tr' ? FontWeight.w700 : FontWeight.w500,
                                            color: locale == 'tr' ? AppColors.primary : AppColors.textPrimary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: InkWell(
                                  onTap: () => context.read<LanguageCubit>().setLanguage('en'),
                                  borderRadius: BorderRadius.circular(10),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                                    decoration: BoxDecoration(
                                      color: locale == 'en' ? AppColors.primaryLight : Colors.transparent,
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(
                                        color: locale == 'en' ? AppColors.primary : AppColors.divider,
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          AppTranslations.get('language_en', locale: locale),
                                          style: TextStyle(
                                            fontSize: 13,
                                            fontWeight: locale == 'en' ? FontWeight.w700 : FontWeight.w500,
                                            color: locale == 'en' ? AppColors.primary : AppColors.textPrimary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Logout button
                  CustomButton(
                    text: AppTranslations.get('logout', locale: locale),
                    icon: Icons.logout,
                    color: AppColors.primary,
                    isOutlined: true,
                    onPressed: () => _showLogoutDialog(context, locale),
                  ),
                  const SizedBox(height: 14),

                  // Delete Account button
                  TextButton.icon(
                    onPressed: () => _showDeleteAccountDialog(context, locale),
                    icon: const Icon(Icons.delete_forever_outlined, color: AppColors.danger, size: 18),
                    label: Text(
                      AppTranslations.get('delete_account', locale: locale),
                      style: const TextStyle(color: AppColors.danger, fontWeight: FontWeight.w600, fontSize: 13),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
