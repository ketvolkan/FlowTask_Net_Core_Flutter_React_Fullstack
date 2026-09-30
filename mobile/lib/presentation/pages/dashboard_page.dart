import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/localization/app_translations.dart';
import '../blocs/issue/issue_bloc.dart';
import '../blocs/issue/issue_event.dart';
import '../blocs/issue/issue_state.dart';
import '../blocs/language/language_cubit.dart';
import '../blocs/project/project_bloc.dart';
import '../blocs/project/project_event.dart';
import '../blocs/project/project_state.dart';
import '../widgets/empty_state_widget.dart';
import '../widgets/issue_card_widget.dart';
import 'board/widgets/board_project_selector.dart';
import 'create_issue_page.dart';
import 'dashboard/widgets/dashboard_app_bar.dart';
import 'dashboard/widgets/dashboard_progress_header.dart';
import 'dashboard/widgets/dashboard_quick_stats_grid.dart';
import 'issue_detail_page.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  @override
  void initState() {
    super.initState();
    _refreshData();
  }

  void _refreshData() {
    final pState = context.read<ProjectBloc>().state;
    if (pState is! ProjectsLoaded) {
      context.read<ProjectBloc>().add(LoadProjectsEvent());
    } else {
      final pid = pState.selectedProject?.id ?? 'all';
      context.read<IssueBloc>().add(LoadIssuesByProjectEvent(projectId: pid));
    }
  }

  @override
  Widget build(BuildContext context) {
    final locale = context.watch<LanguageCubit>().state.locale;

    return BlocListener<ProjectBloc, ProjectState>(
      listener: (context, state) {
        if (state is ProjectsLoaded) {
          final pid = state.selectedProject?.id ?? 'all';
          context.read<IssueBloc>().add(
                LoadIssuesByProjectEvent(projectId: pid),
              );
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.pageBackground,
        appBar: DashboardAppBar(
          locale: locale,
          onRefresh: _refreshData,
        ),
        body: Column(
          children: [
            // Project Selector (Identical to Board Page)
            BlocBuilder<ProjectBloc, ProjectState>(
              builder: (context, projState) {
                if (projState is ProjectsLoaded && projState.projects.isNotEmpty) {
                  return BoardProjectSelector(
                    projState: projState,
                    locale: locale,
                  );
                }
                return const SizedBox.shrink();
              },
            ),

            // Scrollable Dashboard Content
            Expanded(
              child: RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async => _refreshData(),
                child: BlocBuilder<IssueBloc, IssueState>(
                  builder: (context, issueState) {
                    final issues = issueState is IssuesLoaded ? issueState.issues : const [];

                    return CustomScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      slivers: [
                        // Progress Header Banner
                        SliverToBoxAdapter(
                          child: DashboardProgressHeader(
                            issues: issues.cast(),
                            locale: locale,
                          ),
                        ),

                        // Quick Stats Grid
                        SliverToBoxAdapter(
                          child: DashboardQuickStatsGrid(
                            issues: issues.cast(),
                            locale: locale,
                          ),
                        ),

                        // Recent Tasks Header
                        SliverToBoxAdapter(
                          child: _buildRecentHeader(locale),
                        ),

                        // Tasks List
                        SliverPadding(
                          padding: const EdgeInsets.fromLTRB(16, 4, 16, 32),
                          sliver: _buildIssueList(issueState, locale),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentHeader(String locale) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            AppTranslations.get('recent_tasks', locale: locale),
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
              letterSpacing: -0.2,
            ),
          ),
          BlocBuilder<ProjectBloc, ProjectState>(
            builder: (context, state) {
              if (state is ProjectsLoaded && state.selectedProject != null) {
                return GestureDetector(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => CreateIssuePage(projectId: state.selectedProject!.id),
                      ),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppColors.primaryLight,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.add_rounded, size: 14, color: AppColors.primary),
                        const SizedBox(width: 3),
                        Text(
                          AppTranslations.get('new_task', locale: locale),
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildIssueList(IssueState state, String locale) {
    if (state is IssueLoading) {
      return const SliverToBoxAdapter(
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(32),
            child: CircularProgressIndicator(),
          ),
        ),
      );
    }

    if (state is IssuesLoaded) {
      if (state.issues.isEmpty) {
        return SliverToBoxAdapter(
          child: EmptyStateWidget(
            icon: Icons.assignment_turned_in_outlined,
            title: AppTranslations.get('no_tasks_title', locale: locale),
            description: AppTranslations.get('no_tasks_desc', locale: locale),
          ),
        );
      }

      return SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) {
            final issue = state.issues[index];
            return IssueCardWidget(
              issue: issue,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => IssueDetailPage(issue: issue),
                  ),
                );
              },
            );
          },
          childCount: state.issues.length,
        ),
      );
    }

    if (state is IssueError) {
      return SliverToBoxAdapter(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                const Icon(Icons.error_outline_rounded, color: AppColors.danger, size: 36),
                const SizedBox(height: 8),
                Text(state.message, style: const TextStyle(color: AppColors.textSecondary)),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: _refreshData,
                  child: Text(AppTranslations.get('refresh', locale: locale)),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return const SliverToBoxAdapter(child: SizedBox.shrink());
  }
}
