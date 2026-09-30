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
    UserModel user;
    if (json['user'] is Map) {
      user = UserModel.fromJson(Map<String, dynamic>.from(json['user'] as Map));
    } else {
      user = UserModel(
        id: json['userId']?.toString() ?? '',
        email: json['email']?.toString() ?? '',
        fullName: json['fullName']?.toString() ?? '',
        role: json['role']?.toString() ?? 'Member',
        isActive: true,
      );
    }

    return AuthTokensModel(
      token: (json['token'] ?? json['accessToken'])?.toString() ?? '',
      refreshToken: json['refreshToken']?.toString() ?? '',
      expiresAt: json['expiresAt'] != null ? DateTime.tryParse(json['expiresAt'].toString()) : null,
      user: user,
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
