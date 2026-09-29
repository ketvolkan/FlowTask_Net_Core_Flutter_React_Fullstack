import '../../domain/entities/issue_entity.dart';
import '../../domain/repositories/i_issue_repository.dart';
import '../datasources/issue_remote_data_source.dart';

class IssueRepositoryImpl implements IIssueRepository {
  final IssueRemoteDataSource remoteDataSource;

  IssueRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<IssueEntity>> getIssuesByProject(String projectId) async {
    return await remoteDataSource.getIssuesByProject(projectId);
  }

  @override
  Future<IssueEntity> getIssueById(String id) async {
    return await remoteDataSource.getIssueById(id);
  }

  @override
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
  }) async {
    return await remoteDataSource.createIssue(
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

  @override
  Future<void> updateIssueStatus({
    required String issueId,
    required String status,
    required int orderIndex,
  }) async {
    await remoteDataSource.updateIssueStatus(
      issueId: issueId,
      status: status,
      orderIndex: orderIndex,
    );
  }
}
