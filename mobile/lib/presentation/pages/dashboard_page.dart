import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/localization/app_translations.dart';
import '../blocs/auth/auth_bloc.dart';
import '../blocs/auth/auth_state.dart';
import '../blocs/language/language_cubit.dart';
import '../blocs/project/project_bloc.dart';
import '../blocs/project/project_event.dart';
import '../blocs/project/project_state.dart';
import '../blocs/issue/issue_bloc.dart';
import '../blocs/issue/issue_event.dart';
import '../blocs/issue/issue_state.dart';
import '../widgets/issue_card_widget.dart';
import '../widgets/empty_state_widget.dart';
import 'create_issue_page.dart';
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
    context.read<ProjectBloc>().add(LoadProjectsEvent());
    final projectState = context.read<ProjectBloc>().state;
    final projectId = projectState is ProjectsLoaded ? projectState.selectedProject?.id : null;
    context.read<IssueBloc>().add(LoadIssuesByProjectEvent(projectId: projectId ?? ''));
  }

  @override
  Widget build(BuildContext context) {
    final langState = context.watch<LanguageCubit>().state;
    final locale = langState.locale;

    return BlocListener<ProjectBloc, ProjectState>(
      listener: (context, state) {
        if (state is ProjectsLoaded && state.selectedProject != null) {
          context.read<IssueBloc>().add(
                LoadIssuesByProjectEvent(projectId: state.selectedProject!.id),
              );
        }
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          title: BlocBuilder<AuthBloc, AuthState>(
            builder: (context, state) {
              final userName = state is Authenticated ? state.user.fullName : 'User';
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppTranslations.get('dashboard_greeting', locale: locale, params: {'name': userName}),
                    style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                  ),
                  Text(
                    AppTranslations.get('dashboard_subtitle', locale: locale),
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w400),
                  ),
                ],
              );
            },
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh, color: AppColors.textSecondary),
              tooltip: AppTranslations.get('refresh', locale: locale),
              onPressed: _refreshData,
            ),
          ],
        ),
        body: RefreshIndicator(
          onRefresh: () async => _refreshData(),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Project Selector Dropdown Card
                BlocBuilder<ProjectBloc, ProjectState>(
                  builder: (context, projState) {
                    if (projState is ProjectsLoaded && projState.projects.isNotEmpty) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.divider),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.folder_open, size: 20, color: AppColors.primary),
                            const SizedBox(width: 10),
                            Expanded(
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  value: projState.selectedProject?.id,
                                  isExpanded: true,
                                  icon: const Icon(Icons.arrow_drop_down, color: AppColors.textSecondary),
                                  hint: Text(
                                    AppTranslations.get('select_project', locale: locale),
                                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                                  ),
                                  items: projState.projects.map((p) {
                                    return DropdownMenuItem<String>(
                                      value: p.id,
                                      child: Text(
                                        '${p.key} - ${p.name}',
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.textPrimary,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    );
                                  }).toList(),
                                  onChanged: (val) {
                                    if (val != null) {
                                      context.read<ProjectBloc>().add(SelectProjectEvent(projectId: val));
                                      context.read<IssueBloc>().add(LoadIssuesByProjectEvent(projectId: val));
                                    }
                                  },
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }
                    return const SizedBox.shrink();
                  },
                ),

                // Metrics row
                BlocBuilder<IssueBloc, IssueState>(
                  builder: (context, issueState) {
                    int total = 0;
                    int inProgress = 0;
                    int done = 0;

                    if (issueState is IssuesLoaded) {
                      total = issueState.issues.length;
                      inProgress = issueState.issues
                          .where((i) =>
                              i.status.toLowerCase() == 'inprogress' ||
                              i.status.toLowerCase() == 'in_progress' ||
                              i.status.toLowerCase() == 'in progress')
                          .length;
                      done = issueState.issues
                          .where((i) =>
                              i.status.toLowerCase() == 'done' ||
                              i.status.toLowerCase() == 'completed')
                          .length;
                    }

                    return Row(
                      children: [
                        _buildMetricCard(
                          AppTranslations.get('total_tasks', locale: locale),
                          total.toString(),
                          Icons.assignment_outlined,
                          AppColors.primary,
                        ),
                        const SizedBox(width: 8),
                        _buildMetricCard(
                          AppTranslations.get('in_progress_tasks', locale: locale),
                          inProgress.toString(),
                          Icons.timelapse,
                          AppColors.info,
                        ),
                        const SizedBox(width: 8),
                        _buildMetricCard(
                          AppTranslations.get('completed_tasks', locale: locale),
                          done.toString(),
                          Icons.check_circle_outline,
                          AppColors.success,
                        ),
                      ],
                    );
                  },
                ),
                const SizedBox(height: 24),

                // Recent Issues Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      AppTranslations.get('recent_tasks', locale: locale),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    BlocBuilder<ProjectBloc, ProjectState>(
                      builder: (context, state) {
                        if (state is ProjectsLoaded && state.selectedProject != null) {
                          return TextButton.icon(
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => CreateIssuePage(projectId: state.selectedProject!.id),
                                ),
                              );
                            },
                            icon: const Icon(Icons.add, size: 16),
                            label: Text(AppTranslations.get('new_task', locale: locale)),
                          );
                        }
                        return const SizedBox.shrink();
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Issues List
                BlocBuilder<IssueBloc, IssueState>(
                  builder: (context, state) {
                    if (state is IssueLoading) {
                      return const Center(
                        child: Padding(
                          padding: EdgeInsets.all(32),
                          child: CircularProgressIndicator(),
                        ),
                      );
                    }

                    if (state is IssuesLoaded) {
                      if (state.issues.isEmpty) {
                        return EmptyStateWidget(
                          icon: Icons.assignment_turned_in_outlined,
                          title: AppTranslations.get('no_tasks_title', locale: locale),
                          description: AppTranslations.get('no_tasks_desc', locale: locale),
                        );
                      }

                      return ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: state.issues.length,
                        itemBuilder: (context, index) {
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
                      );
                    }

                    if (state is IssueError) {
                      return Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            children: [
                              const Icon(Icons.error_outline, color: AppColors.danger, size: 36),
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
                      );
                    }

                    return const SizedBox.shrink();
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.divider),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
