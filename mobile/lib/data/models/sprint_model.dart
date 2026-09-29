import '../../domain/entities/sprint_entity.dart';

class SprintModel extends SprintEntity {
  const SprintModel({
    required super.id,
    required super.name,
    super.goal,
    required super.status,
    super.startDate,
    super.endDate,
    required super.projectId,
    super.totalIssues,
    super.completedIssues,
  });

  factory SprintModel.fromJson(Map<String, dynamic> json) {
    return SprintModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      goal: json['goal'] as String?,
      status: json['status'] as String? ?? 'Planning',
      startDate: json['startDate'] != null ? DateTime.tryParse(json['startDate'] as String) : null,
      endDate: json['endDate'] != null ? DateTime.tryParse(json['endDate'] as String) : null,
      projectId: json['projectId'] as String? ?? '',
      totalIssues: json['totalIssues'] as int? ?? 0,
      completedIssues: json['completedIssues'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'goal': goal,
      'status': status,
      'startDate': startDate?.toIso8601String(),
      'endDate': endDate?.toIso8601String(),
      'projectId': projectId,
      'totalIssues': totalIssues,
      'completedIssues': completedIssues,
    };
  }
}
