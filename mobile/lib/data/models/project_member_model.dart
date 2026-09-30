import '../../domain/entities/project_member_entity.dart';

class ProjectMemberModel extends ProjectMemberEntity {
  const ProjectMemberModel({
    required super.id,
    required super.projectId,
    required super.userId,
    required super.email,
    required super.fullName,
    super.avatarUrl,
    required super.role,
    required super.joinedAt,
  });

  factory ProjectMemberModel.fromJson(Map<String, dynamic> json) {
    String fullName = json['fullName']?.toString() ?? '';
    String email = json['email']?.toString() ?? '';
    String? avatarUrl = json['avatarUrl']?.toString();
    if (json['user'] is Map) {
      final userMap = json['user'] as Map;
      if (fullName.isEmpty) fullName = userMap['fullName']?.toString() ?? '';
      if (email.isEmpty) email = userMap['email']?.toString() ?? '';
      avatarUrl ??= userMap['avatarUrl']?.toString();
    }

    return ProjectMemberModel(
      id: json['id']?.toString() ?? '',
      projectId: json['projectId']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      email: email,
      fullName: fullName,
      avatarUrl: avatarUrl,
      role: json['role']?.toString() ?? 'Member',
      joinedAt: json['joinedAt'] != null
          ? (DateTime.tryParse(json['joinedAt'].toString()) ?? DateTime.now())
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'projectId': projectId,
      'userId': userId,
      'email': email,
      'fullName': fullName,
      'avatarUrl': avatarUrl,
      'role': role,
      'joinedAt': joinedAt.toIso8601String(),
    };
  }
}
