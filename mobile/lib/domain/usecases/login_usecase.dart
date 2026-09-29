import '../entities/auth_tokens_entity.dart';
import '../repositories/i_auth_repository.dart';

class LoginUseCase {
  final IAuthRepository repository;

  LoginUseCase({required this.repository});

  Future<AuthTokensEntity> call({required String email, required String password}) {
    return repository.login(email: email, password: password);
  }
}
