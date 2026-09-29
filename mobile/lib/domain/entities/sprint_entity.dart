import 'package:equatable/equatable.dart';

class SprintEntity extends Equatable {
  final String id;
  final String name;
  final String? goal;
  final String status;
  final DateTime? startDate;
  final DateTime? endDate;
  final String projectId;
  final int totalIssues;
  final int completedIssues;

  const SprintEntity({
    required this.id,
    required this.name,
    this.goal,
    required this.status,
    this.startDate,
    this.endDate,
    required this.projectId,
    this.totalIssues = 0,
    this.completedIssues = 0,
  });

  @override
  List<Object?> get props => [
        id,
        name,
        goal,
        status,
        startDate,
        endDate,
        projectId,
        totalIssues,
        completedIssues,
      ];
}
