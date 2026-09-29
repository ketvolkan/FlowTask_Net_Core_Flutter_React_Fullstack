import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/errors/server_exception.dart';
import '../../core/network/api_client.dart';
import '../../core/network/response_parser.dart';
import '../models/comment_model.dart';

class CommentRemoteDataSource {
  final ApiClient client;

  CommentRemoteDataSource({required this.client});

  Future<List<CommentModel>> getCommentsByIssue(String issueId) async {
    try {
      final response = await client.dio.get(ApiEndpoints.issueComments(issueId));
      final list = ResponseParser.extractList(response.data);
      return list
          .whereType<Map<String, dynamic>>()
          .map((json) => CommentModel.fromJson(json))
          .toList();
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to load comments',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<CommentModel> addComment({required String issueId, required String content}) async {
    try {
      final response = await client.dio.post(
        ApiEndpoints.issueComments(issueId),
        data: {'content': content},
      );
      final data = ResponseParser.extractMap(response.data);
      return CommentModel.fromJson(data);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to add comment',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<void> deleteComment(String commentId) async {
    try {
      await client.dio.delete('/comments/$commentId');
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to delete comment',
        statusCode: e.response?.statusCode,
      );
    }
  }
}
