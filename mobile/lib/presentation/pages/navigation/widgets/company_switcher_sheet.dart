import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/companies.dart';
import '../../../blocs/project/project_bloc.dart';
import '../../../blocs/project/project_event.dart';

class CompanySwitcherSheet extends StatelessWidget {
  final String locale;

  const CompanySwitcherSheet({super.key, required this.locale});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.divider,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 20),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.business_rounded, size: 18, color: AppColors.primary),
                ),
                const SizedBox(width: 12),
                Text(
                  locale == 'tr' ? 'Şirket Seç' : 'Select Company',
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const Divider(height: 1),
          ...AppCompanies.list.map((company) {
            final color = Color(int.parse(company.color.replaceFirst('#', 'FF'), radix: 16));
            return ListTile(
              onTap: () {
                Navigator.of(context).pop();
                context.read<ProjectBloc>().add(LoadProjectsEvent());
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      locale == 'tr'
                          ? '${company.shortName} şirketine geçildi'
                          : 'Switched to ${company.shortName}',
                    ),
                    behavior: SnackBarBehavior.floating,
                    duration: const Duration(seconds: 2),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                );
              },
              leading: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: color.withValues(alpha: 0.25)),
                ),
                child: Center(
                  child: Text(
                    company.code,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w900,
                      color: color,
                    ),
                  ),
                ),
              ),
              title: Text(
                company.shortName,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              subtitle: Text(
                company.description,
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 6),
            );
          }),
          SizedBox(height: MediaQuery.of(context).padding.bottom + 20),
        ],
      ),
    );
  }
}
