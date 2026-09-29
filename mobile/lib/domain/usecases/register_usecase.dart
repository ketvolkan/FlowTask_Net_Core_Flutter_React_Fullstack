import '../entities/auth_tokens_entity.dart';
import '../repositories/i_auth_repository.dart';

class RegisterUseCase {
  final IAuthRepository repository;

  RegisterUseCase({required this.repository});

  Future<AuthTokensEntity> call({
    required String fullName,
    required String email,
    required String password,
  }) {
    return repository.register(fullName: fullName, email: email, password: password);
  }
}
