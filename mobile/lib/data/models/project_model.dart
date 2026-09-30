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
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      key: json['key']?.toString() ?? '',
      description: json['description']?.toString(),
      ownerId: json['ownerId']?.toString() ?? '',
      ownerName: json['ownerName']?.toString(),
      memberCount: json['memberCount'] is num
          ? (json['memberCount'] as num).toInt()
          : (json['members'] is List ? (json['members'] as List).length : 0),
      issueCount: json['issueCount'] is num
          ? (json['issueCount'] as num).toInt()
          : (json['issues'] is List ? (json['issues'] as List).length : 0),
      createdAt: json['createdAt'] != null
          ? (DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now())
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
