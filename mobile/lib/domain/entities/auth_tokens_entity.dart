import 'package:equatable/equatable.dart';
import 'user_entity.dart';

class AuthTokensEntity extends Equatable {
  final String token;
  final String refreshToken;
  final DateTime? expiresAt;
  final UserEntity user;

  const AuthTokensEntity({
    required this.token,
    required this.refreshToken,
    this.expiresAt,
    required this.user,
  });

  @override
  List<Object?> get props => [token, refreshToken, expiresAt, user];
}
