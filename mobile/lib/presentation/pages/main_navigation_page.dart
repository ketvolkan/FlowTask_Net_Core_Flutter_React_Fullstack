import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/companies.dart';
import '../blocs/auth/auth_bloc.dart';
import '../blocs/auth/auth_state.dart';
import '../blocs/language/language_cubit.dart';
import '../blocs/project/project_bloc.dart';
import '../blocs/project/project_event.dart';
import 'board_page.dart';
import 'dashboard_page.dart';
import 'navigation/widgets/app_bottom_nav_bar.dart';
import 'navigation/widgets/company_switcher_sheet.dart';
import 'profile_page.dart';
import 'projects_page.dart';

class MainNavigationPage extends StatefulWidget {
  const MainNavigationPage({super.key});

  @override
  State<MainNavigationPage> createState() => _MainNavigationPageState();
}

class _MainNavigationPageState extends State<MainNavigationPage>
    with TickerProviderStateMixin {
  int _currentIndex = 0;
  late final List<AnimationController> _iconControllers;

  final List<Widget> _pages = const [
    DashboardPage(),
    ProjectsPage(),
    BoardPage(),
    ProfilePage(),
  ];

  @override
  void initState() {
    super.initState();
    _iconControllers = List.generate(
      4,
      (_) => AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 200),
      ),
    );
    _iconControllers[0].forward();
    context.read<ProjectBloc>().add(LoadProjectsEvent());
  }

  @override
  void dispose() {
    for (final c in _iconControllers) {
      c.dispose();
    }
    super.dispose();
  }

  void _onTabTap(int index) {
    HapticFeedback.selectionClick();
    _iconControllers[_currentIndex].reverse();
    setState(() => _currentIndex = index);
    _iconControllers[index].forward();
  }

  void _showCompanySwitcher(BuildContext context, String locale) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => CompanySwitcherSheet(locale: locale),
    );
  }

  @override
  Widget build(BuildContext context) {
    final langState = context.watch<LanguageCubit>().state;
    final locale = langState.locale;
    final authState = context.watch<AuthBloc>().state;
    final user = authState is Authenticated ? authState.user : null;

    final Company? company = user != null
        ? AppCompanies.getCompanyForUser(user.email, user.department, user.jobTitle)
        : null;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: AppBottomNavBar(
        currentIndex: _currentIndex,
        locale: locale,
        company: company,
        iconControllers: _iconControllers,
        onTabTap: _onTabTap,
        onCompanyLongPress: () => _showCompanySwitcher(context, locale),
      ),
    );
  }
}
