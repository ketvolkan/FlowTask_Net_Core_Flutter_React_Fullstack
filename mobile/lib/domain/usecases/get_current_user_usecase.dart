import '../entities/user_entity.dart';
import '../repositories/i_auth_repository.dart';

class GetCurrentUserUseCase {
  final IAuthRepository repository;

  GetCurrentUserUseCase({required this.repository});

  Future<UserEntity> call() {
    return repository.getCurrentUser();
  }
}
