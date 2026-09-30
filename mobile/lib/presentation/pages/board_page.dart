import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/enums/issue_priority.dart';
import '../../core/enums/issue_status.dart';
import '../../core/localization/app_translations.dart';
import '../../domain/entities/issue_entity.dart';
import '../blocs/issue/issue_bloc.dart';
import '../blocs/issue/issue_event.dart';
import '../blocs/issue/issue_state.dart';
import '../blocs/language/language_cubit.dart';
import '../blocs/project/project_bloc.dart';
import '../blocs/project/project_state.dart';
import 'board/widgets/board_issue_list.dart';
import 'board/widgets/board_project_selector.dart';
import 'board/widgets/board_search_priority_bar.dart';
import 'board/widgets/board_status_grid.dart';
import 'create_issue_page.dart';

class BoardPage extends StatefulWidget {
  const BoardPage({super.key});

  @override
  State<BoardPage> createState() => _BoardPageState();
}

class _BoardPageState extends State<BoardPage> {
  IssueStatus _selectedStatus = IssueStatus.all;
  IssuePriority _selectedPriority = IssuePriority.all;
  String _searchQuery = '';

  List<IssueEntity> _filterIssues(List<IssueEntity> issues) {
    return issues.where((i) {
      if (!_selectedStatus.matches(i.status)) return false;
      if (!_selectedPriority.matches(i.priority)) return false;
      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        final matchTitle = i.title.toLowerCase().contains(query);
        final matchKey = i.issueKey.toLowerCase().contains(query);
        final matchAssignee = (i.assigneeName ?? '').toLowerCase().contains(query);
        return matchTitle || matchKey || matchAssignee;
      }
      return true;
    }).toList();
  }

  void _onRefresh() {
    final pState = context.read<ProjectBloc>().state;
    final pid = pState is ProjectsLoaded ? (pState.selectedProject?.id ?? 'all') : 'all';
    context.read<IssueBloc>().add(LoadIssuesByProjectEvent(projectId: pid));
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
        appBar: _buildAppBar(locale),
        body: Column(
          children: [
            // Project Selector
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

            // Content & Filter Grid
            Expanded(
              child: BlocBuilder<IssueBloc, IssueState>(
                builder: (context, issueState) {
                  final allIssues = issueState is IssuesLoaded ? issueState.issues : <IssueEntity>[];
                  final filtered = _filterIssues(allIssues);

                  return RefreshIndicator(
                    color: AppColors.primary,
                    onRefresh: () async => _onRefresh(),
                    child: CustomScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      slivers: [
                        // Status 3x2 Grid
                        SliverToBoxAdapter(
                          child: BoardStatusGrid(
                            selected: _selectedStatus,
                            locale: locale,
                            issues: allIssues,
                            onSelect: (status) => setState(() => _selectedStatus = status),
                          ),
                        ),

                        // Search & Priority Filter Bar
                        SliverToBoxAdapter(
                          child: BoardSearchPriorityBar(
                            locale: locale,
                            searchQuery: _searchQuery,
                            selectedPriority: _selectedPriority,
                            onSearch: (v) => setState(() => _searchQuery = v),
                            onPrioritySelect: (p) => setState(() => _selectedPriority = p),
                          ),
                        ),

                        // Issues List or State Views
                        if (issueState is IssueLoading)
                          const SliverFillRemaining(
                            child: Center(child: CircularProgressIndicator()),
                          )
                        else if (issueState is IssueError)
                          SliverFillRemaining(
                            child: _buildErrorView(issueState.message, locale),
                          )
                        else if (issueState is IssuesLoaded) ...[
                          SliverPadding(
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
                            sliver: SliverToBoxAdapter(
                              child: BoardIssueSectionHeader(
                                filteredIssues: filtered,
                                selectedStatus: _selectedStatus,
                                locale: locale,
                              ),
                            ),
                          ),
                          SliverPadding(
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                            sliver: BoardIssueList(
                              filteredIssues: filtered,
                              locale: locale,
                            ),
                          ),
                        ] else
                          SliverFillRemaining(
                            child: Center(
                              child: Text(
                                AppTranslations.get('select_project', locale: locale),
                                style: const TextStyle(color: AppColors.textMuted),
                              ),
                            ),
                          ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(String locale) {
    return AppBar(
      backgroundColor: AppColors.primary,
      elevation: 0,
      systemOverlayStyle: SystemUiOverlayStyle.light.copyWith(
        statusBarColor: Colors.transparent,
      ),
      title: BlocBuilder<ProjectBloc, ProjectState>(
        builder: (context, state) {
          if (state is ProjectsLoaded && state.selectedProject != null) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  AppTranslations.get('board_title', locale: locale).toUpperCase(),
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: Colors.white70,
                    letterSpacing: 1.2,
                  ),
                ),
                Text(
                  state.selectedProject!.name,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    letterSpacing: -0.2,
                  ),
                ),
              ],
            );
          }
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                AppTranslations.get('board_title', locale: locale).toUpperCase(),
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: Colors.white70,
                  letterSpacing: 1.2,
                ),
              ),
              Text(
                AppTranslations.get('all_projects', locale: locale),
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: -0.2,
                ),
              ),
            ],
          );
        },
      ),
      actions: [
        BlocBuilder<ProjectBloc, ProjectState>(
          builder: (context, state) {
            if (state is ProjectsLoaded && state.projects.isNotEmpty) {
              final targetProjectId = state.selectedProject?.id ?? state.projects.first.id;
              return Container(
                margin: const EdgeInsets.only(right: 12),
                child: TextButton.icon(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => CreateIssuePage(projectId: targetProjectId),
                      ),
                    );
                  },
                  icon: const Icon(Icons.add_rounded, size: 18, color: AppColors.primary),
                  label: Text(
                    locale == 'tr' ? 'Görev' : 'Task',
                    style: const TextStyle(fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.w700),
                  ),
                  style: TextButton.styleFrom(
                    backgroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              );
            }
            return const SizedBox.shrink();
          },
        ),
      ],
    );
  }

  Widget _buildErrorView(String message, String locale) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded, color: AppColors.danger, size: 40),
            const SizedBox(height: 12),
            Text(
              message,
              style: const TextStyle(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              icon: const Icon(Icons.refresh_rounded, size: 16),
              label: Text(AppTranslations.get('refresh', locale: locale)),
              onPressed: _onRefresh,
            ),
          ],
        ),
      ),
    );
  }
}
