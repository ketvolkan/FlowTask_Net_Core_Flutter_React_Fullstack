import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/errors/server_exception.dart';
import '../../core/network/api_client.dart';
import '../../core/network/response_parser.dart';
import '../models/issue_model.dart';

class IssueRemoteDataSource {
  final ApiClient client;

  IssueRemoteDataSource({required this.client});

  Future<List<IssueModel>> getIssuesByProject(String? projectId) async {
    try {
      final Map<String, dynamic> queryParams = {
        'page': 1,
        'pageSize': 100,
      };
      if (projectId != null && projectId.isNotEmpty && projectId != 'all') {
        queryParams['projectId'] = projectId;
      }

      final response = await client.dio.get(
        ApiEndpoints.issues,
        queryParameters: queryParams,
      );

      final list = ResponseParser.extractList(response.data);
      return list
          .whereType<Map>()
          .map((json) => IssueModel.fromJson(Map<String, dynamic>.from(json)))
          .toList();
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to load issues',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<IssueModel> getIssueById(String id) async {
    try {
      final response = await client.dio.get(ApiEndpoints.issueById(id));
      final data = ResponseParser.extractMap(response.data);
      return IssueModel.fromJson(data);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to load issue',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<IssueModel> createIssue({
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
    try {
      final response = await client.dio.post(
        '/issues/project/$projectId',
        data: {
          'title': title,
          'description': description,
          'type': type,
          'priority': priority,
          'sprintId': sprintId,
          'assigneeId': assigneeId,
          'storyPoints': storyPoints,
          'dueDate': dueDate?.toIso8601String(),
        },
      );
      final data = ResponseParser.extractMap(response.data);
      return IssueModel.fromJson(data);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to create issue',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<void> updateIssueStatus({
    required String issueId,
    required String status,
    required int orderIndex,
  }) async {
    try {
      await client.dio.patch(
        ApiEndpoints.issueStatus(issueId),
        data: {
          'status': status,
          'order': orderIndex,
        },
      );
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to update issue status',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<void> deleteIssue(String issueId) async {
    try {
      await client.dio.delete(ApiEndpoints.issueById(issueId));
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to delete issue',
        statusCode: e.response?.statusCode,
      );
    }
  }
}
