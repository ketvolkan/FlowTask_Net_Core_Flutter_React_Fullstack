import '../entities/issue_entity.dart';
import '../repositories/i_issue_repository.dart';

class CreateIssueUseCase {
  final IIssueRepository repository;

  CreateIssueUseCase({required this.repository});

  Future<IssueEntity> call({
    required String title,
    String? description,
    required String type,
    required String priority,
    required String projectId,
    String? sprintId,
    String? assigneeId,
    int? storyPoints,
    DateTime? dueDate,
  }) {
    return repository.createIssue(
      title: title,
      description: description,
      type: type,
      priority: priority,
      projectId: projectId,
      sprintId: sprintId,
      assigneeId: assigneeId,
      storyPoints: storyPoints,
      dueDate: dueDate,
    );
  }
}
