import '../entities/comment_entity.dart';

abstract class ICommentRepository {
  Future<List<CommentEntity>> getCommentsByIssue(String issueId);
  Future<CommentEntity> addComment({required String issueId, required String content});
  Future<void> deleteComment(String commentId);
}
