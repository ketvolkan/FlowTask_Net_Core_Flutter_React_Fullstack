import 'package:equatable/equatable.dart';

class ProjectEntity extends Equatable {
  final String id;
  final String name;
  final String key;
  final String? description;
  final String ownerId;
  final String? ownerName;
  final int memberCount;
  final int issueCount;
  final DateTime createdAt;

  const ProjectEntity({
    required this.id,
    required this.name,
    required this.key,
    this.description,
    required this.ownerId,
    this.ownerName,
    this.memberCount = 0,
    this.issueCount = 0,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        name,
        key,
        description,
        ownerId,
        ownerName,
        memberCount,
        issueCount,
        createdAt,
      ];
}
