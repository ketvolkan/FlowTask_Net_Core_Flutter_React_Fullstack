import '../../core/storage/secure_storage_service.dart';
import '../../domain/entities/auth_tokens_entity.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/i_auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';

class AuthRepositoryImpl implements IAuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final SecureStorageService storageService;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.storageService,
  });

  @override
  Future<AuthTokensEntity> login({required String email, required String password}) async {
    final tokens = await remoteDataSource.login(email: email, password: password);
    await storageService.saveTokens(
      token: tokens.token,
      refreshToken: tokens.refreshToken,
    );
    return tokens;
  }

  @override
  Future<AuthTokensEntity> register({
    required String fullName,
    required String email,
    required String password,
  }) async {
    final tokens = await remoteDataSource.register(
      fullName: fullName,
      email: email,
      password: password,
    );
    await storageService.saveTokens(
      token: tokens.token,
      refreshToken: tokens.refreshToken,
    );
    return tokens;
  }

  @override
  Future<UserEntity> getCurrentUser() async {
    return await remoteDataSource.getCurrentUser();
  }

  @override
  Future<void> logout() async {
    await storageService.clearAll();
  }

  @override
  Future<bool> isLoggedIn() async {
    final token = await storageService.getToken();
    return token != null && token.isNotEmpty;
  }
}
