import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/constants/companies.dart';
import '../../core/localization/app_translations.dart';
import '../blocs/auth/auth_bloc.dart';
import '../blocs/auth/auth_event.dart';
import '../blocs/auth/auth_state.dart';
import '../blocs/language/language_cubit.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';
import 'auth/widgets/register_company_dropdown.dart';
import 'auth/widgets/register_role_toggle.dart';
import 'main_navigation_page.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _companyNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  String _registerType = 'employee';
  String _selectedCompanyId = AppCompanies.list.first.id;

  @override
  void dispose() {
    _nameController.dispose();
    _companyNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onRegisterPressed() {
    if (_formKey.currentState?.validate() ?? false) {
      context.read<AuthBloc>().add(
            RegisterSubmittedEvent(
              fullName: _nameController.text.trim(),
              email: _emailController.text.trim(),
              password: _passwordController.text,
            ),
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    final locale = context.watch<LanguageCubit>().state.locale;

    return BlocConsumer<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is Authenticated) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const MainNavigationPage()),
            (route) => false,
          );
        } else if (state is AuthError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: AppColors.danger,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: AppDimensions.borderRadius10),
            ),
          );
        }
      },
      builder: (context, state) {
        final isLoading = state is AuthLoading;

        return Scaffold(
          backgroundColor: AppColors.background,
          appBar: AppBar(
            backgroundColor: AppColors.background,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary),
              onPressed: () => Navigator.of(context).pop(),
            ),
            title: Text(
              AppTranslations.get('register_button', locale: locale),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          body: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(
                  horizontal: context.responsiveHorizontalPadding + AppDimensions.spacing8,
                  vertical: AppDimensions.spacing16,
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      RegisterRoleToggle(
                        registerType: _registerType,
                        locale: locale,
                        onRoleChanged: (type) => setState(() => _registerType = type),
                      ),
                      const SizedBox(height: AppDimensions.spacing24),

                      // Full name field
                      CustomTextField(
                        controller: _nameController,
                        label: AppTranslations.get('fullname', locale: locale),
                        hintText: locale == 'tr' ? 'Örn: Ahmet Yılmaz' : 'e.g. John Doe',
                        prefixIcon: const Icon(
                          Icons.person_outline_rounded,
                          size: AppDimensions.iconDefault,
                          color: AppColors.textMuted,
                        ),
                        validator: (val) {
                          if (val == null || val.isEmpty) {
                            return locale == 'tr' ? 'Ad Soyad zorunludur' : 'Name is required';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: AppDimensions.spacing16),

                      // Company name field or dropdown
                      if (_registerType == 'company')
                        CustomTextField(
                          controller: _companyNameController,
                          label: AppTranslations.get('company_name', locale: locale),
                          hintText: 'Örn: Acme Tech A.Ş.',
                          prefixIcon: const Icon(
                            Icons.business_outlined,
                            size: AppDimensions.iconDefault,
                            color: AppColors.textMuted,
                          ),
                          validator: (val) {
                            if (_registerType == 'company' && (val == null || val.isEmpty)) {
                              return locale == 'tr' ? 'Şirket adı zorunludur' : 'Company name is required';
                            }
                            return null;
                          },
                        )
                      else
                        RegisterCompanyDropdown(
                          selectedCompanyId: _selectedCompanyId,
                          locale: locale,
                          onCompanyChanged: (id) => setState(() => _selectedCompanyId = id),
                        ),
                      const SizedBox(height: AppDimensions.spacing16),

                      // Email field
                      CustomTextField(
                        controller: _emailController,
                        label: AppTranslations.get('email', locale: locale),
                        hintText: 'name@company.com',
                        prefixIcon: const Icon(
                          Icons.email_outlined,
                          size: AppDimensions.iconDefault,
                          color: AppColors.textMuted,
                        ),
                        keyboardType: TextInputType.emailAddress,
                        validator: (val) {
                          if (val == null || val.isEmpty) {
                            return locale == 'tr' ? 'E-posta zorunludur' : 'Email is required';
                          }
                          if (!val.contains('@')) {
                            return locale == 'tr' ? 'Geçerli bir e-posta girin' : 'Enter a valid email';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: AppDimensions.spacing16),

                      // Password field
                      CustomTextField(
                        controller: _passwordController,
                        label: AppTranslations.get('password', locale: locale),
                        hintText: '••••••••',
                        prefixIcon: const Icon(
                          Icons.lock_outline_rounded,
                          size: AppDimensions.iconDefault,
                          color: AppColors.textMuted,
                        ),
                        obscureText: _obscurePassword,
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                            size: AppDimensions.iconDefault,
                            color: AppColors.textMuted,
                          ),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                        validator: (val) {
                          if (val == null || val.isEmpty) {
                            return locale == 'tr' ? 'Şifre zorunludur' : 'Password is required';
                          }
                          if (val.length < 6) {
                            return locale == 'tr'
                                ? 'Şifre en az 6 karakter olmalıdır'
                                : 'Password must be at least 6 characters';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: AppDimensions.spacing28),

                      // Submit button
                      CustomButton(
                        text: AppTranslations.get('register_button', locale: locale),
                        isLoading: isLoading,
                        onPressed: _onRegisterPressed,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
