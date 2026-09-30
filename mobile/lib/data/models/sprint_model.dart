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
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      goal: json['goal']?.toString(),
      status: json['status']?.toString() ?? 'Planning',
      startDate: json['startDate'] != null ? DateTime.tryParse(json['startDate'].toString()) : null,
      endDate: json['endDate'] != null ? DateTime.tryParse(json['endDate'].toString()) : null,
      projectId: json['projectId']?.toString() ?? '',
      totalIssues: json['totalIssues'] is num ? (json['totalIssues'] as num).toInt() : 0,
      completedIssues: json['completedIssues'] is num ? (json['completedIssues'] as num).toInt() : 0,
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
