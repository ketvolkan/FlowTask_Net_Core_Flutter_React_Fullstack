import 'package:equatable/equatable.dart';

abstract class SprintEvent extends Equatable {
  const SprintEvent();

  @override
  List<Object?> get props => [];
}

class LoadSprintsByProjectEvent extends SprintEvent {
  final String projectId;

  const LoadSprintsByProjectEvent({required this.projectId});

  @override
  List<Object?> get props => [projectId];
}

class CreateSprintSubmittedEvent extends SprintEvent {
  final String name;
  final String? goal;
  final String projectId;
  final DateTime? startDate;
  final DateTime? endDate;

  const CreateSprintSubmittedEvent({
    required this.name,
    this.goal,
    required this.projectId,
    this.startDate,
    this.endDate,
  });

  @override
  List<Object?> get props => [name, goal, projectId, startDate, endDate];
}
