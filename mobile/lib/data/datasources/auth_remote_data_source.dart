import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/errors/server_exception.dart';
import '../../core/network/api_client.dart';
import '../models/auth_tokens_model.dart';
import '../models/user_model.dart';

class AuthRemoteDataSource {
  final ApiClient client;

  AuthRemoteDataSource({required this.client});

  Future<AuthTokensModel> login({required String email, required String password}) async {
    try {
      final response = await client.dio.post(
        ApiEndpoints.login,
        data: {'email': email, 'password': password},
      );
      final data = response.data['data'] ?? response.data;
      return AuthTokensModel.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Login failed',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<AuthTokensModel> register({
    required String fullName,
    required String email,
    required String password,
  }) async {
    try {
      final response = await client.dio.post(
        ApiEndpoints.register,
        data: {
          'fullName': fullName,
          'email': email,
          'password': password,
        },
      );
      final data = response.data['data'] ?? response.data;
      return AuthTokensModel.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Registration failed',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<UserModel> getCurrentUser() async {
    try {
      final response = await client.dio.get(ApiEndpoints.me);
      final data = response.data['data'] ?? response.data;
      return UserModel.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to fetch user',
        statusCode: e.response?.statusCode,
      );
    }
  }
}
