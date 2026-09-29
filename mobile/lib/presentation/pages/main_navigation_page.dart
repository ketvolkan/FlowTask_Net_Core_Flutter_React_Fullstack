import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/localization/app_translations.dart';
import '../blocs/language/language_cubit.dart';
import '../blocs/project/project_bloc.dart';
import '../blocs/project/project_event.dart';
import 'dashboard_page.dart';
import 'projects_page.dart';
import 'board_page.dart';
import 'profile_page.dart';

class MainNavigationPage extends StatefulWidget {
  const MainNavigationPage({super.key});

  @override
  State<MainNavigationPage> createState() => _MainNavigationPageState();
}

class _MainNavigationPageState extends State<MainNavigationPage> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    DashboardPage(),
    ProjectsPage(),
    BoardPage(),
    ProfilePage(),
  ];

  @override
  void initState() {
    super.initState();
    context.read<ProjectBloc>().add(LoadProjectsEvent());
  }

  @override
  Widget build(BuildContext context) {
    final langState = context.watch<LanguageCubit>().state;
    final locale = langState.locale;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppColors.divider, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: AppColors.surface,
          selectedItemColor: AppColors.primary,
          unselectedItemColor: AppColors.textMuted,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          items: [
            BottomNavigationBarItem(
              icon: const Icon(Icons.dashboard_outlined),
              activeIcon: const Icon(Icons.dashboard),
              label: AppTranslations.get('nav_dashboard', locale: locale),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.folder_outlined),
              activeIcon: const Icon(Icons.folder),
              label: AppTranslations.get('nav_projects', locale: locale),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.view_kanban_outlined),
              activeIcon: const Icon(Icons.view_kanban),
              label: AppTranslations.get('nav_board', locale: locale),
            ),
            BottomNavigationBarItem(
              icon: const Icon(Icons.person_outline),
              activeIcon: const Icon(Icons.person),
              label: AppTranslations.get('nav_profile', locale: locale),
            ),
          ],
        ),
      ),
    );
  }
}
