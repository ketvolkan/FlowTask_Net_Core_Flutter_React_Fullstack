import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/localization/app_translations.dart';
import '../blocs/language/language_cubit.dart';
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
  final List<String> _columns = ['All', 'Todo', 'InProgress', 'InReview', 'Done'];
  String _searchQuery = '';

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

  String _getColumnTitle(String col, String locale) {
    switch (col) {
      case 'All':
        return AppTranslations.get('status_all', locale: locale);
      case 'Todo':
        return AppTranslations.get('status_todo', locale: locale);
      case 'InProgress':
        return AppTranslations.get('status_inprogress', locale: locale);
      case 'InReview':
        return AppTranslations.get('status_inreview', locale: locale);
      case 'Done':
        return AppTranslations.get('status_done', locale: locale);
      default:
        return col;
    }
  }

  bool _matchesStatus(String issueStatus, String colKey) {
    if (colKey == 'All') return true;
    final s = issueStatus.toLowerCase().replaceAll('_', '').replaceAll(' ', '');
    final c = colKey.toLowerCase();
    if (c == 'todo') return s == 'todo' || s == 'backlog';
    if (c == 'inprogress') return s == 'inprogress';
    if (c == 'inreview') return s == 'inreview';
    if (c == 'done') return s == 'done' || s == 'completed';
    return s == c;
  }

  @override
  Widget build(BuildContext context) {
    final langState = context.watch<LanguageCubit>().state;
    final locale = langState.locale;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: BlocBuilder<ProjectBloc, ProjectState>(
          builder: (context, state) {
            final projectName = state is ProjectsLoaded && state.selectedProject != null
                ? state.selectedProject!.name
                : AppTranslations.get('board_title', locale: locale);
            return Text(
              projectName,
              style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.textPrimary),
            );
          },
        ),
        actions: [
          BlocBuilder<ProjectBloc, ProjectState>(
            builder: (context, state) {
              if (state is ProjectsLoaded && state.selectedProject != null) {
                return IconButton(
                  icon: const Icon(Icons.add, color: AppColors.primary),
                  tooltip: AppTranslations.get('new_task', locale: locale),
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
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: _columns.map((col) => Tab(text: _getColumnTitle(col, locale))).toList(),
        ),
      ),
      body: Column(
        children: [
          // Search bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              decoration: InputDecoration(
                hintText: AppTranslations.get('board_search_placeholder', locale: locale),
                hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textSecondary),
                contentPadding: const EdgeInsets.symmetric(vertical: 8),
                filled: true,
                fillColor: AppColors.background,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: (val) => setState(() => _searchQuery = val.trim().toLowerCase()),
            ),
          ),

          // Issues list
          Expanded(
            child: BlocBuilder<IssueBloc, IssueState>(
              builder: (context, state) {
                if (state is IssueLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (state is IssuesLoaded) {
                  return TabBarView(
                    controller: _tabController,
                    children: _columns.map((columnKey) {
                      final columnIssues = state.issues.where((i) {
                        final matchesCol = _matchesStatus(i.status, columnKey);
                        if (!matchesCol) return false;
                        if (_searchQuery.isNotEmpty) {
                          final matchTitle = i.title.toLowerCase().contains(_searchQuery);
                          final matchKey = i.issueKey.toLowerCase().contains(_searchQuery);
                          return matchTitle || matchKey;
                        }
                        return true;
                      }).toList();

                      if (columnIssues.isEmpty) {
                        return EmptyStateWidget(
                          icon: Icons.check_box_outline_blank,
                          title: AppTranslations.get('no_tasks_title', locale: locale),
                          description: AppTranslations.get('no_tasks_desc', locale: locale),
                        );
                      }

                      return RefreshIndicator(
                        onRefresh: () async {
                          final pState = context.read<ProjectBloc>().state;
                          final pid = pState is ProjectsLoaded ? pState.selectedProject?.id : null;
                          context.read<IssueBloc>().add(
                                LoadIssuesByProjectEvent(projectId: pid ?? ''),
                              );
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

                if (state is IssueError) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Text(state.message, style: const TextStyle(color: AppColors.textSecondary)),
                    ),
                  );
                }

                return const SizedBox.shrink();
              },
            ),
          ),
        ],
      ),
    );
  }
}
