import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/date_formatter.dart';
import '../../domain/entities/issue_entity.dart';
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

  @override
  void initState() {
    super.initState();
    _currentStatus = widget.issue.status;
  }

  void _onStatusChange(String newStatus) {
    setState(() => _currentStatus = newStatus);
    context.read<IssueBloc>().add(
          UpdateIssueStatusEvent(
            issueId: widget.issue.id,
            newStatus: newStatus,
            newOrder: widget.issue.orderIndex,
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    final issue = widget.issue;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(issue.issueKey),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TypeBadge(type: issue.type),
                DropdownButton<String>(
                  value: _statuses.contains(_currentStatus) ? _currentStatus : _statuses.first,
                  underline: const SizedBox.shrink(),
                  items: _statuses.map((s) {
                    return DropdownMenuItem(
                      value: s,
                      child: StatusBadge(status: s),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) _onStatusChange(val);
                  },
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              issue.title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Details',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                    ),
                    const Divider(height: 20),
                    _buildDetailRow('Priority', PriorityBadge(priority: issue.priority)),
                    const SizedBox(height: 10),
                    _buildDetailRow(
                      'Assignee',
                      Text(
                        issue.assigneeName ?? 'Unassigned',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                      ),
                    ),
                    const SizedBox(height: 10),
                    _buildDetailRow(
                      'Reporter',
                      Text(
                        issue.reporterName ?? 'Workspace User',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                      ),
                    ),
                    const SizedBox(height: 10),
                    _buildDetailRow(
                      'Story Points',
                      Text(
                        issue.storyPoints != null ? '${issue.storyPoints} pts' : 'None',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                      ),
                    ),
                    const SizedBox(height: 10),
                    _buildDetailRow(
                      'Created',
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
            if (issue.description != null && issue.description!.isNotEmpty) ...[
              const Text(
                'Description',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
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
            ],
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
