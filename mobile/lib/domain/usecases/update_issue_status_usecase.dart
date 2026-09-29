import '../repositories/i_issue_repository.dart';

class UpdateIssueStatusUseCase {
  final IIssueRepository repository;

  UpdateIssueStatusUseCase({required this.repository});

  Future<void> call({required String issueId, required String status, required int orderIndex}) {
    return repository.updateIssueStatus(issueId: issueId, status: status, orderIndex: orderIndex);
  }
}
