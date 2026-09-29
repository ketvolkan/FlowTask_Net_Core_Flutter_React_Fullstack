import 'package:equatable/equatable.dart';

class IssueEntity extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String issueKey;
  final String status;
  final String priority;
  final String type;
  final String projectId;
  final String? projectName;
  final String? sprintId;
  final String? sprintName;
  final String? assigneeId;
  final String? assigneeName;
  final String? assigneeAvatar;
  final String reporterId;
  final String? reporterName;
  final int? storyPoints;
  final DateTime? dueDate;
  final int orderIndex;
  final DateTime createdAt;

  const IssueEntity({
    required this.id,
    required this.title,
    this.description,
    required this.issueKey,
    required this.status,
    required this.priority,
    required this.type,
    required this.projectId,
    this.projectName,
    this.sprintId,
    this.sprintName,
    this.assigneeId,
    this.assigneeName,
    this.assigneeAvatar,
    required this.reporterId,
    this.reporterName,
    this.storyPoints,
    this.dueDate,
    this.orderIndex = 0,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        issueKey,
        status,
        priority,
        type,
        projectId,
        projectName,
        sprintId,
        sprintName,
        assigneeId,
        assigneeName,
        assigneeAvatar,
        reporterId,
        reporterName,
        storyPoints,
        dueDate,
        orderIndex,
        createdAt,
      ];
}
