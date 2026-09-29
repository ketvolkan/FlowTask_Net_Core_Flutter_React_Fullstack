import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../blocs/auth/auth_bloc.dart';
import '../blocs/auth/auth_state.dart';
import '../blocs/project/project_bloc.dart';
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
    final projectState = context.read<ProjectBloc>().state;
    if (projectState is ProjectsLoaded && projectState.selectedProject != null) {
      context.read<IssueBloc>().add(
            LoadIssuesByProjectEvent(projectId: projectState.selectedProject!.id),
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, state) {
            final userName = state is Authenticated ? state.user.fullName : 'User';
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hello, $userName 👋',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                ),
                const Text(
                  'Here is your workspace overview',
                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w400),
                ),
              ],
            );
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_none_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          final projectState = context.read<ProjectBloc>().state;
          if (projectState is ProjectsLoaded && projectState.selectedProject != null) {
            context.read<IssueBloc>().add(
                  LoadIssuesByProjectEvent(projectId: projectState.selectedProject!.id),
                );
          }
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Metric cards row
              BlocBuilder<IssueBloc, IssueState>(
                builder: (context, issueState) {
                  int total = 0;
                  int inProgress = 0;
                  int done = 0;

                  if (issueState is IssuesLoaded) {
                    total = issueState.issues.length;
                    inProgress = issueState.issues.where((i) => i.status.toLowerCase() == 'inprogress' || i.status.toLowerCase() == 'in_progress').length;
                    done = issueState.issues.where((i) => i.status.toLowerCase() == 'done' || i.status.toLowerCase() == 'completed').length;
                  }

                  return Row(
                    children: [
                      _buildMetricCard('Total Tasks', total.toString(), Icons.assignment_outlined, AppColors.primary),
                      const SizedBox(width: 10),
                      _buildMetricCard('In Progress', inProgress.toString(), Icons.timelapse, AppColors.info),
                      const SizedBox(width: 10),
                      _buildMetricCard('Completed', done.toString(), Icons.check_circle_outline, AppColors.success),
                    ],
                  );
                },
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Recent Issues',
                    style: TextStyle(
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
                          label: const Text('New Issue'),
                        );
                      }
                      return const SizedBox.shrink();
                    },
                  ),
                ],
              ),
              const SizedBox(height: 8),
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
                      return const EmptyStateWidget(
                        icon: Icons.assignment_turned_in_outlined,
                        title: 'No issues yet',
                        description: 'Create your first issue to track tasks with your team.',
                      );
                    }

                    return ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: state.issues.take(5).length,
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

                  return const SizedBox.shrink();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.divider),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(height: 10),
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
            ),
          ],
        ),
      ),
    );
  }
}
