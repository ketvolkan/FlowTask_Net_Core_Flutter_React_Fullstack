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
import '../widgets/custom_text_field.dart';
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
    final langState = context.watch<LanguageCubit>().state;
    final locale = langState.locale;

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
              icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
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
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Role Selection Type
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.grey.shade200),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => _registerType = 'employee'),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  decoration: BoxDecoration(
                                    color: _registerType == 'employee'
                                        ? Colors.white
                                        : Colors.transparent,
                                    borderRadius: BorderRadius.circular(10),
                                    boxShadow: _registerType == 'employee'
                                        ? [
                                            BoxShadow(
                                              color: Colors.black.withValues(alpha: 0.05),
                                              blurRadius: 4,
                                              offset: const Offset(0, 2),
                                            ),
                                          ]
                                        : null,
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.person_outline,
                                        size: 16,
                                        color: _registerType == 'employee'
                                            ? AppColors.primary
                                            : AppColors.textSecondary,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        AppTranslations.get('role_member', locale: locale),
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: _registerType == 'employee'
                                              ? FontWeight.w700
                                              : FontWeight.w500,
                                          color: _registerType == 'employee'
                                              ? AppColors.primary
                                              : AppColors.textSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            Expanded(
                              child: GestureDetector(
                                onTap: () => setState(() => _registerType = 'company'),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  decoration: BoxDecoration(
                                    color: _registerType == 'company'
                                        ? Colors.white
                                        : Colors.transparent,
                                    borderRadius: BorderRadius.circular(10),
                                    boxShadow: _registerType == 'company'
                                        ? [
                                            BoxShadow(
                                              color: Colors.black.withValues(alpha: 0.05),
                                              blurRadius: 4,
                                              offset: const Offset(0, 2),
                                            ),
                                          ]
                                        : null,
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.business_outlined,
                                        size: 16,
                                        color: _registerType == 'company'
                                            ? AppColors.primary
                                            : AppColors.textSecondary,
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        AppTranslations.get('role_manager', locale: locale),
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: _registerType == 'company'
                                              ? FontWeight.w700
                                              : FontWeight.w500,
                                          color: _registerType == 'company'
                                              ? AppColors.primary
                                              : AppColors.textSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      CustomTextField(
                        controller: _nameController,
                        label: AppTranslations.get('fullname', locale: locale),
                        hintText: locale == 'tr' ? 'Örn: Ahmet Yılmaz' : 'e.g. John Doe',
                        prefixIcon: const Icon(Icons.person_outline, size: 20, color: AppColors.textMuted),
                        validator: (val) {
                          if (val == null || val.isEmpty) return locale == 'tr' ? 'Ad Soyad zorunludur' : 'Name is required';
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      if (_registerType == 'company')
                        CustomTextField(
                          controller: _companyNameController,
                          label: AppTranslations.get('company_name', locale: locale),
                          hintText: 'Örn: Acme Tech A.Ş.',
                          prefixIcon: const Icon(Icons.business_outlined, size: 20, color: AppColors.textMuted),
                          validator: (val) {
                            if (_registerType == 'company' && (val == null || val.isEmpty)) {
                              return locale == 'tr' ? 'Şirket adı zorunludur' : 'Company name is required';
                            }
                            return null;
                          },
                        )
                      else
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              AppTranslations.get('company_name', locale: locale),
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.grey.shade300),
                              ),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  value: _selectedCompanyId,
                                  isExpanded: true,
                                  icon: const Icon(Icons.arrow_drop_down, color: AppColors.textSecondary),
                                  items: AppCompanies.list.map((c) {
                                    return DropdownMenuItem(
                                      value: c.id,
                                      child: Text(
                                        c.name,
                                        style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                                      ),
                                    );
                                  }).toList(),
                                  onChanged: (val) {
                                    if (val != null) {
                                      setState(() => _selectedCompanyId = val);
                                    }
                                  },
                                ),
                              ),
                            ),
                          ],
                        ),

                      const SizedBox(height: 16),
                      CustomTextField(
                        controller: _emailController,
                        label: AppTranslations.get('email', locale: locale),
                        hintText: 'name@company.com',
                        keyboardType: TextInputType.emailAddress,
                        prefixIcon: const Icon(Icons.email_outlined, size: 20, color: AppColors.textMuted),
                        validator: (val) {
                          if (val == null || val.isEmpty) return locale == 'tr' ? 'E-posta zorunludur' : 'Email is required';
                          if (!val.contains('@')) return locale == 'tr' ? 'Geçerli bir e-posta adresi girin' : 'Enter a valid email';
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      CustomTextField(
                        controller: _passwordController,
                        label: AppTranslations.get('password', locale: locale),
                        hintText: '••••••••',
                        obscureText: _obscurePassword,
                        prefixIcon: const Icon(Icons.lock_outline, size: 20, color: AppColors.textMuted),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                            size: 20,
                            color: AppColors.textMuted,
                          ),
                          onPressed: () {
                            setState(() {
                              _obscurePassword = !_obscurePassword;
                            });
                          },
                        ),
                        validator: (val) {
                          if (val == null || val.length < 6) return locale == 'tr' ? 'En az 6 karakter girilmelidir' : 'Minimum 6 characters';
                          return null;
                        },
                      ),
                      const SizedBox(height: 24),
                      CustomButton(
                        text: AppTranslations.get('register_button', locale: locale),
                        isLoading: isLoading,
                        onPressed: _onRegisterPressed,
                      ),
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            '${AppTranslations.get('have_account', locale: locale).split('?')[0]}? ',
                            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                          ),
                          GestureDetector(
                            onTap: () => Navigator.of(context).pop(),
                            child: Text(
                              AppTranslations.get('login_button', locale: locale),
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary,
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
