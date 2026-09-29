import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/errors/server_exception.dart';
import '../../core/network/api_client.dart';
import '../models/project_model.dart';
import '../models/project_member_model.dart';

class ProjectRemoteDataSource {
  final ApiClient client;

  ProjectRemoteDataSource({required this.client});

  Future<List<ProjectModel>> getProjects() async {
    try {
      final response = await client.dio.get(ApiEndpoints.projects);
      final list = (response.data['data'] ?? response.data) as List;
      return list.map((json) => ProjectModel.fromJson(json as Map<String, dynamic>)).toList();
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
      final data = response.data['data'] ?? response.data;
      return ProjectModel.fromJson(data as Map<String, dynamic>);
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
      final data = response.data['data'] ?? response.data;
      return ProjectModel.fromJson(data as Map<String, dynamic>);
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
      final list = (response.data['data'] ?? response.data) as List;
      return list.map((json) => ProjectMemberModel.fromJson(json as Map<String, dynamic>)).toList();
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
