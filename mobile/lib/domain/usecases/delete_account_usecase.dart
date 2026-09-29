import '../repositories/i_auth_repository.dart';

class DeleteAccountUseCase {
  final IAuthRepository repository;

  DeleteAccountUseCase({required this.repository});

  Future<void> call() async {
    return await repository.deleteAccount();
  }
}
