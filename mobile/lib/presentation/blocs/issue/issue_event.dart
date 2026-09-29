import 'package:equatable/equatable.dart';

abstract class IssueEvent extends Equatable {
  const IssueEvent();

  @override
  List<Object?> get props => [];
}

class LoadIssuesByProjectEvent extends IssueEvent {
  final String projectId;

  const LoadIssuesByProjectEvent({required this.projectId});

  @override
  List<Object?> get props => [projectId];
}

class CreateIssueSubmittedEvent extends IssueEvent {
  final String title;
  final String? description;
  final String type;
  final String priority;
  final String projectId;
  final String? sprintId;
  final String? assigneeId;
  final int? storyPoints;
  final DateTime? dueDate;

  const CreateIssueSubmittedEvent({
    required this.title,
    this.description,
    required this.type,
    required this.priority,
    required this.projectId,
    this.sprintId,
    this.assigneeId,
    this.storyPoints,
    this.dueDate,
  });

  @override
  List<Object?> get props => [
        title,
        description,
        type,
        priority,
        projectId,
        sprintId,
        assigneeId,
        storyPoints,
        dueDate,
      ];
}

class UpdateIssueStatusEvent extends IssueEvent {
  final String issueId;
  final String newStatus;
  final int newOrder;

  const UpdateIssueStatusEvent({
    required this.issueId,
    required this.newStatus,
    required this.newOrder,
  });

  @override
  List<Object?> get props => [issueId, newStatus, newOrder];
}
