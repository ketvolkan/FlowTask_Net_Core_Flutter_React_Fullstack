import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../blocs/language/language_cubit.dart';

class AuthLanguagePill extends StatelessWidget {
  final String locale;

  const AuthLanguagePill({super.key, required this.locale});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.topRight,
      child: InkWell(
        onTap: () => context.read<LanguageCubit>().toggleLanguage(),
        borderRadius: AppDimensions.borderRadius20,
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.spacing10,
            vertical: AppDimensions.spacing4,
          ),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: AppDimensions.borderRadius20,
            border: Border.all(color: AppColors.divider, width: AppDimensions.borderWidthRegular),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.language_rounded, size: AppDimensions.iconSmall, color: AppColors.primary),
              const SizedBox(width: AppDimensions.spacing4),
              Text(
                locale == 'tr' ? '🇹🇷 TR' : '🇬🇧 EN',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
