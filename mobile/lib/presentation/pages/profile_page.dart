import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/constants/companies.dart';
import '../../core/localization/app_translations.dart';
import '../blocs/auth/auth_bloc.dart';
import '../blocs/auth/auth_state.dart';
import '../blocs/language/language_cubit.dart';
import 'login_page.dart';
import 'profile/widgets/profile_action_buttons.dart';
import 'profile/widgets/profile_company_card.dart';
import 'profile/widgets/profile_user_header.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final locale = context.watch<LanguageCubit>().state.locale;

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
            style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
          backgroundColor: Colors.white,
          elevation: 0,
        ),
        body: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, state) {
            final user = state is Authenticated ? state.user : null;
            final userCompany = user != null
                ? AppCompanies.getCompanyForUser(user.email, user.department, user.jobTitle)
                : null;

            return SingleChildScrollView(
              padding: EdgeInsets.symmetric(
                horizontal: context.responsiveHorizontalPadding,
                vertical: AppDimensions.spacing16,
              ),
              child: Column(
                children: [
                  ProfileUserHeader(user: user, locale: locale),
                  const SizedBox(height: AppDimensions.spacing24),
                  ProfileCompanyCard(
                    user: user,
                    company: userCompany,
                    locale: locale,
                  ),
                  const SizedBox(height: AppDimensions.spacing16),
                  ProfileActionButtons(locale: locale),
                  const SizedBox(height: AppDimensions.spacing32),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
