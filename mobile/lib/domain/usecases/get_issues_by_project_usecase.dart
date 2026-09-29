import '../entities/issue_entity.dart';
import '../repositories/i_issue_repository.dart';

class GetIssuesByProjectUseCase {
  final IIssueRepository repository;

  GetIssuesByProjectUseCase({required this.repository});

  Future<List<IssueEntity>> call(String projectId) {
    return repository.getIssuesByProject(projectId);
  }
}
