import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/theme/app_theme.dart';
import 'injection_container.dart' as di;
import 'presentation/blocs/auth/auth_bloc.dart';
import 'presentation/blocs/project/project_bloc.dart';
import 'presentation/blocs/issue/issue_bloc.dart';
import 'presentation/blocs/sprint/sprint_bloc.dart';
import 'presentation/blocs/language/language_cubit.dart';
import 'presentation/pages/splash_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await di.init();
  runApp(const FlowTaskApp());
}

class FlowTaskApp extends StatelessWidget {
  const FlowTaskApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<LanguageCubit>(create: (_) => di.sl<LanguageCubit>()),
        BlocProvider<AuthBloc>(create: (_) => di.sl<AuthBloc>()),
        BlocProvider<ProjectBloc>(create: (_) => di.sl<ProjectBloc>()),
        BlocProvider<IssueBloc>(create: (_) => di.sl<IssueBloc>()),
        BlocProvider<SprintBloc>(create: (_) => di.sl<SprintBloc>()),
      ],
      child: BlocBuilder<LanguageCubit, LanguageState>(
        builder: (context, langState) {
          return MaterialApp(
            title: 'Flowtask',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            themeMode: ThemeMode.light,
            home: const SplashPage(),
          );
        },
      ),
    );
  }
}
