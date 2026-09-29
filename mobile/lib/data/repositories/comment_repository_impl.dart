import '../../domain/entities/comment_entity.dart';
import '../../domain/repositories/i_comment_repository.dart';
import '../datasources/comment_remote_data_source.dart';

class CommentRepositoryImpl implements ICommentRepository {
  final CommentRemoteDataSource remoteDataSource;

  CommentRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<CommentEntity>> getCommentsByIssue(String issueId) async {
    return await remoteDataSource.getCommentsByIssue(issueId);
  }

  @override
  Future<CommentEntity> addComment({required String issueId, required String content}) async {
    return await remoteDataSource.addComment(issueId: issueId, content: content);
  }

  @override
  Future<void> deleteComment(String commentId) async {
    await remoteDataSource.deleteComment(commentId);
  }
}
