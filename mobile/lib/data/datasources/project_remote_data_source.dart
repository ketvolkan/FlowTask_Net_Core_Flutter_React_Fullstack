import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/errors/server_exception.dart';
import '../../core/network/api_client.dart';
import '../../core/network/response_parser.dart';
import '../models/project_model.dart';
import '../models/project_member_model.dart';

class ProjectRemoteDataSource {
  final ApiClient client;

  ProjectRemoteDataSource({required this.client});

  Future<List<ProjectModel>> getProjects() async {
    try {
      final response = await client.dio.get(
        ApiEndpoints.projects,
        queryParameters: {'page': 1, 'pageSize': 100},
      );
      final list = ResponseParser.extractList(response.data);
      return list
          .whereType<Map>()
          .map((json) => ProjectModel.fromJson(Map<String, dynamic>.from(json)))
          .toList();
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to load projects',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<ProjectModel> getProjectById(String id) async {
    try {
      final response = await client.dio.get(ApiEndpoints.projectById(id));
      final data = ResponseParser.extractMap(response.data);
      return ProjectModel.fromJson(data);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to load project',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<ProjectModel> createProject({
    required String name,
    required String key,
    String? description,
  }) async {
    try {
      final response = await client.dio.post(
        ApiEndpoints.projects,
        data: {
          'name': name,
          'key': key,
          'description': description,
        },
      );
      final data = ResponseParser.extractMap(response.data);
      return ProjectModel.fromJson(data);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to create project',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<List<ProjectMemberModel>> getProjectMembers(String projectId) async {
    try {
      final response = await client.dio.get(ApiEndpoints.projectMembers(projectId));
      final list = ResponseParser.extractList(response.data);
      return list
          .whereType<Map>()
          .map((json) => ProjectMemberModel.fromJson(Map<String, dynamic>.from(json)))
          .toList();
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to load members',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<void> addProjectMember({
    required String projectId,
    required String userId,
    required String role,
  }) async {
    try {
      await client.dio.post(
        ApiEndpoints.projectMembers(projectId),
        data: {
          'userId': userId,
          'role': role,
        },
      );
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to add member',
        statusCode: e.response?.statusCode,
      );
    }
  }
}
