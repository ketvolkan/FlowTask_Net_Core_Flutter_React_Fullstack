import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_dimensions.dart';
import '../../core/localization/app_translations.dart';
import '../blocs/auth/auth_bloc.dart';
import '../blocs/auth/auth_event.dart';
import '../blocs/auth/auth_state.dart';
import '../blocs/language/language_cubit.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';
import 'auth/widgets/auth_language_pill.dart';
import 'auth/widgets/login_brand_header.dart';
import 'auth/widgets/login_role_toggle.dart';
import 'main_navigation_page.dart';
import 'register_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController(text: 'manager@techflow.com');
  final _passwordController = TextEditingController(text: 'Manager123*');
  bool _obscurePassword = true;
  String _selectedRoleType = 'manager';

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _selectQuickAccount(String type) {
    setState(() {
      _selectedRoleType = type;
      if (type == 'manager') {
        _emailController.text = 'manager@techflow.com';
        _passwordController.text = 'Manager123*';
      } else {
        _emailController.text = 'mehmet.kaya@flowtask.com';
        _passwordController.text = 'User123*';
      }
    });
  }

  void _onLoginPressed() {
    if (_formKey.currentState?.validate() ?? false) {
      context.read<AuthBloc>().add(
            LoginSubmittedEvent(
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
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const MainNavigationPage()),
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
          body: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(
                  horizontal: context.responsiveHorizontalPadding + AppDimensions.spacing8,
                  vertical: AppDimensions.spacing24,
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      AuthLanguagePill(locale: locale),
                      const SizedBox(height: AppDimensions.spacing10),
                      LoginBrandHeader(locale: locale),
                      const SizedBox(height: AppDimensions.spacing24),
                      LoginRoleToggle(
                        selectedRoleType: _selectedRoleType,
                        locale: locale,
                        onRoleSelected: _selectQuickAccount,
                      ),
                      const SizedBox(height: AppDimensions.spacing20),

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
                      const SizedBox(height: AppDimensions.spacing24),

                      // Submit button
                      CustomButton(
                        text: AppTranslations.get('login_button', locale: locale),
                        isLoading: isLoading,
                        onPressed: _onLoginPressed,
                      ),
                      const SizedBox(height: AppDimensions.spacing20),

                      // Register link
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            AppTranslations.get('no_account_yet', locale: locale),
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                          ),
                          const SizedBox(width: AppDimensions.spacing6),
                          GestureDetector(
                            onTap: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(builder: (_) => const RegisterPage()),
                              );
                            },
                            child: Text(
                              AppTranslations.get('register_button', locale: locale),
                              style: const TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ],
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
