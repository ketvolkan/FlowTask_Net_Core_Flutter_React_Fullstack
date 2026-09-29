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
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      issueKey: (json['key'] ?? json['issueKey'] ?? '')?.toString() ?? '',
      status: json['status']?.toString() ?? 'Todo',
      priority: json['priority']?.toString() ?? 'Medium',
      type: json['type']?.toString() ?? 'Task',
      projectId: json['projectId']?.toString() ?? '',
      projectName: json['projectName']?.toString(),
      sprintId: json['sprintId']?.toString(),
      sprintName: json['sprintName']?.toString(),
      assigneeId: json['assigneeId']?.toString(),
      assigneeName: json['assigneeName']?.toString(),
      assigneeAvatar: (json['assigneeAvatarUrl'] ?? json['assigneeAvatar'])?.toString(),
      reporterId: json['reporterId']?.toString() ?? '',
      reporterName: json['reporterName']?.toString(),
      storyPoints: json['storyPoints'] is num ? (json['storyPoints'] as num).toInt() : null,
      dueDate: json['dueDate'] != null ? DateTime.tryParse(json['dueDate'].toString()) : null,
      orderIndex: json['order'] is num
          ? (json['order'] as num).toInt()
          : (json['orderIndex'] is num ? (json['orderIndex'] as num).toInt() : 0),
      createdAt: json['createdAt'] != null
          ? (DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'key': issueKey,
      'issueKey': issueKey,
      'status': status,
      'priority': priority,
      'type': type,
      'projectId': projectId,
      'projectName': projectName,
      'sprintId': sprintId,
      'assigneeId': assigneeId,
      'storyPoints': storyPoints,
      'dueDate': dueDate?.toIso8601String(),
      'order': orderIndex,
      'orderIndex': orderIndex,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
