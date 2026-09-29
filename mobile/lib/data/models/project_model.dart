import '../../domain/entities/project_entity.dart';

class ProjectModel extends ProjectEntity {
  const ProjectModel({
    required super.id,
    required super.name,
    required super.key,
    super.description,
    required super.ownerId,
    super.ownerName,
    super.memberCount,
    super.issueCount,
    required super.createdAt,
  });

  factory ProjectModel.fromJson(Map<String, dynamic> json) {
    return ProjectModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      key: json['key'] as String? ?? '',
      description: json['description'] as String?,
      ownerId: json['ownerId'] as String? ?? '',
      ownerName: json['ownerName'] as String?,
      memberCount: json['memberCount'] as int? ?? (json['members'] as List?)?.length ?? 0,
      issueCount: json['issueCount'] as int? ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'key': key,
      'description': description,
      'ownerId': ownerId,
      'ownerName': ownerName,
      'memberCount': memberCount,
      'issueCount': issueCount,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
