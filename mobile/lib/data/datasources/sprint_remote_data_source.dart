import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/errors/server_exception.dart';
import '../../core/network/api_client.dart';
import '../../core/network/response_parser.dart';
import '../models/sprint_model.dart';

class SprintRemoteDataSource {
  final ApiClient client;

  SprintRemoteDataSource({required this.client});

  Future<List<SprintModel>> getSprintsByProject(String projectId) async {
    try {
      final response = await client.dio.get(
        ApiEndpoints.sprints,
        queryParameters: {'projectId': projectId},
      );
      final list = ResponseParser.extractList(response.data);
      return list
          .whereType<Map<String, dynamic>>()
          .map((json) => SprintModel.fromJson(json))
          .toList();
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to load sprints',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<SprintModel> createSprint({
    required String name,
    String? goal,
    required String projectId,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      final response = await client.dio.post(
        ApiEndpoints.sprints,
        data: {
          'name': name,
          'goal': goal,
          'projectId': projectId,
          'startDate': startDate?.toIso8601String(),
          'endDate': endDate?.toIso8601String(),
        },
      );
      final data = ResponseParser.extractMap(response.data);
      return SprintModel.fromJson(data);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to create sprint',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<void> startSprint(String sprintId) async {
    try {
      await client.dio.post(ApiEndpoints.sprintStart(sprintId));
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to start sprint',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<void> completeSprint(String sprintId) async {
    try {
      await client.dio.post(ApiEndpoints.sprintComplete(sprintId));
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to complete sprint',
        statusCode: e.response?.statusCode,
      );
    }
  }
}
