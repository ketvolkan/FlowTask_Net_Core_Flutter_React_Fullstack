import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/localization/app_translations.dart';
import '../../core/utils/date_formatter.dart';
import '../../domain/entities/issue_entity.dart';
import '../../domain/entities/comment_entity.dart';
import '../../domain/usecases/get_comments_usecase.dart';
import '../../domain/usecases/add_comment_usecase.dart';
import '../../data/datasources/issue_remote_data_source.dart';
import '../../injection_container.dart';
import '../blocs/language/language_cubit.dart';
import '../blocs/issue/issue_bloc.dart';
import '../blocs/issue/issue_event.dart';
import '../widgets/status_badge.dart';
import '../widgets/priority_badge.dart';
import '../widgets/type_badge.dart';

class IssueDetailPage extends StatefulWidget {
  final IssueEntity issue;

  const IssueDetailPage({super.key, required this.issue});

  @override
  State<IssueDetailPage> createState() => _IssueDetailPageState();
}

class _IssueDetailPageState extends State<IssueDetailPage> {
  late String _currentStatus;
  final List<String> _statuses = ['Todo', 'InProgress', 'InReview', 'Done'];

  final List<CommentEntity> _comments = [];
  bool _isLoadingComments = false;
  final TextEditingController _commentController = TextEditingController();
  bool _isSendingComment = false;

  @override
  void initState() {
    super.initState();
    _currentStatus = widget.issue.status;
    _loadComments();
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _loadComments() async {
    setState(() => _isLoadingComments = true);
    try {
      final getComments = sl<GetCommentsUseCase>();
      final list = await getComments(widget.issue.id);
      setState(() => _comments..clear()..addAll(list));
    } catch (_) {
      // Ignored if comments endpoint fails
    } finally {
      setState(() => _isLoadingComments = false);
    }
  }

  Future<void> _addComment(String locale) async {
    final text = _commentController.text.trim();
    if (text.isEmpty) return;

    setState(() => _isSendingComment = true);
    try {
      final addComment = sl<AddCommentUseCase>();
      final newComment = await addComment(issueId: widget.issue.id, content: text);
      if (!mounted) return;
      setState(() {
        _comments.insert(0, newComment);
        _commentController.clear();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppTranslations.get('comment_added', locale: locale)),
          duration: const Duration(seconds: 2),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(locale == 'tr' ? 'Yorum gönderilemedi.' : 'Failed to send comment.'),
          backgroundColor: AppColors.danger,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isSendingComment = false);
      }
    }
  }

  void _onStatusChange(String newStatus, String locale) {
    setState(() => _currentStatus = newStatus);
    context.read<IssueBloc>().add(
          UpdateIssueStatusEvent(
            issueId: widget.issue.id,
            newStatus: newStatus,
            newOrder: widget.issue.orderIndex,
          ),
        );
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(AppTranslations.get('status_updated_success', locale: locale)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  Future<void> _deleteIssue(String locale) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(AppTranslations.get('delete_task', locale: locale)),
        content: Text(AppTranslations.get('delete_task_confirm', locale: locale)),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(AppTranslations.get('cancel', locale: locale)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text(AppTranslations.get('delete', locale: locale), style: const TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final issueDataSource = sl<IssueRemoteDataSource>();
        await issueDataSource.deleteIssue(widget.issue.id);
        if (!mounted) return;
        context.read<IssueBloc>().add(LoadIssuesByProjectEvent(projectId: widget.issue.projectId));
        Navigator.of(context).pop();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(locale == 'tr' ? 'Görev silinemedi.' : 'Failed to delete task.')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final issue = widget.issue;
    final langState = context.watch<LanguageCubit>().state;
    final locale = langState.locale;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          issue.issueKey.isNotEmpty ? issue.issueKey : AppTranslations.get('task_detail_title', locale: locale),
          style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.textPrimary),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline, color: AppColors.danger),
            tooltip: AppTranslations.get('delete_task', locale: locale),
            onPressed: () => _deleteIssue(locale),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status & Type row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TypeBadge(type: issue.type),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _statuses.contains(_currentStatus) ? _currentStatus : _statuses.first,
                      isDense: true,
                      items: _statuses.map((s) {
                        return DropdownMenuItem(
                          value: s,
                          child: StatusBadge(status: s),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) _onStatusChange(val, locale);
                      },
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Title
            Text(
              issue.title,
              style: const TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 16),

            // Details Card
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              elevation: 0.5,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      AppTranslations.get('task_detail_title', locale: locale),
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                    ),
                    const Divider(height: 20),
                    _buildDetailRow(
                      AppTranslations.get('task_priority', locale: locale),
                      PriorityBadge(priority: issue.priority),
                    ),
                    const SizedBox(height: 10),
                    _buildDetailRow(
                      AppTranslations.get('assignee', locale: locale),
                      Text(
                        issue.assigneeName ?? AppTranslations.get('unassigned', locale: locale),
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                    ),
                    const SizedBox(height: 10),
                    _buildDetailRow(
                      AppTranslations.get('reporter', locale: locale),
                      Text(
                        issue.reporterName ?? 'Flowtask User',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                      ),
                    ),
                    const SizedBox(height: 10),
                    _buildDetailRow(
                      AppTranslations.get('task_story_points', locale: locale),
                      Text(
                        issue.storyPoints != null ? '${issue.storyPoints} pts' : '-',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                    ),
                    const SizedBox(height: 10),
                    _buildDetailRow(
                      locale == 'tr' ? 'Oluşturulma' : 'Created',
                      Text(
                        DateFormatter.formatShort(issue.createdAt),
                        style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Description Card
            if (issue.description != null && issue.description!.isNotEmpty) ...[
              Text(
                AppTranslations.get('task_description', locale: locale),
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Text(
                  issue.description!,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textPrimary,
                    height: 1.5,
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Comments Section
            Text(
              AppTranslations.get('comments', locale: locale),
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 10),

            // Add Comment Input Box
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.divider),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _commentController,
                      decoration: InputDecoration(
                        hintText: AppTranslations.get('add_comment', locale: locale),
                        hintStyle: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                        border: InputBorder.none,
                        isDense: true,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: _isSendingComment
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.send, color: AppColors.primary, size: 20),
                    onPressed: _isSendingComment ? null : () => _addComment(locale),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Comments List
            if (_isLoadingComments)
              const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()))
            else if (_comments.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Text(
                  AppTranslations.get('no_comments', locale: locale),
                  style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _comments.length,
                itemBuilder: (context, index) {
                  final c = _comments[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              c.userFullName.isNotEmpty ? c.userFullName : 'Ekip Üyesi',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                            ),
                            Text(
                              DateFormatter.formatShort(c.createdAt),
                              style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          c.content,
                          style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, Widget value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        value,
      ],
    );
  }
}
