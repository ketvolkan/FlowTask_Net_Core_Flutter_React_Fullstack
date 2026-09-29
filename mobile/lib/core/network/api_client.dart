import 'package:dio/dio.dart';
import '../constants/api_endpoints.dart';
import '../storage/secure_storage_service.dart';
import 'auth_interceptor.dart';

class ApiClient {
  final Dio dio;

  ApiClient({required SecureStorageService storageService})
      : dio = Dio(
          BaseOptions(
            baseUrl: ApiEndpoints.baseUrl,
            connectTimeout: const Duration(seconds: 15),
            receiveTimeout: const Duration(seconds: 15),
            sendTimeout: const Duration(seconds: 15),
          ),
        ) {
    dio.interceptors.add(
      AuthInterceptor(
        storageService: storageService,
        dio: Dio(BaseOptions(baseUrl: ApiEndpoints.baseUrl)),
      ),
    );
  }
}
