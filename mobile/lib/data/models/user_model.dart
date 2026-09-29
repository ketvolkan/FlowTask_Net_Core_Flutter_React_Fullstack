import '../../domain/entities/user_entity.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.id,
    required super.email,
    required super.fullName,
    super.avatarUrl,
    super.jobTitle,
    super.department,
    required super.role,
    super.isSystemAdmin = false,
    super.roles = const [],
    required super.isActive,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    List<String> rolesList = [];
    if (json['roles'] is List) {
      rolesList = (json['roles'] as List).map((e) => e.toString()).toList();
    } else if (json['role'] != null) {
      rolesList = [json['role'].toString()];
    }

    return UserModel(
      id: json['id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      fullName: json['fullName'] as String? ?? '',
      avatarUrl: json['avatarUrl'] as String?,
      jobTitle: json['jobTitle'] as String?,
      department: json['department'] as String?,
      role: json['role'] as String? ?? (rolesList.isNotEmpty ? rolesList.first : 'Member'),
      isSystemAdmin: json['isSystemAdmin'] as bool? ?? false,
      roles: rolesList,
      isActive: json['isActive'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'avatarUrl': avatarUrl,
      'jobTitle': jobTitle,
      'department': department,
      'role': role,
      'isSystemAdmin': isSystemAdmin,
      'roles': roles,
      'isActive': isActive,
    };
  }
}
