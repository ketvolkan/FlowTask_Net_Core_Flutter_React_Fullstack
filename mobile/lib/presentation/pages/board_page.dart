import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../blocs/project/project_bloc.dart';
import '../blocs/project/project_state.dart';
import '../blocs/issue/issue_bloc.dart';
import '../blocs/issue/issue_event.dart';
import '../blocs/issue/issue_state.dart';
import '../widgets/issue_card_widget.dart';
import '../widgets/empty_state_widget.dart';
import 'create_issue_page.dart';
import 'issue_detail_page.dart';

class BoardPage extends StatefulWidget {
  const BoardPage({super.key});

  @override
  State<BoardPage> createState() => _BoardPageState();
}

class _BoardPageState extends State<BoardPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<String> _columns = ['Todo', 'InProgress', 'InReview', 'Done'];
  final List<String> _columnTitles = ['To Do', 'In Progress', 'In Review', 'Done'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _columns.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: BlocBuilder<ProjectBloc, ProjectState>(
          builder: (context, state) {
            final projectName = state is ProjectsLoaded && state.selectedProject != null
                ? state.selectedProject!.name
                : 'Active Board';
            return Text(projectName);
          },
        ),
        actions: [
          BlocBuilder<ProjectBloc, ProjectState>(
            builder: (context, state) {
              if (state is ProjectsLoaded && state.selectedProject != null) {
                return IconButton(
                  icon: const Icon(Icons.add),
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => CreateIssuePage(projectId: state.selectedProject!.id),
                      ),
                    );
                  },
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          indicatorWeight: 2.5,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: _columnTitles.map((title) => Tab(text: title)).toList(),
        ),
      ),
      body: BlocBuilder<IssueBloc, IssueState>(
        builder: (context, state) {
          if (state is IssueLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is IssuesLoaded) {
            return TabBarView(
              controller: _tabController,
              children: _columns.map((columnKey) {
                final columnIssues = state.issues
                    .where((i) => i.status.toLowerCase() == columnKey.toLowerCase())
                    .toList();

                if (columnIssues.isEmpty) {
                  return EmptyStateWidget(
                    icon: Icons.check_box_outline_blank,
                    title: 'No issues in this column',
                    description: 'Move or create issues to populate this stage.',
                  );
                }

                return RefreshIndicator(
                  onRefresh: () async {
                    final pState = context.read<ProjectBloc>().state;
                    if (pState is ProjectsLoaded && pState.selectedProject != null) {
                      context.read<IssueBloc>().add(
                            LoadIssuesByProjectEvent(projectId: pState.selectedProject!.id),
                          );
                    }
                  },
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: columnIssues.length,
                    itemBuilder: (context, index) {
                      final issue = columnIssues[index];
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
                  ),
                );
              }).toList(),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }
}
