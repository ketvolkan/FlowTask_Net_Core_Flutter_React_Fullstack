import '../entities/comment_entity.dart';
import '../repositories/i_comment_repository.dart';

class GetCommentsUseCase {
  final ICommentRepository repository;

  GetCommentsUseCase({required this.repository});

  Future<List<CommentEntity>> call(String issueId) {
    return repository.getCommentsByIssue(issueId);
  }
}
