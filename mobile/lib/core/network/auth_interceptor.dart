import 'package:dio/dio.dart';
import '../storage/secure_storage_service.dart';
import '../constants/api_endpoints.dart';

class AuthInterceptor extends Interceptor {
  final SecureStorageService storageService;
  final Dio dio;

  AuthInterceptor({
    required this.storageService,
    required this.dio,
  });

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await storageService.getToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    options.headers['Content-Type'] = 'application/json';
    options.headers['Accept'] = 'application/json';
    return handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      final refreshToken = await storageService.getRefreshToken();
      final currentToken = await storageService.getToken();

      if (refreshToken != null && currentToken != null) {
        try {
          final response = await dio.post(
            '${ApiEndpoints.baseUrl}${ApiEndpoints.refreshToken}',
            data: {
              'token': currentToken,
              'refreshToken': refreshToken,
            },
            options: Options(
              headers: {
                'Content-Type': 'application/json',
              },
            ),
          );

          if (response.statusCode == 200 && response.data != null) {
            final data = response.data['data'] ?? response.data;
            final newToken = data['token'] as String;
            final newRefreshToken = data['refreshToken'] as String;

            await storageService.saveTokens(
              token: newToken,
              refreshToken: newRefreshToken,
            );

            final originalOptions = err.requestOptions;
            originalOptions.headers['Authorization'] = 'Bearer $newToken';

            final cloneReq = await dio.fetch(originalOptions);
            return handler.resolve(cloneReq);
          }
        } catch (_) {
          await storageService.clearAll();
        }
      }
    }
    return handler.next(err);
  }
}
