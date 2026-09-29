import '../entities/issue_entity.dart';

abstract class IIssueRepository {
  Future<List<IssueEntity>> getIssuesByProject(String projectId);
  Future<IssueEntity> getIssueById(String id);
  Future<IssueEntity> createIssue({
    required String title,
    String? description,
    required String type,
    required String priority,
    required String projectId,
    String? sprintId,
    String? assigneeId,
    int? storyPoints,
    DateTime? dueDate,
  });
  Future<void> updateIssueStatus({required String issueId, required String status, required int orderIndex});
}
