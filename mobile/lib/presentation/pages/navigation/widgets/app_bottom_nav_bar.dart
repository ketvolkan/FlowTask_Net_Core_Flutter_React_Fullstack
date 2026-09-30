import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/companies.dart';
import '../../../../core/localization/app_translations.dart';

class AppBottomNavBar extends StatelessWidget {
  final int currentIndex;
  final String locale;
  final Company? company;
  final List<AnimationController> iconControllers;
  final ValueChanged<int> onTabTap;
  final VoidCallback onCompanyLongPress;

  const AppBottomNavBar({
    super.key,
    required this.currentIndex,
    required this.locale,
    required this.company,
    required this.iconControllers,
    required this.onTabTap,
    required this.onCompanyLongPress,
  });

  @override
  Widget build(BuildContext context) {
    final items = [
      _NavItemData(
        icon: Icons.space_dashboard_outlined,
        activeIcon: Icons.space_dashboard_rounded,
        label: AppTranslations.get('nav_dashboard', locale: locale),
      ),
      _NavItemData(
        icon: Icons.folder_copy_outlined,
        activeIcon: Icons.folder_copy_rounded,
        label: AppTranslations.get('nav_projects', locale: locale),
      ),
      _NavItemData(
        icon: Icons.view_kanban_outlined,
        activeIcon: Icons.view_kanban_rounded,
        label: AppTranslations.get('nav_board', locale: locale),
      ),
      _NavItemData(
        icon: Icons.person_outline_rounded,
        activeIcon: Icons.person_rounded,
        label: AppTranslations.get('nav_profile', locale: locale),
        isProfile: true,
      ),
    ];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: AppColors.shadow.withValues(alpha: 0.08),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            children: List.generate(items.length, (i) {
              final item = items[i];
              final isActive = currentIndex == i;
              return Expanded(
                child: _NavButton(
                  data: item,
                  isActive: isActive,
                  controller: iconControllers[i],
                  company: item.isProfile ? company : null,
                  onTap: () => onTabTap(i),
                  onLongPress: item.isProfile ? onCompanyLongPress : null,
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _NavItemData {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isProfile;

  const _NavItemData({
    required this.icon,
    required this.activeIcon,
    required this.label,
    this.isProfile = false,
  });
}

class _NavButton extends StatelessWidget {
  final _NavItemData data;
  final bool isActive;
  final AnimationController controller;
  final Company? company;
  final VoidCallback onTap;
  final VoidCallback? onLongPress;

  const _NavButton({
    required this.data,
    required this.isActive,
    required this.controller,
    required this.onTap,
    this.company,
    this.onLongPress,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      onLongPress: onLongPress,
      behavior: HitTestBehavior.opaque,
      child: AnimatedBuilder(
        animation: controller,
        builder: (context, _) {
          return Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
                decoration: BoxDecoration(
                  color: isActive ? AppColors.primary.withValues(alpha: 0.1) : Colors.transparent,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: _buildIcon(),
              ),
              const SizedBox(height: 2),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                  color: isActive ? AppColors.primary : AppColors.textMuted,
                ),
                child: Text(
                  data.label,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildIcon() {
    if (data.isProfile && company != null) {
      return _CompanyAvatar(
        company: company!,
        isActive: isActive,
      );
    }
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 200),
      child: Icon(
        isActive ? data.activeIcon : data.icon,
        key: ValueKey(isActive),
        size: 24,
        color: isActive ? AppColors.primary : AppColors.textMuted,
      ),
    );
  }
}

class _CompanyAvatar extends StatelessWidget {
  final Company company;
  final bool isActive;

  const _CompanyAvatar({required this.company, required this.isActive});

  @override
  Widget build(BuildContext context) {
    final color = Color(int.parse(company.color.replaceFirst('#', 'FF'), radix: 16));
    return Container(
      width: 26,
      height: 26,
      decoration: BoxDecoration(
        color: isActive ? color.withValues(alpha: 0.15) : AppColors.statusAllBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isActive ? color : AppColors.divider,
          width: isActive ? 2 : 1.2,
        ),
      ),
      child: Center(
        child: Text(
          company.code,
          style: TextStyle(
            fontSize: 8,
            fontWeight: FontWeight.w900,
            color: isActive ? color : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
