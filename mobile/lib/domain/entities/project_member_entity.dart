import 'package:equatable/equatable.dart';

class ProjectMemberEntity extends Equatable {
  final String id;
  final String projectId;
  final String userId;
  final String email;
  final String fullName;
  final String? avatarUrl;
  final String role;
  final DateTime joinedAt;

  const ProjectMemberEntity({
    required this.id,
    required this.projectId,
    required this.userId,
    required this.email,
    required this.fullName,
    this.avatarUrl,
    required this.role,
    required this.joinedAt,
  });

  @override
  List<Object?> get props => [
        id,
        projectId,
        userId,
        email,
        fullName,
        avatarUrl,
        role,
        joinedAt,
      ];
}
