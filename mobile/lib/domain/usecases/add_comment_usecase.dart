import '../entities/comment_entity.dart';
import '../repositories/i_comment_repository.dart';

class AddCommentUseCase {
  final ICommentRepository repository;

  AddCommentUseCase({required this.repository});

  Future<CommentEntity> call({required String issueId, required String content}) {
    return repository.addComment(issueId: issueId, content: content);
  }
}
