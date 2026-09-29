import 'package:dio/dio.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/errors/server_exception.dart';
import '../../core/network/api_client.dart';
import '../models/notification_model.dart';

class NotificationRemoteDataSource {
  final ApiClient client;

  NotificationRemoteDataSource({required this.client});

  Future<List<NotificationModel>> getNotifications() async {
    try {
      final response = await client.dio.get(ApiEndpoints.notifications);
      final list = (response.data['data'] ?? response.data) as List;
      return list.map((json) => NotificationModel.fromJson(json as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to load notifications',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      await client.dio.put(ApiEndpoints.markNotificationRead(id));
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to mark notification as read',
        statusCode: e.response?.statusCode,
      );
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await client.dio.put(ApiEndpoints.markAllNotificationsRead);
    } on DioException catch (e) {
      throw ServerException(
        message: e.response?.data?['message'] ?? 'Failed to mark all as read',
        statusCode: e.response?.statusCode,
      );
    }
  }
}
