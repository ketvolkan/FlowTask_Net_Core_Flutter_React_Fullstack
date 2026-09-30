import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/enums/issue_status.dart';
import '../../core/localization/app_translations.dart';
import '../../data/datasources/issue_remote_data_source.dart';
import '../../domain/entities/comment_entity.dart';
import '../../domain/entities/issue_entity.dart';
import '../../domain/usecases/add_comment_usecase.dart';
import '../../domain/usecases/get_comments_usecase.dart';
import '../../injection_container.dart';
import '../blocs/issue/issue_bloc.dart';
import '../blocs/issue/issue_event.dart';
import '../blocs/language/language_cubit.dart';
import '../widgets/status_badge.dart';
import '../widgets/type_badge.dart';
import 'issue_detail/widgets/issue_comments_section.dart';
import 'issue_detail/widgets/issue_meta_card.dart';

class IssueDetailPage extends StatefulWidget {
  final IssueEntity issue;

  const IssueDetailPage({super.key, required this.issue});

  @override
  State<IssueDetailPage> createState() => _IssueDetailPageState();
}

class _IssueDetailPageState extends State<IssueDetailPage> {
  late IssueStatus _currentStatus;
  final List<CommentEntity> _comments = [];
  bool _isLoadingComments = false;
  final TextEditingController _commentController = TextEditingController();
  bool _isSendingComment = false;

  @override
  void initState() {
    super.initState();
    _currentStatus = IssueStatus.fromString(widget.issue.status);
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
      if (mounted) setState(() => _comments..clear()..addAll(list));
    } catch (e) {
      debugPrint('[CommentsError] $e');
      if (mounted) setState(() => _comments.clear());
    } finally {
      if (mounted) setState(() => _isLoadingComments = false);
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

  void _onStatusChange(IssueStatus newStatus, String locale) {
    setState(() => _currentStatus = newStatus);
    context.read<IssueBloc>().add(
          UpdateIssueStatusEvent(
            issueId: widget.issue.id,
            newStatus: newStatus.toApiValue(),
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
    final locale = context.watch<LanguageCubit>().state.locale;
    final issue = widget.issue;

    // Available actionable statuses (excluding 'all')
    final selectableStatuses = [
      IssueStatus.todo,
      IssueStatus.inProgress,
      IssueStatus.inReview,
      IssueStatus.done,
    ];

    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: AppBar(
        title: Text(
          issue.issueKey,
          style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline_rounded, color: AppColors.danger),
            tooltip: AppTranslations.get('delete', locale: locale),
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
                TypeBadge(type: issue.type, locale: locale),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<IssueStatus>(
                      key: ValueKey(_currentStatus),
                      value: selectableStatuses.contains(_currentStatus)
                          ? _currentStatus
                          : IssueStatus.todo,
                      isDense: true,
                      dropdownColor: Colors.white,
                      icon: const Icon(Icons.keyboard_arrow_down_rounded, size: 18),
                      items: selectableStatuses.map((s) {
                        return DropdownMenuItem<IssueStatus>(
                          value: s,
                          child: StatusBadge(status: s.toApiValue(), locale: locale),
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
            IssueMetaCard(issue: issue, locale: locale),
            const SizedBox(height: 16),

            // Description Card
            if (issue.description != null && issue.description!.isNotEmpty) ...[
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                elevation: 0.5,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        AppTranslations.get('task_description', locale: locale),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        issue.description!,
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.textPrimary,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Comments Section
            IssueCommentsSection(
              comments: _comments,
              isLoadingComments: _isLoadingComments,
              isSendingComment: _isSendingComment,
              commentController: _commentController,
              locale: locale,
              onAddComment: () => _addComment(locale),
            ),
          ],
        ),
      ),
    );
  }
}
