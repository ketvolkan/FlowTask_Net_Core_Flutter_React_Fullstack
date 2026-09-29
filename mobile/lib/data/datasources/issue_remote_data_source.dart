import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/errors/server_exception.dart';
import '../../core/network/api_client.dart';
import '../models/issue_model.dart';

class IssueRemoteDataSource {
  final ApiClient client;

  IssueRemoteDataSource({required this.client});

  Future<List<IssueModel>> getIssuesByProject(String projectId) async {
    try {
      final response = await client.dio.get(
        ApiEndpoints.issues,
        queryParameters: {'projectId': projectId},
      );
      final list = (response.data['data'] ?? response.data) as List;
      return list.map((json) => IssueModel.fromJson(json as Map<String, dynamic>)).toList();
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
      final data = response.data['data'] ?? response.data;
      return IssueModel.fromJson(data as Map<String, dynamic>);
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
        ApiEndpoints.issues,
        data: {
          'title': title,
          'description': description,
          'type': type,
          'priority': priority,
          'projectId': projectId,
          'sprintId': sprintId,
          'assigneeId': assigneeId,
          'storyPoints': storyPoints,
          'dueDate': dueDate?.toIso8601String(),
        },
      );
      final data = response.data['data'] ?? response.data;
      return IssueModel.fromJson(data as Map<String, dynamic>);
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
      await client.dio.put(
        ApiEndpoints.issueStatus(issueId),
        data: {
          'status': status,
          'orderIndex': orderIndex,
        },
      );
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to update issue status',
        statusCode: e.response?.statusCode,
      );
    }
  }
}
