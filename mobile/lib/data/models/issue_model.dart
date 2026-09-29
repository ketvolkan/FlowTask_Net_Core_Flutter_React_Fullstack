import '../../domain/entities/issue_entity.dart';

class IssueModel extends IssueEntity {
  const IssueModel({
    required super.id,
    required super.title,
    super.description,
    required super.issueKey,
    required super.status,
    required super.priority,
    required super.type,
    required super.projectId,
    super.projectName,
    super.sprintId,
    super.sprintName,
    super.assigneeId,
    super.assigneeName,
    super.assigneeAvatar,
    required super.reporterId,
    super.reporterName,
    super.storyPoints,
    super.dueDate,
    super.orderIndex,
    required super.createdAt,
  });

  factory IssueModel.fromJson(Map<String, dynamic> json) {
    return IssueModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      issueKey: json['issueKey'] as String? ?? '',
      status: json['status'] as String? ?? 'Todo',
      priority: json['priority'] as String? ?? 'Medium',
      type: json['type'] as String? ?? 'Task',
      projectId: json['projectId'] as String? ?? '',
      projectName: json['projectName'] as String?,
      sprintId: json['sprintId'] as String?,
      sprintName: json['sprintName'] as String?,
      assigneeId: json['assigneeId'] as String?,
      assigneeName: json['assigneeName'] as String?,
      assigneeAvatar: json['assigneeAvatar'] as String?,
      reporterId: json['reporterId'] as String? ?? '',
      reporterName: json['reporterName'] as String?,
      storyPoints: json['storyPoints'] as int?,
      dueDate: json['dueDate'] != null ? DateTime.tryParse(json['dueDate'] as String) : null,
      orderIndex: json['orderIndex'] as int? ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'issueKey': issueKey,
      'status': status,
      'priority': priority,
      'type': type,
      'projectId': projectId,
      'sprintId': sprintId,
      'assigneeId': assigneeId,
      'storyPoints': storyPoints,
      'dueDate': dueDate?.toIso8601String(),
      'orderIndex': orderIndex,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
