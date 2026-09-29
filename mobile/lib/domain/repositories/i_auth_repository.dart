import '../entities/user_entity.dart';
import '../entities/auth_tokens_entity.dart';

abstract class IAuthRepository {
  Future<AuthTokensEntity> login({required String email, required String password});
  Future<AuthTokensEntity> register({required String fullName, required String email, required String password});
  Future<UserEntity> getCurrentUser();
  Future<void> logout();
  Future<bool> isLoggedIn();
}
