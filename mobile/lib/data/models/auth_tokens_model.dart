import '../../domain/entities/auth_tokens_entity.dart';
import 'user_model.dart';

class AuthTokensModel extends AuthTokensEntity {
  const AuthTokensModel({
    required super.token,
    required super.refreshToken,
    super.expiresAt,
    required super.user,
  });

  factory AuthTokensModel.fromJson(Map<String, dynamic> json) {
    return AuthTokensModel(
      token: json['token'] as String? ?? '',
      refreshToken: json['refreshToken'] as String? ?? '',
      expiresAt: json['expiresAt'] != null ? DateTime.tryParse(json['expiresAt'] as String) : null,
      user: json['user'] != null
          ? UserModel.fromJson(json['user'] as Map<String, dynamic>)
          : UserModel(
              id: json['userId'] as String? ?? '',
              email: json['email'] as String? ?? '',
              fullName: json['fullName'] as String? ?? '',
              role: json['role'] as String? ?? 'Member',
              isActive: true,
            ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'token': token,
      'refreshToken': refreshToken,
      'expiresAt': expiresAt?.toIso8601String(),
      'user': (user as UserModel).toJson(),
    };
  }
}
